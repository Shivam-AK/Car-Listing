"use server";

import { getAdminUser } from "@/lib/auth";
import DB from "@/lib/prisma.db";
import { revalidatePath } from "next/cache";

export async function getDealerships() {
  try {
    const user = await getAdminUser();
    if (user instanceof Error) throw user;

    // Get all dealerships
    const dealerships = await DB.dealershipInfo.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            imageUrl: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: dealerships.map((dealership) => ({
        ...dealership,
        createdAt: dealership.createdAt.toISOString(),
        updatedAt: dealership.updatedAt.toISOString(),
      })),
    };
  } catch (error) {
    throw new Error("Error Fetching Dealerships : " + error.message);
  }
}

export async function deleteDealership(dealershipId) {
  try {
    const user = await getAdminUser();
    if (user instanceof Error) throw user;

    // Delete Dealership
    await DB.dealershipInfo.delete({
      where: { id: dealershipId },
    });

    // Revalidate paths
    revalidatePath("/admin/users");

    return {
      success: true,
    };
  } catch (error) {
    throw new Error("Error Deleting Dealership : " + error.message);
  }
}

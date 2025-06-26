"use server";

import { getAdminUser } from "@/lib/auth";
import DB from "@/lib/prisma.db";

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

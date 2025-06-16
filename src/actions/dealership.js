"use server";

import DB from "@/lib/prisma.db";
import { auth } from "@clerk/nextjs/server";

export async function getDealerships() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized User.");

    const adminUser = await DB.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!adminUser) throw new Error("Admin User Not Found.");

    // Check if user is admin
    if (adminUser.role !== "ADMIN") {
      throw new Error("Unauthorized: Admin access required.");
    }

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

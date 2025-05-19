"use server";

import DB from "@/lib/prisma.db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getUsers() {
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

    // Get all users
    const users = await DB.user.findMany({
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: users.map((user) => ({
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      })),
    };
  } catch (error) {
    throw new Error("Error fetching users : " + error.message);
  }
}

export async function updateUserRole(userId, role) {
  try {
    const { userId: adminId } = await auth();
    if (!adminId) throw new Error("Unauthorized User.");

    const adminUser = await DB.user.findUnique({
      where: { clerkUserId: adminId },
    });

    if (!adminUser) throw new Error("Admin User Not Found.");

    // Check if user is admin
    if (adminUser.role !== "ADMIN") {
      throw new Error("Unauthorized: Admin access required.");
    }

    // Update user role
    await DB.user.update({
      where: { id: userId },
      data: role,
    });

    // Revalidate paths
    revalidatePath("/admin/users");

    return {
      success: true,
    };
  } catch (error) {
    throw new Error("Error updating user role : " + error.message);
  }
}

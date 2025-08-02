"use server";

import { getAdminUser } from "@/lib/auth";
import DB from "@/lib/prisma.db";
import { revalidatePath } from "next/cache";

export async function getUsers() {
  try {
    const user = await getAdminUser();
    if (user instanceof Error) throw user;

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
    const user = await getAdminUser();
    if (user instanceof Error) throw user;

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

export async function deleteUser(userId) {
  try {
    const user = await getAdminUser();
    if (user instanceof Error) throw user;

    // Delete user
    await DB.user.delete({
      where: { id: userId },
    });

    // Revalidate paths
    revalidatePath("/admin/users");

    return {
      success: true,
    };
  } catch (error) {
    throw new Error("Error Deleting User : " + error.message);
  }
}

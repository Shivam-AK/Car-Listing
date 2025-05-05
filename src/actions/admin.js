"use server";

import DB from "@/lib/prisma.db";
import { auth } from "@clerk/nextjs/server";

export async function getAdmin() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized User.");

  const user = await DB.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user || user.role !== "ADMIN") {
    return { authorized: false, reason: "Not-Admin" };
  }

  return { authorized: true, user };
}

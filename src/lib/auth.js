import { auth } from "@clerk/nextjs/server";
import DB from "./prisma.db";

export async function getLoggedInUser() {
  const { userId } = await auth();
  if (!userId) return new Error("Unauthorized User.");

  const user = await DB.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) return new Error("User Not Found.");

  return user;
}

export async function getAdminUser() {
  const user = await getLoggedInUser();
  if (user instanceof Error) return user;

  if (user.role !== "ADMIN") {
    return new Error("Unauthorized: Admin access required.");
  }

  return user;
}

export async function getBothUser() {
  const user = await getLoggedInUser();
  if (user instanceof Error) return user;

  if (!(user.role === "DEALERSHIP" || user.role === "ADMIN")) {
    return new Error("Unauthorized: Admin access required.");
  }

  return user;
}

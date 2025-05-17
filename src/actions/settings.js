"use server";

import DB from "@/lib/prisma.db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getDealershipInfo() {
  try {
    // Check is Authorized
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized User.");

    const user = await DB.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User Not Found");

    let dealership = await DB.dealershipInfo.findUnique({
      where: { userId: user.id },
      include: {
        workingHours: {
          orderBy: {
            dayOfWeek: "asc",
          },
        },
      },
    });

    // If no dealership exists, create a default one
    if (!dealership) {
      dealership = await DB.dealershipInfo.create({
        data: {
          workingHours: {
            create: [
              {
                dayOfWeek: "MONDAY",
                openTime: "09:00",
                closeTime: "18:00",
                isOpen: true,
              },
              {
                dayOfWeek: "TUESDAY",
                openTime: "09:00",
                closeTime: "18:00",
                isOpen: true,
              },
              {
                dayOfWeek: "WEDNESDAY",
                openTime: "09:00",
                closeTime: "18:00",
                isOpen: true,
              },
              {
                dayOfWeek: "THURSDAY",
                openTime: "09:00",
                closeTime: "18:00",
                isOpen: true,
              },
              {
                dayOfWeek: "FRIDAY",
                openTime: "09:00",
                closeTime: "18:00",
                isOpen: true,
              },
              {
                dayOfWeek: "SATURDAY",
                openTime: "10:00",
                closeTime: "16:00",
                isOpen: true,
              },
              {
                dayOfWeek: "SUNDAY",
                openTime: "10:00",
                closeTime: "16:00",
                isOpen: false,
              },
            ],
          },
        },
        include: {
          workingHours: {
            orderBy: {
              dayOfWeek: "asc",
            },
          },
        },
      });
    }

    return {
      success: true,
      data: {
        ...dealership,
        createdAt: dealership.createdAt.toISOString(),
        updatedAt: dealership.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    console.error("Error fetching dealership info:", error.message);
    throw new Error("Error fetching dealership info:", error.message);
  }
}

export async function saveWorkingHours(workingHours) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Check if user is admin
    const user = await DB.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user || user.role !== "ADMIN") {
      throw new Error("Unauthorized: Admin access required");
    }

    // Get current dealership info
    const dealership = await DB.dealershipInfo.findUnique({
      where: { userId: user.id },
    });

    if (!dealership) {
      throw new Error("Dealership info not found");
    }

    // Update working hours - first delete existing hours
    await DB.workingHour.deleteMany({
      where: { dealershipId: dealership.id },
    });

    // Then create new hours
    for (const hour of workingHours) {
      await DB.workingHour.create({
        data: {
          dayOfWeek: hour.dayOfWeek,
          openTime: hour.openTime,
          closeTime: hour.closeTime,
          isOpen: hour.isOpen,
          dealershipId: dealership.id,
        },
      });
    }

    revalidatePath("/admin/settings");
    revalidatePath("/"); // Homepage might display hours

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error saving working hours:", error.message);
    throw new Error("Error saving working hours:", error.message);
  }
}

export async function saveDealership(data) {
  console.log(data);
}

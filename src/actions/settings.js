"use server";

import { getBothUser } from "@/lib/auth";
import DB from "@/lib/prisma.db";
import { revalidatePath } from "next/cache";

export async function getDealershipInfo() {
  try {
    // Check is Authorized
    const user = await getBothUser();
    if (user instanceof Error) throw user;

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

    if (!dealership) {
      throw new Error("Please Setup Your Dealership First.");
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
    throw new Error("Error fetching dealership info : " + error.message);
  }
}

export async function saveWorkingHours(workingHours) {
  try {
    const user = await getBothUser();
    if (user instanceof Error) throw user;

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
    throw new Error("Error saving working hours : " + error.message);
  }
}

export async function saveDealership(data) {
  try {
    const user = await getBothUser();
    if (user instanceof Error) throw user;

    // Get current dealership info
    const dealership = await DB.dealershipInfo.findUnique({
      where: { userId: user.id },
    });

    if (!dealership) {
      await DB.dealershipInfo.create({
        data: {
          ...data,
          userId: user.id,
        },
      });
    } else {
      await DB.dealershipInfo.update({
        where: { userId: user.id },
        data: {
          ...data,
          userId: user.id,
        },
      });
    }

    revalidatePath("/admin/settings");
    revalidatePath("/"); // Homepage might display hours

    return {
      success: true,
    };
  } catch (error) {
    throw new Error("Error Saving Dealership : " + error.message);
  }
}

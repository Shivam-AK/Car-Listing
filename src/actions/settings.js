"use server";

import { getBothUser } from "@/lib/auth";
import DB from "@/lib/prisma.db";
import { getErrorMessage } from "@/utils/error-handling";
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
      throw "Please Setup Your Dealership First.";
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
    console.error("Error fetching dealership info : ", error);
    return {
      success: false,
      message: getErrorMessage(error),
    };
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
      throw "Dealership info not found";
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
    console.error("Error saving working hours : ", error);
    return {
      success: false,
      message: getErrorMessage(error),
    };
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
    console.error("Error Saving Dealership : ", error);
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
}

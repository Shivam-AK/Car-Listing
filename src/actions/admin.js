"use server";

import DB from "@/lib/prisma.db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

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

export async function getAdminTestDrives(search = "", status = "") {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized User.");

    const user = await DB.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user || user.role !== "ADMIN") {
      throw new Error("Unauthorized: Admin access required.");
    }

    let where = {
      car: {
        DealershipInfo: {
          userId: user.id,
        },
      },
    };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        {
          car: {
            OR: [
              { make: { contains: search, mode: "insensitive" } },
              { model: { contains: search, mode: "insensitive" } },
            ],
          },
        },
        {
          user: {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      ];
    }

    const bookings = await DB.testDriveBooking.findMany({
      where,
      include: {
        car: {
          select: {
            id: true,
            images: true,
            year: true,
            make: true,
            model: true,
            DealershipInfo: {
              select: {
                name: true,
                userId: true,
              },
            },
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: [{ bookingDate: "desc" }, { startTime: "asc" }],
    });

    const formattedBookings = bookings.map((booking) => ({
      id: booking.id,
      carId: booking.carId,
      car: booking.car,
      userId: booking.userId,
      user: booking.user,
      bookingDate: booking.bookingDate.toISOString(),
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status,
      notes: booking.notes,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
    }));

    return {
      success: true,
      data: formattedBookings,
    };
  } catch (error) {
    throw new Error("Error fetching test drives : " + error.message);
  }
}

export async function updateTestDriveStatus(bookingId, newStatus) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized User.");

    const user = await DB.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user || user.role !== "ADMIN") {
      throw new Error("Unauthorized: Admin access required.");
    }

    const booking = await DB.testDriveBooking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new Error("Booking Not Found.");
    }

    const validStatuses = [
      "PENDING",
      "CONFIRMED",
      "COMPLETED",
      "CANCELLED",
      "NO_SHOW",
    ];

    if (!validStatuses.includes(newStatus)) {
      throw new Error("Please Enter Valid Status Name.");
    }

    await DB.testDriveBooking.update({
      where: { id: bookingId },
      data: { status: newStatus },
    });

    revalidatePath("/admin/test-drives");
    revalidatePath("/reservations");

    return {
      success: true,
      message: "Test Drive Status Updated successfully.",
    };
  } catch (error) {
    throw new Error("Error Updating Test Drive Status : " + error.message);
  }
}

export async function getDashboardData() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized User.");

    const user = await DB.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user || user.role !== "ADMIN") {
      throw new Error("Unauthorized: Admin access required.");
    }

    const [cars, testDrives] = await Promise.all([
      // Get all cars with minimal fields
      DB.car.findMany({
        where: {
          DealershipInfo: {
            userId: user.id,
          },
        },
        select: {
          id: true,
          status: true,
          featured: true,
          DealershipInfo: {
            select: {
              name: true,
              userId: true,
            },
          },
        },
      }),

      // Get all test drives with minimal fields
      DB.testDriveBooking.findMany({
        where: {
          car: {
            DealershipInfo: {
              userId: user.id,
            },
          },
        },
        select: {
          id: true,
          status: true,
          carId: true,
          car: {
            select: {
              DealershipInfo: {
                select: {
                  name: true,
                  userId: true,
                },
              },
            },
          },
        },
      }),
    ]);

    // Total car statistics
    const totalCars = cars.length;
    const availableCars = cars.filter(
      (car) => car.status === "AVAILABLE"
    ).length;
    const unavailableCars = cars.filter(
      (car) => car.status === "UNAVAILABLE"
    ).length;
    const soldCars = cars.filter((car) => car.status === "SOLD").length;
    const featuredCars = cars.filter((car) => car.featured === true).length;

    // Total Test Drive Booking statistics
    const totalTestDrives = testDrives.length;
    const pendingTestDrives = testDrives.filter(
      (booking) => booking.status === "PENDING"
    ).length;
    const confirmedTestDrives = testDrives.filter(
      (booking) => booking.status === "CONFIRMED"
    ).length;
    const completedTestDrives = testDrives.filter(
      (booking) => booking.status === "COMPLETED"
    ).length;
    const cancelledTestDrives = testDrives.filter(
      (booking) => booking.status === "CANCELLED"
    ).length;
    const noShowTestDrives = testDrives.filter(
      (booking) => booking.status === "NO_SHOW"
    ).length;

    const completedTestDriveCarIds = testDrives
      .filter((booking) => booking.status === "COMPLETED")
      .map((booking) => booking.carId);

    const soldCarsAfterTestDrive = cars.filter(
      (car) =>
        car.status === "SOLD" && completedTestDriveCarIds.includes(car.id)
    ).length;

    const conversionRate =
      completedTestDrives > 0
        ? (soldCarsAfterTestDrive / completedTestDrives) * 100
        : 0;

    return {
      success: true,
      data: {
        cars: {
          total: totalCars,
          available: availableCars,
          sold: soldCars,
          unavailable: unavailableCars,
          featured: featuredCars,
        },
        testDrives: {
          total: totalTestDrives,
          pending: pendingTestDrives,
          confirmed: confirmedTestDrives,
          completed: completedTestDrives,
          cancelled: cancelledTestDrives,
          noShow: noShowTestDrives,
          conversionRate: parseFloat(conversionRate.toFixed(2)),
        },
      },
    };
  } catch (error) {
    throw new Error("Error Fetching Dashboard Data : " + error.message);
  }
}

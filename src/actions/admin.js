"use server";

import { getBothUser, getLoggedInUser } from "@/lib/auth";
import DB from "@/lib/prisma.db";
import { revalidatePath } from "next/cache";

export async function getAdmin() {
  const user = await getLoggedInUser();
  if (user instanceof Error) throw user;

  if (!(user.role === "DEALERSHIP" || user.role === "ADMIN")) {
    return { authorized: false, reason: "Not-Admin" };
  }

  return { authorized: true, user };
}

export async function getAdminTestDrives(status = "", filter) {
  try {
    const user = await getBothUser();
    if (user instanceof Error) throw user;

    let where = {};

    if (user.role === "DEALERSHIP" || filter === undefined) {
      where.car = {
        dealership: {
          userId: user.id,
        },
      };
    } else {
      if (filter !== "all-dealership") {
        where.car = {
          dealership: {
            userId: filter,
          },
        };
      }
    }

    if (status) {
      where.status = status;
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
            dealership: {
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
    const user = await getBothUser();
    if (user instanceof Error) throw user;

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

export async function getDashboardData(filter) {
  try {
    const user = await getBothUser();
    if (user instanceof Error) throw user;

    const whereCar = {};
    const whereTestDrive = {};

    if (user.role === "DEALERSHIP" || filter === undefined) {
      whereCar.dealership = {
        userId: user.id,
      };
      whereTestDrive.car = {
        dealership: {
          userId: user.id,
        },
      };
    } else {
      if (filter !== "all-dealership") {
        whereCar.dealership = {
          userId: filter,
        };
        whereTestDrive.car = {
          dealership: {
            userId: filter,
          },
        };
      }
    }

    const dbCalls = [
      // Get all cars with minimal fields
      DB.car.findMany({
        where: whereCar,
        select: {
          id: true,
          status: true,
          featured: true,
          dealership: {
            select: {
              name: true,
              userId: true,
            },
          },
        },
      }),

      // Get all test drives with minimal fields
      DB.testDriveBooking.findMany({
        where: whereTestDrive,
        select: {
          id: true,
          status: true,
          carId: true,
          car: {
            select: {
              dealership: {
                select: {
                  name: true,
                  userId: true,
                },
              },
            },
          },
        },
      }),
    ];

    if (user.role === "ADMIN") {
      dbCalls.push(
        DB.dealershipInfo.findMany({
          select: {
            id: true,
            name: true,
            email: true,
            user: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
          orderBy: { name: "asc" },
        })
      );
    }

    const [cars, testDrives, dealership] = await Promise.all(dbCalls);

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
        dealership,
        currentDealership: dealership?.find((item) => item.user.id === user.id),
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

export async function getAllDealerships() {
  try {
    const user = await getLoggedInUser();
    if (user instanceof Error) throw user;

    // Check if user is admin
    if (user.role !== "ADMIN") {
      return {
        success: false,
        data: { dealerships: undefined, currentDealership: undefined },
      };
    }

    // Get all dealerships
    const dealerships = await DB.dealershipInfo.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return {
      success: true,
      data: {
        dealerships,
        currentDealership: dealerships?.find(
          (item) => item.user.id === user.id
        ),
      },
    };
  } catch (error) {
    throw new Error("Error Fetch All Dealerships : " + error.message);
  }
}

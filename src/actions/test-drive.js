"use server";

import { serializeCarData } from "@/lib/helper";
import DB from "@/lib/prisma.db";
import { getErrorMessage } from "@/utils/error-handling";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function bookTestDrive(
  carId,
  bookingDate,
  startTime,
  endTime,
  notes
) {
  try {
    const { userId } = await auth();
    if (!userId) throw "You must be logged in to Book a Test Drive.";

    const user = await DB.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw "User Not Found.";

    const car = await DB.car.findUnique({
      where: { id: carId, status: "AVAILABLE" },
    });

    if (!car) throw "Car not available for Test Drive.";

    const existingBooking = await DB.testDriveBooking.findFirst({
      where: {
        carId,
        bookingDate: new Date(bookingDate),
        startTime,
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    });

    if (existingBooking) {
      throw "This time slot is already booked. Please select another time.";
    }

    const booking = await DB.testDriveBooking.create({
      data: {
        carId,
        userId: user.id,
        bookingDate: new Date(bookingDate),
        startTime,
        endTime,
        notes: notes || null,
        status: "PENDING",
      },
    });

    revalidatePath(`/test-drive/${carId}`);
    revalidatePath(`/cars/${carId}`);

    return {
      success: true,
      data: booking,
    };
  } catch (error) {
    console.error("Error Booking test drive : ", error);
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
}

export async function getUserTestDrives() {
  try {
    const { userId } = await auth();
    if (!userId) throw "You must be logged in to show a Test Drive.";

    const user = await DB.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw "User Not Found.";

    const bookings = await DB.testDriveBooking.findMany({
      where: { userId: user.id },
      include: {
        car: true,
      },
      orderBy: { bookingDate: "desc" },
    });

    const formattedBookings = bookings.map((booking) => ({
      id: booking.id,
      carId: booking.carId,
      car: serializeCarData(booking.car),
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
    console.error("Error Fetching test drives : ", error);
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
}

export async function cancelTestDrive(bookingId) {
  try {
    const { userId } = await auth();
    if (!userId) throw "You must be logged in to show a Test Drive.";

    const user = await DB.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw "User Not Found.";

    const booking = await DB.testDriveBooking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) throw "Booking Not Found.";

    if (
      !(
        booking.userId === user.id ||
        user.role === "DEALERSHIP" ||
        user.role === "ADMIN"
      )
    ) {
      throw "Unauthorized to Cancel this Booking.";
    }

    if (booking.status === "CANCELLED") {
      throw "Booking is already cancelled.";
    }

    if (booking.status === "COMPLETED") {
      throw "Cannot cancel a completed Booking.";
    }

    await DB.testDriveBooking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" },
    });

    revalidatePath("/reservations");
    revalidatePath("/admin/test-drive");

    return {
      success: true,
      message: "Test Drive Cancelled Successfully.",
    };
  } catch (error) {
    console.error("Error Cancelling test drives : ", error);
    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
}

"use server";

import { serializeCarData } from "@/lib/helper";
import DB from "@/lib/prisma.db";
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
    if (!userId) throw new Error("You must be logged in to Book a Test Drive.");

    const user = await DB.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User Not Found.");

    const car = await DB.car.findUnique({
      where: { id: carId, status: "AVAILABLE" },
    });

    if (!car) throw new Error("Car not available for Test Drive.");

    const existingBooking = await DB.testDriveBooking.findFirst({
      where: {
        carId,
        bookingDate: new Date(bookingDate),
        startTime,
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    });

    if (existingBooking) {
      throw new Error(
        "This time slot is already booked. Please select another time."
      );
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
    throw new Error(
      "Error Booking test drive : " + error.message ||
        "Failed to book test drive"
    );
  }
}

export async function getUserTestDrives() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("You must be logged in to show a Test Drive.");

    const user = await DB.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User Not Found.");

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
    throw new Error("Error Fetching test drives : " + error.message);
  }
}

export async function cancelTestDrive(bookingId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("You must be logged in to show a Test Drive.");

    const user = await DB.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User Not Found.");

    const booking = await DB.testDriveBooking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) throw new Error("Booking Not Found.");

    if (
      !(
        booking.userId === user.id ||
        user.role === "DEALERSHIP" ||
        user.role === "ADMIN"
      )
    ) {
      throw new Error("Unauthorized to Cancel this Booking.");
    }

    if (booking.status === "CANCELLED") {
      throw new Error("Booking is already cancelled.");
    }

    if (booking.status === "COMPLETED") {
      throw new Error("Cannot cancel a completed Booking.");
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
    throw new Error("Error Cancelling test drives : " + error.message);
  }
}

"use server";

import { getLoggedInUser } from "@/lib/auth";
import { serializeCarData } from "@/lib/helper";
import DB from "@/lib/prisma.db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getCarFilters() {
  try {
    const carData = await DB.car.findMany({
      where: { status: "AVAILABLE" },
      select: {
        make: true,
        bodyType: true,
        fuelType: true,
        transmission: true,
      },
    });

    const makes = carData.map((item) => item.make).sort();
    const bodyTypes = carData.map((item) => item.bodyType).sort();
    const fuelTypes = carData.map((item) => item.fuelType).sort();
    const transmissions = carData.map((item) => item.transmission).sort();

    const priceAggregations = await DB.car.aggregate({
      where: { status: "AVAILABLE" },
      _min: { price: true },
      _max: { price: true },
    });

    return {
      success: true,
      data: {
        makes: [...new Set(makes)],
        bodyTypes: [...new Set(bodyTypes)],
        fuelTypes: [...new Set(fuelTypes)],
        transmissions: [...new Set(transmissions)],
        priceRange: {
          min: priceAggregations._min?.price
            ? parseFloat(priceAggregations._min?.price.toString())
            : 0,
          max: priceAggregations._max?.price
            ? parseFloat(priceAggregations._max?.price.toString())
            : 100000,
        },
      },
    };
  } catch (error) {
    throw new Error("Error fetching car filters : " + error.message);
  }
}

export async function getCars(
  search = "",
  make = "",
  bodyType = "",
  fuelType = "",
  transmission = "",
  minPrice = 0,
  maxPrice = Number.MAX_SAFE_INTEGER,
  sortBy = "newest", // Options: newest, priceAsc, priceDesc
  page = 1,
  limit = 6
) {
  try {
    const { userId } = await auth();
    let dbUser = null;

    if (userId) {
      dbUser = await DB.user.findUnique({
        where: { clerkUserId: userId },
      });
    }

    let where = {
      status: "AVAILABLE",
    };

    if (search) {
      where.OR = [
        { make: { contains: search, mode: "insensitive" } },
        { model: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (make) where.make = { equals: make, mode: "insensitive" };
    if (bodyType) where.bodyType = { equals: bodyType, mode: "insensitive" };
    if (fuelType) where.fuelType = { equals: fuelType, mode: "insensitive" };
    if (transmission)
      where.transmission = { equals: transmission, mode: "insensitive" };

    where.price = {
      gte: parseFloat(minPrice) || 0,
    };

    if (maxPrice && maxPrice < Number.MAX_SAFE_INTEGER) {
      where.price.lte = parseFloat(maxPrice);
    }

    const skip = (page - 1) * limit;

    let orderBy = ((sortBy) => {
      const _orderBy = {
        priceAsc: { price: "asc" },
        priceDesc: { price: "desc" },
        newest: { createdAt: "desc" },
      };

      return _orderBy[sortBy] ?? {};
    })(sortBy);

    const totalCars = await DB.car.count({ where });

    const cars = await DB.car.findMany({
      where,
      take: limit,
      skip,
      orderBy,
    });

    let wishlist = new Set();
    if (dbUser) {
      const savedCars = await DB.userSavedCar.findMany({
        where: { userId: dbUser.id },
        select: { carId: true },
      });

      wishlist = new Set(savedCars.map((saved) => saved.carId));
    }

    const serializedCars = cars.map((car) =>
      serializeCarData(car, wishlist.has(car.id))
    );

    return {
      success: true,
      data: serializedCars,
      pagination: {
        total: totalCars,
        page,
        limit,
        pages: Math.ceil(totalCars / limit),
      },
    };
  } catch (error) {
    throw new Error("Error fetching cars : " + error.message);
  }
}

export async function toggleSavedCar(carId) {
  try {
    const user = await getLoggedInUser();
    if (user instanceof Error) throw user;

    const car = await DB.car.findUnique({
      where: { id: carId },
    });

    if (!car) {
      return {
        success: false,
        error: "Car not found",
      };
    }

    const existingSave = await DB.userSavedCar.findUnique({
      where: {
        userId_carId: {
          userId: user.id,
          carId,
        },
      },
    });

    if (existingSave) {
      await DB.userSavedCar.delete({
        where: {
          userId_carId: {
            userId: user.id,
            carId,
          },
        },
      });

      revalidatePath(`/saved-cars`);
      return {
        success: true,
        saved: false,
        message: "Car Removed from Favorites.",
      };
    }

    await DB.userSavedCar.create({
      data: {
        userId: user.id,
        carId,
      },
    });

    revalidatePath(`/saved-cars`);
    return {
      success: true,
      saved: true,
      message: "Car Added to Favorites.",
    };
  } catch (error) {
    throw new Error("Error toggling saved car : " + error.message);
  }
}

export async function getSavedCars() {
  try {
    const user = await getLoggedInUser();
    if (user instanceof Error) throw user;

    const savedCars = await DB.userSavedCar.findMany({
      where: { userId: user.id },
      include: {
        car: true,
      },
      orderBy: { savedAt: "desc" },
    });

    const serializedCars = savedCars.map((saved) =>
      serializeCarData(saved.car)
    );

    return {
      success: true,
      data: serializedCars,
    };
  } catch (error) {
    console.error("Error fetching saved cars : " + error.message);
  }
}

export async function getCarById(carId) {
  try {
    const { userId } = await auth();
    let dbUser = null;

    if (userId) {
      dbUser = await DB.user.findUnique({
        where: { clerkUserId: userId },
      });
    }

    const car = await DB.car.findUnique({
      where: { id: carId },
    });

    if (!car) {
      return {
        success: false,
        error: "Car Not Found.",
      };
    }

    let wishlist = false;
    let userTestDrive = null;
    let existingBookings = null;

    if (dbUser) {
      const savedCar = await DB.userSavedCar.findUnique({
        where: {
          userId_carId: {
            userId: dbUser.id,
            carId,
          },
        },
      });

      wishlist = !!savedCar;

      const existingTestDrive = await DB.testDriveBooking.findFirst({
        where: {
          userId: dbUser.id,
          carId,
          status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (existingTestDrive) {
        userTestDrive = {
          id: existingTestDrive.id,
          status: existingTestDrive.status,
          bookingDate: existingTestDrive.bookingDate.toISOString(),
        };
      }

      const booking = await DB.testDriveBooking.findMany({
        where: {
          carId,
          status: { in: ["PENDING", "CONFIRMED"] },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (booking) existingBookings = booking;
    }

    const dealership = await DB.dealershipInfo.findUnique({
      where: {
        id: car.dealershipId,
      },
      include: {
        workingHours: true,
      },
    });

    return {
      success: true,
      data: {
        ...serializeCarData(car, wishlist),
        testDriveInfo: {
          userTestDrive,
          existingBookings,
          dealership: dealership
            ? {
                ...dealership,
                createdAt: dealership.createdAt.toISOString(),
                updatedAt: dealership.updatedAt.toISOString(),
                workingHours: dealership.workingHours.map((hour) => ({
                  ...hour,
                  createdAt: hour.createdAt.toISOString(),
                  updatedAt: hour.updatedAt.toISOString(),
                })),
              }
            : null,
        },
      },
    };
  } catch (error) {
    throw new Error("Error Fetching Car Details : " + error.message);
  }
}

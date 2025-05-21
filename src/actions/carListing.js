"use server";

import { serializeCarData } from "@/lib/helper";
import DB from "@/lib/prisma.db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getCarFilters() {
  try {
    const makes = await DB.car.findMany({
      where: { status: "AVAILABLE" },
      select: { make: true },
      distinct: ["make"],
      orderBy: { make: "asc" },
    });

    const bodyTypes = await DB.car.findMany({
      where: { status: "AVAILABLE" },
      select: { bodyType: true },
      distinct: ["bodyType"],
      orderBy: { bodyType: "asc" },
    });

    const fuelTypes = await DB.car.findMany({
      where: { status: "AVAILABLE" },
      select: { fuelType: true },
      distinct: ["fuelType"],
      orderBy: { fuelType: "asc" },
    });

    const transmissions = await DB.car.findMany({
      where: { status: "AVAILABLE" },
      select: { transmission: true },
      distinct: ["transmission"],
      orderBy: { transmission: "asc" },
    });

    const priceAggregations = DB.car.aggregate({
      where: { status: "AVAILABLE" },
      _min: true,
      _max: true,
    });

    // console.log(makes, bodyTypes);

    return {
      success: true,
      data: {
        makes: makes.map((item) => item.make),
        bodyTypes: bodyTypes.map((item) => item.bodyType),
        fuelTypes: fuelTypes.map((item) => item.fuelType),
        transmissions: transmissions.map((item) => item.transmission),
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
      const savedCars = DB.userSavedCar.findMany({
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
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized User.");

    const user = await DB.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found.");

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

"use server";

import { serializeCarData } from "@/lib/helper";
import DB from "@/lib/prisma.db";
import { createClient } from "@/lib/superbase";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

// Function to convert File to base64
async function fileToBase64(file) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  return buffer.toString("base64");
}

export async function processCarImageWithAI(file) {
  try {
    // Check if API key is available
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Gemini API Key is not configured");
    }

    // Initialize Gemini API
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Convert image file to base64
    const base64Image = await fileToBase64(file);

    // Create image part for the model
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: file.type,
      },
    };

    // Define the prompt for car detail extraction
    const prompt = `
      Analyze this car image and extract the following information:
      1. Make (manufacturer)
      2. Model
      3. Year (approximately)
      4. Color
      5. Body type (SUV, Sedan, Hatchback, etc.)
      6. Mileage
      7. Fuel type (your best guess)
      8. Transmission type (your best guess)
      9. Price (your best guess)
      10. Short Description as to be added to a car listing

      Format your response as a clean JSON object with these fields:
      {
        "make": "",
        "model": "",
        "year": 0000,
        "color": "",
        "price": "",
        "mileage": "",
        "bodyType": "",
        "fuelType": "",
        "transmission": "",
        "description": "",
        "confidence": 0.0
      }

      For confidence, provide a value between 0 and 1 representing how confident you are in your overall identification.
      Only respond with the JSON object, nothing else.
    `;

    // Get response from Gemini
    const result = await model.generateContent([imagePart, prompt]);
    const response = result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    // Parse the JSON response
    try {
      const carDetails = JSON.parse(cleanedText);

      // Validate the response format
      const requiredFields = [
        "make",
        "model",
        "year",
        "color",
        "bodyType",
        "price",
        "mileage",
        "fuelType",
        "transmission",
        "description",
        "confidence",
      ];

      const missingFields = requiredFields.filter(
        (field) => !(field in carDetails)
      );

      if (missingFields.length > 0) {
        throw new Error(
          `AI Response missing Required Fields : ${missingFields.join(", ")}`
        );
      }

      return {
        success: true,
        data: carDetails,
      };
    } catch (parseError) {
      console.error("Failed to parse AI response : " + parseError);
      console.log("Raw response:" + text);
      return {
        success: false,
        error: "Failed to parse AI response",
      };
    }
  } catch (error) {
    throw new Error("Gemini API error : " + error.message);
  }
}

export async function addCar({ carData, images }) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized User.");

    const user = await DB.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User Not Found");

    const dealership = await DB.dealershipInfo.findUnique({
      where: { userId: user.id },
    });

    if (!dealership) {
      throw new Error("Please Setup Your Dealership First.");
    }

    // Create a unique folder name for this car's images
    const carId = uuidv4();
    const folderPath = `cars/${carId}`;

    // Initialize Supabase client for server-side operations
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Upload all images to Supabase storage
    const imageUrls = [];

    for (let i = 0; i < images.length; i++) {
      const base64Data = images[i];

      // Skip if image data is not valid
      if (!base64Data || !base64Data.startsWith("data:image/")) {
        console.warn("Skipping invalid image data");
        continue;
      }

      // Extract the base64 part (remove the data:image/xyz;base64, prefix)
      const base64 = base64Data.split(",")[1];
      const imageBuffer = Buffer.from(base64, "base64");

      // Determine file extension from the data URL
      const mimeMatch = base64Data.match(/data:image\/([a-zA-Z0-9]+);/);
      const fileExtension = mimeMatch ? mimeMatch[1] : "jpeg";

      // Create filename
      const fileName = `image-${Date.now()}-${i}.${fileExtension}`;
      const filePath = `${folderPath}/${fileName}`;

      // Upload the file buffer directly
      const { data, error } = await supabase.storage
        .from("car-listing-image")
        .upload(filePath, imageBuffer, {
          contentType: `image/${fileExtension}`,
        });

      if (error) {
        console.error("Error uploading image:", error);
        throw new Error(`Failed to upload image: ${error.message}`);
      }

      // Get the public URL for the uploaded file
      const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/car-listing-image/${filePath}`; // disable cache in config

      imageUrls.push(publicUrl);
    }

    if (imageUrls.length === 0) {
      throw new Error("No Valid Image were Upload.");
    }

    // Add the car to the database
    const car = await DB.car.create({
      data: {
        id: carId, // Use the same ID we used for the folder
        make: carData.make,
        model: carData.model,
        year: carData.year,
        price: carData.price,
        mileage: carData.mileage,
        color: carData.color,
        fuelType: carData.fuelType,
        transmission: carData.transmission,
        bodyType: carData.bodyType,
        seats: carData.seats,
        description: carData.description,
        status: carData.status,
        featured: carData.featured,
        images: imageUrls, // Store the array of image URLs
        dealershipInfoId: dealership.id,
      },
    });

    // Revalidate the cars list page
    revalidatePath("/admin/cars");

    return {
      success: true,
    };
  } catch (error) {
    throw new Error("Error Adding New car : " + error.message);
  }
}

export async function getCars(search = "") {
  try {
    // Check is Authorized
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized User.");

    const user = await DB.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User Not Found");

    // Build where conditions
    let where = {
      DealershipInfo: {
        userId: user.id,
      },
    };

    // Add search filter
    if (search) {
      where.OR = [
        { make: { contains: search, mode: "insensitive" } },
        { model: { contains: search, mode: "insensitive" } },
        { color: { contains: search, mode: "insensitive" } },
      ];
    }

    // Execute main query
    const cars = await DB.car.findMany({
      where,
      include: {
        DealershipInfo: {
          select: {
            name: true,
            userId: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const serializedCars = cars.map(serializeCarData);

    return {
      success: true,
      data: serializedCars,
    };
  } catch (error) {
    throw new Error("Error Fetching Cars : " + error.message);
  }
}

export async function deleteCar(id) {
  try {
    // Check is Authorized
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized User.");

    const user = await DB.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User Not Found");

    // First, fetch the car to get its images
    const car = await DB.car.findUnique({
      where: { id },
      select: { images: true },
    });

    if (!car) {
      return {
        success: false,
        error: "Car Not Found",
      };
    }

    // Delete the car from the database
    await DB.car.delete({
      where: { id },
    });

    // Delete the images from Supabase storage
    try {
      const cookieStore = await cookies();
      const supabase = createClient(cookieStore);

      // Extract file paths from image URLs
      const filePaths = car.images
        .map((imageUrl) => {
          const url = new URL(imageUrl);
          const pathMatch = url.pathname.match(/\/car-listing-image\/(.*)/);
          return pathMatch ? pathMatch[1] : null;
        })
        .filter(Boolean);

      // Delete files from storage if paths were extracted
      if (filePaths.length > 0) {
        const { error } = await supabase.storage
          .from("car-listing-image")
          .remove(filePaths);

        if (error) {
          console.error("Error Deleting Images:", error);
        }
      }
    } catch (storageError) {
      console.error("Error with Storage Operations:", storageError);
    }

    // Revalidate the cars list page
    revalidatePath("/admin/cars");

    return {
      success: true,
    };
  } catch (error) {
    throw new Error("Error Deleting Car : " + error.message);
  }
}

export async function updateCar({ carId, carData, images }) {
  try {
    // Check is Authorized
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized User.");

    const user = await DB.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User Not Found");

    const existingCar = await DB.car.findUnique({
      where: { id: carId },
    });

    if (!existingCar) throw new Error("Car Not Found");
    if (user.role !== "ADMIN")
      throw new Error("Not Authorized to Update this Car");

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const imageUrls = [];

    if (images && images?.length > 0) {
      const folderPath = `cars/${carId}`;

      for (let i = 0; i < images.length; i++) {
        const base64Data = images[i];

        if (!base64Data || !base64Data.startsWith("data:image/")) {
          console.warn("Skipping invalid image data");
          imageUrls.push(base64Data);
          continue;
        }

        const base64 = base64Data.split(",")[1];
        const imageBuffer = Buffer.from(base64, "base64");

        const mimeMatch = base64Data.match(/data:image\/([a-zA-Z0-9]+);/);
        const fileExtension = mimeMatch ? mimeMatch[1] : "jpeg";

        const fileName = `image-${Date.now()}-${i}.${fileExtension}`;
        const filePath = `${folderPath}/${fileName}`;

        const { data, error } = await supabase.storage
          .from("car-listing-image")
          .upload(filePath, imageBuffer, {
            contentType: `image/${fileExtension}`,
          });

        if (error) {
          console.error("Error uploading image:", error);
          throw new Error(`Failed to upload image: ${error.message}`);
        }

        const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/car-listing-image/${filePath}`;
        imageUrls.push(publicUrl);
      }

      if (imageUrls.length === 0) {
        throw new Error("No Valid Image were Uploaded.");
      }

      const deleteImagePath = existingCar.images
        .filter((image) => !imageUrls.includes(image))
        .map((url) => url.split("car-listing-image/")[1]);

      if (deleteImagePath.length > 0) {
        const { data, error } = await supabase.storage
          .from("car-listing-image")
          .remove([deleteImagePath]);

        if (error) {
          console.error("Error Deleting image:", error);
          throw new Error(`Failed to Delete image: ${error.message}`);
        }
      }
    }

    const updateData = {};

    if (images && images?.length > 0) {
      if (imageUrls.toString() !== existingCar.images.toString()) {
        updateData.images = imageUrls;
      }
    }

    for (const key in carData) {
      if (carData[key] != existingCar[key]) {
        updateData[key] = carData[key];
      }
    }

    // Update the car
    if (Object.keys(updateData).length > 0) {
      await DB.car.update({
        where: { id: carId },
        data: updateData,
      });
    }

    return { success: true };
  } catch (error) {
    throw new Error("Error Updating Car : " + error?.message);
  }
}

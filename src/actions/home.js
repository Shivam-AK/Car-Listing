"use server";

import aj from "@/lib/arcjet";
import { serializeCarData } from "@/lib/helper";
import DB from "@/lib/prisma.db";
import { request } from "@arcjet/next";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Function to convert File to base64
async function fileToBase64(file) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  return buffer.toString("base64");
}

export async function processImageSearch(file) {
  try {
    // Rate limit with Arcjet
    const req = await request();

    // Check rate limit
    const decision = await aj.protect(req, {
      requested: 1, // Specify how many tokens to consume
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        const { remaining, reset } = decision.reason;

        console.error({
          code: "RATE_LIMIT_EXCEEDED",
          details: {
            remaining,
            resetInSeconds: reset,
          },
        });

        throw new Error("Too many requests. Please try again later.");
      }
      throw new Error("Request blocked");
    }

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
          Analyze this car image and extract the following information for a search query:
        1. Make (manufacturer)
        2. Body type (SUV, Sedan, Hatchback, etc.)
        3. Color
  
        Format your response as a clean JSON object with these fields:
        {
          "make": "",
          "bodyType": "",
          "color": "",
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

    try {
      const carDetails = JSON.parse(cleanedText);

      return {
        success: true,
        data: carDetails,
      };
    } catch (error) {
      console.error("Failed to parse AI response : " + parseError);
      return {
        success: false,
        error: "Failed to parse AI response",
      };
    }
  } catch (error) {
    throw new Error("AI Search error : " + error.message);
  }
}

export async function getFeaturedCars(isUser = null, limit = 3) {
  try {
    let wishlist = new Set();

    if (isUser) {
      const savedCars = await DB.userSavedCar.findMany({
        where: { userId: isUser.id },
        select: { carId: true },
      });

      wishlist = new Set(savedCars.map((saved) => saved.carId));
    }

    const cars = await DB.car.findMany({
      where: {
        featured: true,
        status: "AVAILABLE",
      },
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    const serializedCars = cars.map((car) =>
      serializeCarData(car, wishlist.has(car.id))
    );

    return serializedCars;
  } catch (error) {
    throw new Error("Error fetching featured cars : " + error.message);
  }
}

"use client";

import { toggleSavedCar } from "@/actions/carListing";
import useFetch from "@/hooks/useFetch";
import { useAuth } from "@clerk/nextjs";
import { CarIcon, Heart, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

export default function CarCard({ car }) {
  const [isSaved, setIsSaved] = useState(car.wishlist);
  const router = useRouter();
  const { isSignedIn } = useAuth();

  const {
    loading: isToggling,
    fn: toggleSavedCarFn,
    data: toggleResult,
    error: toggleError,
  } = useFetch(toggleSavedCar);

  useEffect(() => {
    if (toggleResult?.success && toggleResult.saved !== isSaved) {
      setIsSaved(toggleResult.saved);
      toast.success(toggleResult.message);
    }
  }, [toggleResult, isSaved]);

  useEffect(() => {
    if (toggleError) {
      toast.error("Failed to Update Favorites.");
    }
  }, [toggleError]);

  const handleToggleSave = async (e) => {
    e.preventDefault();

    if (!isSignedIn) {
      toast.error("Please Sign in to Save Cars.");
      router.push("/sign-in");
      return;
    }

    if (isToggling) return;

    await toggleSavedCarFn(car.id);
  };

  return (
    <Card className="group gap-0 overflow-hidden py-0 transition hover:shadow-lg">
      <div className="relative aspect-video">
        {car.images && car.images.length > 0 ? (
          <Image
            src={car.images[0]}
            alt={`${car.make} ${car.model}`}
            loading="lazy"
            quality={55}
            fill
            className="aspect-video object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex-center size-full bg-gray-200">
            <CarIcon className="h-12 w-12 text-gray-400" />
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          aria-label="Add to Favorite"
          className={`absolute top-2 right-2 rounded-full bg-white/90 p-1.5 ${
            isSaved
              ? "text-red-500 hover:text-red-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
          onClick={handleToggleSave}
          disabled={isToggling}
        >
          {isToggling ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Heart size={20} className={isSaved ? "fill-current" : ""} />
          )}
        </Button>
      </div>
      <CardContent className="grid h-full content-between p-4">
        <div className="mb-4 flex flex-col">
          <h3 className="line-clamp-1 text-lg font-bold">{`${car.make} ${car.model}`}</h3>
          <span className="text-xl font-bold text-blue-600">
            $ {car.price.toLocaleString()}
          </span>
        </div>

        <div className="mb-2 flex items-center text-gray-600">
          <span>{car.year}</span>
          <span className="mx-2">•</span>
          <span>{car.transmission}</span>
          <span className="mx-2">•</span>
          <span>{car.fuelType}</span>
        </div>

        <div className="mb-4 flex flex-wrap gap-1">
          <Badge variant="outline" className="bg-gray-50">
            {car.bodyType}
          </Badge>
          <Badge variant="outline" className="bg-gray-50">
            {car.mileage.toLocaleString()} miles
          </Badge>
          <Badge variant="outline" className="bg-gray-50">
            {car.color}
          </Badge>
        </div>

        <div className="flex justify-between">
          <Button
            className="flex-1"
            onClick={() => {
              router.push(`/cars/${car.id}`);
            }}
          >
            View Car
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { Heart } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

export default function CarCard({ car }) {
  const [isSaved, setIsSaved] = useState(car.wishlist);
  const router = useRouter();

  const handleToggleSave = () => {};

  return (
    <Card className="group overflow-hidden py-0 transition hover:shadow-lg">
      <div className="relative h-48">
        {car.images && car.images.length > 0 ? (
          <div className="relative h-full w-full">
            <Image
              src={car.images[0]}
              alt={`${car.make} ${car.model}`}
              fill
              className="object-cover transition duration-300 group-hover:scale-105"
            />
          </div>
        ) : (
          <div>
            <Image
              src={car.images[0]}
              alt={`${car.make} ${car.model}`}
              fill
              className="object-cover transition duration-300 group-hover:scale-105"
            />
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          className={`absolute top-2 right-2 rounded-full bg-white/90 p-1.5 ${
            isSaved
              ? "text-red-500 hover:text-red-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
          onClick={handleToggleSave}
        >
          <Heart size={20} className={isSaved ? "fill-current" : ""} />
        </Button>
      </div>
      <CardContent className="p-4">
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

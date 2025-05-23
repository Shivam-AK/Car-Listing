"use client";

import { toggleSavedCar } from "@/actions/carListing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import useFetch from "@/hooks/useFetch";
import { formatCurrency } from "@/lib/helper";
import { cn } from "@/lib/utils";
import { useAuth } from "@clerk/nextjs";
import { Car, Currency, Fuel, Gauge, Heart, Share2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import EmiCalculator from "./EmiCalculator";

export default function CarDetails({ car, testDriveInfo }) {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [isWishlist, setIsWishlist] = useState(car.wishlist);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const {
    loading: isToggling,
    fn: toggleSavedCarFn,
    data: toggleResult,
    error: toggleError,
  } = useFetch(toggleSavedCar);

  useEffect(() => {
    if (toggleResult?.success && toggleResult.saved !== isWishlist) {
      setIsWishlist(toggleResult.saved);
      toast.success(toggleResult.message);
    }
  }, [toggleResult, isWishlist]);

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

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `${car.year} ${car.make} ${car.model}`,
          text: `Check out this ${car.year} ${car.make} ${car.model} on Vehiql AI`,
          url: window.location.href,
        })
        .catch((error) => {
          console.log("Error sharing" + error);
          copyToClipboard();
        });
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard");
  };

  const calculateLoan = (principal, down, rate, years) => {
    const loanPrincipal = principal - down;

    const monthlyRate = rate / 100 / 12;
    const months = years * 12;

    return (
      (loanPrincipal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1)
    ).toFixed(2);
  };

  return (
    <div>
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Image Gallery */}
        <div className="w-full lg:w-7/12">
          <div className="relative mb-4 aspect-video overflow-hidden rounded-lg">
            {car.images && car.images.length > 0 ? (
              <Image
                src={car.images[currentImageIndex]}
                alt={`${car.year} ${car.make} ${car.model}`}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex-center size-full bg-gray-200">
                <Car className="size-24 text-gray-400" />
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {car.images && car.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {car.images.map((image, index) => (
                <div
                  key={index}
                  className={cn(
                    "relative h-20 w-24 flex-shrink-0 cursor-pointer rounded-md transition",
                    index === currentImageIndex
                      ? "border-2 border-blue-600"
                      : "opacity-75 hover:opacity-100"
                  )}
                  onClick={() => setCurrentImageIndex(index)}
                >
                  <Image
                    src={image}
                    alt={`${car.year} ${car.make} ${car.model} - view ${
                      index + 1
                    }`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Secondary Actions */}
          <div className="mt-4 flex gap-4">
            <Button
              variant="outline"
              className={cn(
                "flex flex-1 items-center gap-2",
                isWishlist ? "text-red-500" : ""
              )}
              onClick={handleToggleSave}
              disabled={isToggling}
            >
              <Heart
                className={cn("size-5", isWishlist ? "fill-red-500" : "")}
              />
              {isWishlist ? "Saved" : "Save"}
            </Button>
            <Button
              variant="outline"
              className="flex flex-1 items-center gap-2"
              onClick={handleShare}
            >
              <Share2 className="size-5" />
              Share
            </Button>
          </div>
        </div>

        {/* Car Details */}
        <div className="w-full lg:w-5/12">
          <div className="flex items-center justify-between">
            <Badge className="mb-2">{car.bodyType}</Badge>
          </div>

          <h1 className="mb-1 text-4xl font-bold">
            {car.year} {car.make} {car.model}
          </h1>

          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(car.price)}
          </div>

          {/* Quick Stats */}
          <div className="my-6 grid grid-cols-2 gap-4 md:grid-cols-3">
            <div className="flex items-center gap-2">
              <Gauge className="size-5 text-gray-500" />
              <span>{car.mileage.toLocaleString()} miles</span>
            </div>
            <div className="flex items-center gap-2">
              <Fuel className="size-5 text-gray-500" />
              <span>{car.fuelType}</span>
            </div>
            <div className="flex items-center gap-2">
              <Car className="size-5 text-gray-500" />
              <span>{car.transmission}</span>
            </div>
          </div>

          <Dialog>
            <DialogTrigger className="w-full text-start">
              <Card className="pt-5">
                <CardContent>
                  <div className="mb-2 flex items-center gap-2 text-lg font-medium">
                    <Currency className="size-5 text-blue-600" />
                    <h3>EMI Calculator</h3>
                  </div>
                  <div className="text-sm text-gray-600">
                    Estimated Monthly Payment:{" "}
                    <span className="font-bold text-gray-900">
                      {calculateLoan(car.price, 0, 4.5, 5)}
                    </span>{" "}
                    for 60 months
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    *Based on $0 down payment and 4.5% interest rate
                  </div>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Vehiql Car Loan Calculator</DialogTitle>
              </DialogHeader>
              <EmiCalculator price={car.price} interest={4.5} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}

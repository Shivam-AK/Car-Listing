"use client";

import { toggleSavedCar } from "@/actions/carListing";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { format } from "date-fns";
import {
  Calendar,
  Car,
  Currency,
  Fuel,
  Gauge,
  Heart,
  LocateFixed,
  MessageSquare,
  Share2,
} from "lucide-react";
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

  const handleBookTestDrive = () => {
    if (!isSignedIn) {
      toast.error("Please sign in to book a test drive");
      router.push("/sign-in");
      return;
    }
    router.push(`/test-drive/${car.id}`);
  };

  return (
    <>
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

          <Card className="my-6">
            <CardContent>
              <div className="mb-2 flex items-center gap-2 text-lg font-medium">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                <h3>Have Questions?</h3>
              </div>
              <p className="mb-3 text-sm text-gray-600">
                Our representatives are available to answer all your queries
                about this vehicle.
              </p>
              <a href="mailto:help@vehiql.in">
                <Button variant="outline" className="w-full">
                  Request Info
                </Button>
              </a>
            </CardContent>
          </Card>

          {(car.status === "SOLD" || car.status === "UNAVAILABLE") && (
            <Alert variant="destructive">
              <AlertTitle className="capitalize">
                This car is {car.status.toLowerCase()}
              </AlertTitle>
              <AlertDescription>Please check again later.</AlertDescription>
            </Alert>
          )}

          {/* Book Test Drive Button */}
          {car.status !== "SOLD" && car.status !== "UNAVAILABLE" && (
            <Button
              className="w-full py-6 text-lg"
              onClick={handleBookTestDrive}
              disabled={testDriveInfo.userTestDrive}
            >
              <Calendar className="mr-2 size-5" />
              {testDriveInfo.userTestDrive
                ? `Booked for ${format(
                    new Date(testDriveInfo.userTestDrive.bookingDate),
                    "EEEE, MMMM d, yyyy"
                  )}`
                : "Book Test Drive"}
            </Button>
          )}
        </div>
      </div>

      {/* Details & Features Section */}
      <Card className="my-6 py-5">
        <CardContent className="grid grid-cols-1 gap-5 px-5 md:grid-cols-2">
          <Card className="py-5">
            <CardContent className="px-5">
              <h3 className="mb-5 text-2xl font-bold">Description</h3>
              <p className="whitespace-pre-line text-gray-700">
                {car.description}
              </p>
            </CardContent>
          </Card>
          <Card className="py-5">
            <CardContent className="px-5">
              <h3 className="mb-6 text-2xl font-bold">Features</h3>
              <ul className="my-6 ml-6 list-disc">
                <li className="mt-2">
                  <strong className="font-semibold">{car.transmission}</strong>{" "}
                  Transmission
                </li>
                <li className="mt-2">
                  <strong className="font-semibold">{car.fuelType}</strong>{" "}
                  Engine
                </li>
                <li className="mt-2">
                  <strong className="font-semibold">{car.bodyType}</strong> Body
                  Style
                </li>
                {car.seats && (
                  <li className="mt-2">
                    <strong className="font-semibold">{car.seats}</strong> Seats
                  </li>
                )}
                <li className="mt-2">
                  <strong className="font-semibold">{car.color}</strong>{" "}
                  Exterior
                </li>
              </ul>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Specifications Section */}
      <Card className="my-6 py-5">
        <CardContent className="px-5">
          <h2 className="mb-6 text-2xl font-bold">Specifications</h2>
          <div className="rounded-lg bg-gray-50 p-6">
            <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
              <div className="flex justify-between border-b py-2">
                <span className="text-gray-600">Make</span>
                <span className="font-medium">{car.make}</span>
              </div>
              <div className="flex justify-between border-b py-2">
                <span className="text-gray-600">Model</span>
                <span className="font-medium">{car.model}</span>
              </div>
              <div className="flex justify-between border-b py-2">
                <span className="text-gray-600">Year</span>
                <span className="font-medium">{car.year}</span>
              </div>
              <div className="flex justify-between border-b py-2">
                <span className="text-gray-600">Body Type</span>
                <span className="font-medium">{car.bodyType}</span>
              </div>
              <div className="flex justify-between border-b py-2">
                <span className="text-gray-600">Fuel Type</span>
                <span className="font-medium">{car.fuelType}</span>
              </div>
              <div className="flex justify-between border-b py-2">
                <span className="text-gray-600">Transmission</span>
                <span className="font-medium">{car.transmission}</span>
              </div>
              <div className="flex justify-between border-b py-2">
                <span className="text-gray-600">Mileage</span>
                <span className="font-medium">
                  {car.mileage.toLocaleString()} miles
                </span>
              </div>
              <div className="flex justify-between border-b py-2">
                <span className="text-gray-600">Color</span>
                <span className="font-medium">{car.color}</span>
              </div>
              {car.seats && (
                <div className="flex justify-between border-b py-2">
                  <span className="text-gray-600">Seats</span>
                  <span className="font-medium">{car.seats}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dealership Location Section */}
      <Card className="my-6 py-5">
        <CardContent className="px-5">
          <h2 className="mb-6 text-2xl font-bold">Dealership Location</h2>
          <div className="rounded-lg bg-gray-50 p-6">
            <div className="flex flex-col justify-between gap-6 md:flex-row">
              {/* Dealership Name and Address */}
              <div className="flex items-start gap-3">
                <LocateFixed className="mt-1 h-5 w-5 flex-shrink-0 text-blue-600" />
                <div>
                  <h4 className="font-medium">Vehiql Motors</h4>
                  <p className="text-gray-600">
                    Dealership Name:{" "}
                    <span className="font-semibold">
                      {testDriveInfo.dealership?.name || "Not Available"}
                    </span>
                  </p>
                  <p className="text-gray-600">
                    Address:{" "}
                    <span className="font-semibold">
                      {testDriveInfo.dealership?.address || "Not Available"}
                    </span>
                  </p>
                  <p className="mt-1 text-gray-600">
                    Phone:{" "}
                    <span className="font-semibold">
                      {testDriveInfo.dealership?.phone || "Not Available"}
                    </span>
                  </p>
                  <p className="text-gray-600">
                    Email:{" "}
                    <span className="font-semibold">
                      {testDriveInfo.dealership?.email || "Not Available"}
                    </span>
                  </p>
                </div>
              </div>

              {/* Working Hours */}
              <div className="md:w-1/2 lg:w-1/3">
                <h4 className="mb-2 font-medium">Working Hours</h4>
                <div className="space-y-2">
                  {testDriveInfo.dealership?.workingHours
                    ? testDriveInfo.dealership.workingHours
                        .sort((a, b) => {
                          const days = [
                            "MONDAY",
                            "TUESDAY",
                            "WEDNESDAY",
                            "THURSDAY",
                            "FRIDAY",
                            "SATURDAY",
                            "SUNDAY",
                          ];
                          return (
                            days.indexOf(a.dayOfWeek) -
                            days.indexOf(b.dayOfWeek)
                          );
                        })
                        .map((day) => (
                          <div
                            key={day.dayOfWeek}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-gray-600">
                              {day.dayOfWeek.charAt(0) +
                                day.dayOfWeek.slice(1).toLowerCase()}
                            </span>
                            <span>
                              {day.isOpen
                                ? `${day.openTime} - ${day.closeTime}`
                                : "Closed"}
                            </span>
                            {console.log(testDriveInfo.dealership.workingHours)}
                          </div>
                        ))
                    : // Default hours if none provided
                      [
                        "Monday",
                        "Tuesday",
                        "Wednesday",
                        "Thursday",
                        "Friday",
                        "Saturday",
                        "Sunday",
                      ].map((day, index) => (
                        <div key={day} className="flex justify-between text-sm">
                          <span className="text-gray-600">{day}</span>
                          <span>
                            {index < 5
                              ? "9:00 - 18:00"
                              : index === 5
                                ? "10:00 - 16:00"
                                : "Closed"}
                          </span>
                        </div>
                      ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

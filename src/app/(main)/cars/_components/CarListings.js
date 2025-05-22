"use client";

import { getCars } from "@/actions/carListing";
import CarCard from "@/components/CarCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import useFetch from "@/hooks/useFetch";
import { Info } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import CarListingsLoading from "./CarListingsLoading";

export default function CarListings() {
  const searchParams = useSearchParams();
  const limit = 6;

  const search = searchParams.get("search") || "";
  const make = searchParams.get("make") || "";
  const bodyType = searchParams.get("bodyType") || "";
  const fuelType = searchParams.get("fuelType") || "";
  const transmission = searchParams.get("transmission") || "";
  const minPrice = searchParams.get("minPrice") || 0;
  const maxPrice = searchParams.get("maxPrice") || Number.MAX_SAFE_INTEGER;
  const sortBy = searchParams.get("sortBy") || "newest";
  const page = parseInt(searchParams.get("page") || "1");

  const { loading, fn: fetchCars, data: result, error } = useFetch(getCars);

  useEffect(() => {
    fetchCars(
      search,
      make,
      bodyType,
      fuelType,
      transmission,
      minPrice,
      maxPrice,
      sortBy,
      page,
      limit
    );
  }, [
    search,
    make,
    bodyType,
    fuelType,
    transmission,
    minPrice,
    maxPrice,
    sortBy,
    page,
  ]);

  if (loading && !result) {
    return <CarListingsLoading />;
  }

  if (error || (!result && !result?.success)) {
    return (
      <Alert variant="destructive">
        <Info className="size-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load cars. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (!result || !result?.data) {
    return null;
  }

  const { data: cars, pagination } = result;
  console.log(cars);

  if (cars.length === 0) {
    return (
      <div className="flex-center min-h-96 flex-col rounded-lg border bg-gray-50 p-8 text-center">
        <div className="mb-4 rounded-full bg-gray-100 p-4">
          <Info className="h-8 w-8 text-gray-500" />
        </div>
        <h3 className="mb-2 text-lg font-medium">No Cars Found.</h3>
        <p className="mb-6 max-w-md text-gray-500">
          We couldn't find any cars matching your search criteria. Try adjusting
          your filters or search term.
        </p>
        <Button variant="outline" asChild>
          <Link href="/cars">Clear all filters</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Results count and current page */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-gray-600">
          Showing{" "}
          <span className="font-medium">
            {(page - 1) * limit + 1}-{Math.min(page * limit, pagination.total)}
          </span>{" "}
          of <span className="font-medium">{pagination.total}</span> cars
        </p>
      </div>

      {/* Car Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {cars.map((car) => (
          <CarCard key={car.id} car={car} />
        ))}
      </div>
    </div>
  );
}

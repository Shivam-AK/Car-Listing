"use client";

import { getCars } from "@/actions/carListing";
import CarCard from "@/components/CarCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import useFetch from "@/hooks/useFetch";
import { Info } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import CarListingsLoading from "./CarListingsLoading";

export default function CarListings() {
  const searchParams = useSearchParams();
  const limit = 9;
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(searchParams.get("page") || 1);

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

  useEffect(() => {
    if (currentPage !== page) {
      const params = new URLSearchParams(searchParams);
      params.set("page", currentPage.toString());
      router.push(`?${params.toString()}`);
    }
  }, [currentPage, router, searchParams, page]);

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

  // Handle pagination clicks
  const handlePageChange = (pageNum) => {
    setCurrentPage(pageNum);
  };

  // Generate pagination URL
  const getPaginationUrl = (pageNum) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNum.toString());
    return `?${params.toString()}`;
  };

  // Generate pagination items
  const paginationItems = [];

  // Calculate which page numbers to show (first, last, and around current page)
  const visiblePageNumbers = [];

  // Always show page 1
  visiblePageNumbers.push(1);

  // Show pages around current page
  for (
    let i = Math.max(2, page - 1);
    i <= Math.min(pagination.pages - 1, page + 1);
    i++
  ) {
    visiblePageNumbers.push(i);
  }

  // Always show last page if there's more than 1 page
  if (pagination.pages > 1) {
    visiblePageNumbers.push(pagination.pages);
  }

  // Sort and deduplicate
  const uniquePageNumbers = [...new Set(visiblePageNumbers)].sort(
    (a, b) => a - b
  );

  // Create pagination items with ellipses
  let lastPageNumber = 0;
  uniquePageNumbers.forEach((pageNumber) => {
    if (pageNumber - lastPageNumber > 1) {
      // Add ellipsis
      paginationItems.push(
        <PaginationItem key={`ellipsis-${pageNumber}`}>
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    paginationItems.push(
      <PaginationItem key={pageNumber}>
        <PaginationLink
          href={getPaginationUrl(pageNumber)}
          isActive={pageNumber === page}
          onClick={(e) => {
            e.preventDefault();
            handlePageChange(pageNumber);
          }}
        >
          {pageNumber}
        </PaginationLink>
      </PaginationItem>
    );

    lastPageNumber = pageNumber;
  });

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
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {cars.map((car) => (
          <CarCard key={car.id} car={car} />
        ))}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={getPaginationUrl(page - 1)}
                onClick={(e) => {
                  e.preventDefault();
                  if (page > 1) {
                    handlePageChange(page - 1);
                  }
                }}
                className={page <= 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>

            {paginationItems}

            <PaginationItem>
              <PaginationNext
                href={getPaginationUrl(page + 1)}
                onClick={(e) => {
                  e.preventDefault();
                  if (page < pagination.pages) {
                    handlePageChange(page + 1);
                  }
                }}
                className={
                  page >= pagination.pages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}

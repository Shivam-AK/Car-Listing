import CarCard from "@/components/CarCard";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import Link from "next/link";

export default function SavedCarsList({ initialData }) {
  if (!initialData?.data || initialData?.data.length === 0) {
    return (
      <div className="flex-center min-h-96 flex-col rounded-lg border bg-gray-50 p-8 text-center">
        <div className="mb-4 rounded-full bg-gray-100 p-4">
          <Heart className="size-8 text-gray-500" />
        </div>
        <h3 className="mb-2 text-lg font-medium">No Saved Cars</h3>
        <p className="mb-6 max-w-md text-gray-500">
          You haven't saved any cars yet. Browse our listings and click the
          heart icon to save cars for later.
        </p>
        <Button variant="default" asChild>
          <Link href="/cars">Browse Cars</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {initialData?.data?.map((car) => (
        <CarCard key={car.id} car={{ ...car, wishlist: true }} />
      ))}
    </div>
  );
}

import { Skeleton } from "@/components/ui/skeleton";
import CarListingsLoading from "./_components/CarListingsLoading";

export default function Loading() {
  return (
    <section className="container mx-auto px-4 py-12">
      <h1 className="gradient-title mb-4 text-6xl">Browse Cars</h1>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Filters Section */}
        <div className="w-full flex-shrink-0 lg:w-80">
          <div className="flex justify-between gap-4 lg:flex-col">
            <Skeleton className="h-9 w-full" />
            <div className="sticky top-24 hidden overflow-hidden rounded-lg border lg:block">
              <Skeleton className="h-16 w-full" />
              <div className="space-y-5 p-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
              <div className="border-t p-4">
                <Skeleton className="h-9 w-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Car Listing */}
        <div className="flex-1">
          <CarListingsLoading />
        </div>
      </div>
    </section>
  );
}

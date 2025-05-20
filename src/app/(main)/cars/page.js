import { getCarFilters } from "@/actions/carListing";
import CarFilters from "./_components/CarFilters";

export default async function Cars() {
  const filters = await getCarFilters();
  return (
    <section className="container mx-auto px-4 py-12">
      <h1 className="gradient-title mb-4 text-6xl">Browse Cars</h1>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Filters Section */}
        <div className="w-full flex-shrink-0 lg:w-80">
          <CarFilters filters={filters.data} />
        </div>
      </div>
    </section>
  );
}

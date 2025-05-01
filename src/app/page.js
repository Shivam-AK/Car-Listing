import CarCard from "@/components/CarCard";
import HomeSearch from "@/components/HomeSearch";
import { Button } from "@/components/ui/button";
import { featuredCars } from "@/lib/constants";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <section className="relative py-16 md:py-28 dotted-background">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="gradient-title text-5xl md:text-8xl mb-4">
              Find Your Dream Car with Vehiql AI
            </h1>
            <p className="text-xl text-gray-300 mx-auto max-w-2xl mb-8">
              Advanced AI Car Search and test drive from thousands of vehicles.
            </p>

            <HomeSearch />
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-5">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Featured Cars</h2>
            <Button variant="ghost" className="flex items-center" asChild>
              <Link href="/cars">
                View All <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-5">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Browse by Make</h2>
            <Button variant="ghost" className="flex items-center" asChild>
              <Link href="/cars">
                View All <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"></div>
        </div>
      </section>
    </>
  );
}

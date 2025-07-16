import CarCardLoading from "@/components/CarCardLoading";
import FeaturedCars from "@/components/FeaturedCars";
import HomeSearch from "@/components/HomeSearch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { bodyTypes, carMakes, faqItems } from "@/lib/constants";
import { SignedOut } from "@clerk/nextjs";
import { Calendar, Car, ChevronRight, Shield } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

export default function Home() {
  return (
    <>
      <section className="dotted-background relative py-16 md:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-8">
            <h1 className="gradient-title mb-4 text-5xl md:text-8xl">
              Find Your Dream Car with Vehiql AI
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-300">
              Advanced AI Car Search and test drive from thousands of vehicles.
            </p>

            <HomeSearch />
          </div>
        </div>
      </section>

      {/* Featured Cars */}
      <section className="py-12">
        <div className="container mx-auto px-5">
          <div className="flex-between mb-8">
            <h2 className="text-2xl font-bold">Featured Cars</h2>
            <Button variant="ghost" className="flex items-center" asChild>
              <Link href="/cars">
                View All <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <Suspense fallback={<CarCardLoading item={3} />}>
            <FeaturedCars />
          </Suspense>
        </div>
      </section>

      {/* Browse by Make */}
      <section className="bg-gray-50 py-12">
        <div className="container mx-auto px-5">
          <div className="flex-between mb-8">
            <h2 className="text-2xl font-bold">Browse by Make</h2>
            <Button variant="ghost" className="flex items-center" asChild>
              <Link href="/cars">
                View All <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
            {carMakes.map((make) => (
              <Link
                key={make.id}
                href={`/cars?make=${make.name}`}
                className="cursor-pointer rounded-lg bg-white p-4 text-center shadow transition hover:shadow-md"
              >
                <div className="relative mx-auto mb-2 h-16 w-auto">
                  <Image
                    src={make.image}
                    alt={`${make.name} Logo`}
                    fill
                    className="object-contain"
                  />
                </div>
                <h3 className="font-medium">{make.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Our Platform */}
      <section className="py-12">
        <div className="container mx-auto px-5">
          <h2 className="mb-12 text-center text-2xl font-bold">
            Why Choose Our Platform
          </h2>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="flex-center mx-auto mb-4 size-16 rounded-full bg-blue-100 text-blue-700">
                <Car className="size-8" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Wide Selection</h3>
              <p className="text-gray-600">
                Thousands of verified vehicles from trusted dealerships and
                private sellers.
              </p>
            </div>
            <div className="text-center">
              <div className="flex-center mx-auto mb-4 size-16 rounded-full bg-blue-100 text-blue-700">
                <Calendar className="size-8" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Easy Test Drive</h3>
              <p className="text-gray-600">
                Book a test drive online in minutes, with flexible scheduling
                options.
              </p>
            </div>
            <div className="text-center">
              <div className="flex-center mx-auto mb-4 size-16 rounded-full bg-blue-100 text-blue-700">
                <Shield className="size-8" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Secure Process</h3>
              <p className="text-gray-600">
                Verified listings and secure booking process for peace of mind.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Browse by Body Type */}
      <section className="bg-gray-50 py-12">
        <div className="container mx-auto px-5">
          <div className="flex-between mb-8">
            <h2 className="text-2xl font-bold">Browse by Body Type</h2>
            <Button variant="ghost" className="flex items-center" asChild>
              <Link href="/cars">
                View All <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {bodyTypes.map((type) => (
              <Link
                key={type.id}
                href={`/cars?bodyType=${type.name}`}
                className="group relative cursor-pointer"
              >
                <div className="relative mb-8 flex h-28 justify-end overflow-hidden rounded-lg">
                  <Image
                    src={type.image}
                    alt={`${type.name} Car`}
                    fill
                    className="object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 flex items-end rounded-lg bg-gradient-to-t from-black/70 to-transparent">
                  <h3 className="pb-2 pl-4 text-xl font-bold text-white">
                    {type.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12">
        <div className="container mx-auto px-5">
          <h2 className="mb-8 text-center text-2xl font-bold">
            Frequently Asked Questions
          </h2>

          <Accordion type="single" collapsible className="mx-auto max-w-2xl">
            {faqItems.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Call to Action Button */}
      <section className="dotted-background py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">
            Ready to Find Your Dream Car?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-blue-100">
            Join thousands of satisfied customers who found their perfect
            vehicle through our platform.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/cars">View All Cars</Link>
            </Button>
            <SignedOut>
              <Button
                size="lg"
                className="bg-blue-800 hover:bg-blue-900"
                asChild
              >
                <Link href="/sign-up">Sign Up Now</Link>
              </Button>
            </SignedOut>
          </div>
        </div>
      </section>
    </>
  );
}

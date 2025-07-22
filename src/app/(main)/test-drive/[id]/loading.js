import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2 } from "lucide-react";

export default function Loading() {
  return (
    <section className="container mx-auto px-4 py-12">
      <h1 className="gradient-title mb-6 text-6xl">Book a Test Drive</h1>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-8 md:col-span-1">
          <Card className="mb:py-5 py-4">
            <CardContent className="mb:px-5 px-4">
              <h2 className="mb-4 text-xl font-bold">Car Details</h2>

              <div className="space-y-3">
                <Skeleton className="aspect-video" />
                <Skeleton className="h-7 w-full" />
                <Skeleton className="h-7 w-full" />
                <Skeleton className="h-36 w-full" />
              </div>
            </CardContent>
          </Card>

          <Card className="mb:py-5 py-4">
            <CardContent className="mb:px-5 px-4">
              <h2 className="mb-4 text-xl font-bold">Dealership Info</h2>
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        </div>

        <div className="col-span-1 lg:col-span-2">
          <Card className="mb:py-5 py-4">
            <CardContent className="mb:px-5 px-4">
              <h2 className="mb-6 text-xl font-bold">
                Schedule Your Test Drive
              </h2>

              <div className="space-y-6">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-9 w-full" />
              </div>

              <div className="mt-8 rounded-lg bg-gray-50 p-4">
                <h3 className="mb-2 font-medium">What to expect</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle2 className="mt-0.5 mr-2 size-4 text-green-500" />
                    Bring your driver's license for verification
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="mt-0.5 mr-2 size-4 text-green-500" />
                    Test drives typically last 30-60 minutes
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="mt-0.5 mr-2 size-4 text-green-500" />
                    A dealership representative will accompany you
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

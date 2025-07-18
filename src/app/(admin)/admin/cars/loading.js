import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <section className="mb:p-5 p-3.5">
      <h1 className="mb-7 text-2xl font-bold">Cars Management</h1>

      <div className="space-y-4">
        <div className="mb:flex-row flex flex-col items-start justify-between gap-4 sm:items-center">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-60" />
        </div>
        <Card className="py-3.5 sm:py-5">
          <CardContent className="px-3.5 sm:px-5">
            <Skeleton className="h-44 w-full" />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

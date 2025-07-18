import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <section className="container mx-auto space-y-6 px-4 py-12">
      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="w-full lg:w-7/12">
          <Skeleton className="relative mb-4 aspect-video rounded-lg" />
          <div className="flex gap-2 pb-2">
            {Array(4)
              .fill(1)
              .map((_, i) => (
                <div key={i} className="h-20 w-24 rounded-md">
                  <Skeleton className="size-full" />
                </div>
              ))}
          </div>
          <div className="mt-4 flex gap-4">
            <Skeleton className="h-9 flex-1" />
            <Skeleton className="h-9 flex-1" />
          </div>
        </div>

        <div className="w-full space-y-6 lg:w-5/12">
          <div className="space-y-2.5">
            <Skeleton className="h-5 w-11" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
          <div className="space-y-6">
            <div className="flex gap-x-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-5 rounded-md border p-4 md:flex-row">
        <Skeleton className="min-h-40 w-full" />
        <Skeleton className="min-h-72 w-full" />
      </div>
      <div className="space-y-6 rounded-md border p-4">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-64 w-full" />
      </div>
      <div className="space-y-6 rounded-md border p-4">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-64 w-full" />
      </div>
    </section>
  );
}

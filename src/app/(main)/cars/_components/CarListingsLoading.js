import { Skeleton } from "@/components/ui/skeleton";

export default function CarListingsLoading() {
  return (
    <>
      <Skeleton className="mb-5 h-8 w-40" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array(6)
          .fill(1)
          .map((_, i) => (
            <div className="overflow-hidden rounded-lg border" key={i}>
              <Skeleton className="h-48 w-full" />
              <div className="space-y-3 p-4">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-9 flex-1" />
                </div>
              </div>
            </div>
          ))}
      </div>
    </>
  );
}

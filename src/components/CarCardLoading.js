import { Skeleton } from "./ui/skeleton";

export default function CarCardLoading({ item = 3 }) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      {Array(item)
        .fill(1)
        .map((_, i) => (
          <div className="overflow-hidden rounded-lg border" key={i}>
            <Skeleton className="h-60 w-full" />
            <div className="space-y-3 p-4">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-9 flex-1" />
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}

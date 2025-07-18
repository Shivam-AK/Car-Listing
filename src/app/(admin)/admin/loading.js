import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <section className="mb:p-5 p-3.5">
      <h1 className="mb-7 text-2xl font-bold">Dashboard</h1>

      <Skeleton className="mb-2 h-9 w-44" />
      <div className="mb:grid-cols-2 mb-6 grid gap-4 lg:grid-cols-4">
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-36 w-full" />
      </div>

      <div className="space-y-4 rounded-md border p-5">
        <Skeleton className="h-9 w-44" />
        <div className="mb:grid-cols-2 grid gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="mb:grid-cols-3 mt-6 grid grid-cols-2 justify-center gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    </section>
  );
}

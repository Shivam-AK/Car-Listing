import { Skeleton } from "@/components/ui/skeleton";
import { CalendarRange } from "lucide-react";

export default function Loading() {
  return (
    <section className="mb:p-5 p-3.5">
      <h1 className="mb-7 text-2xl font-bold">Test Drive Management</h1>

      <div className="space-y-5">
        <div className="mb:flex-row flex w-full flex-col gap-4">
          <Skeleton className="mb:w-36 h-9 w-full" />
          <Skeleton className="h-9 flex-1" />
        </div>
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <h2 className="flex items-center gap-2 leading-none font-semibold">
              <CalendarRange className="size-5" />
              Test Drive Bookings
            </h2>
            <p className="text-muted-foreground text-sm">
              Manage all test drive reservations and update their status
            </p>
          </div>
          <div className="space-y-5">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    </section>
  );
}

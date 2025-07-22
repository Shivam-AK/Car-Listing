import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <section className="mb:p-5 p-3.5">
      <h1 className="mb-6 text-2xl font-bold">Settings</h1>

      <Skeleton className="mb-2 h-9 w-64" />
      <Card className="py-3.5 sm:py-5">
        <CardHeader className="px-3.5 sm:px-5">
          <CardTitle>Working Hours</CardTitle>
          <CardDescription>
            Set your Dealership's working hours for each day of the week.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3.5 sm:px-5">
          <div className="space-y-4">
            {Array(7)
              .fill(1)
              .map((_, i) => (
                <Skeleton key={i} className="w-full p-3">
                  <div className="mb:min-h-20 min-h-32 lg:min-h-9" />
                </Skeleton>
              ))}
          </div>
          <Skeleton className="float-end mt-6 h-9 w-48" />
        </CardContent>
      </Card>
    </section>
  );
}

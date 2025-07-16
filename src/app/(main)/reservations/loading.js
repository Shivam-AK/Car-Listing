import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <section className="container mx-auto px-4 py-12">
      <h1 className="gradient-title mb-6 text-6xl">Your Reservations</h1>
      <Skeleton className="h-96 w-full" />
    </section>
  );
}

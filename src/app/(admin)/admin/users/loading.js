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
      <h1 className="mb-6 text-2xl font-bold">Users Management</h1>

      <Card>
        <CardHeader>
          <CardTitle>All User</CardTitle>
          <CardDescription>Manage users with admin privileges.</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="mb-6 h-9 w-full" />
          <Skeleton className="h-36 w-full" />
        </CardContent>
      </Card>
    </section>
  );
}

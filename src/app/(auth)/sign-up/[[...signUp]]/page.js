import { Skeleton } from "@/components/ui/skeleton";
import { SignUp } from "@clerk/nextjs";
import { Suspense } from "react";

export default function SignUpPage() {
  return (
    <Suspense>
      <SignUp fallback={<Skeleton className="h-[560px] w-96" />} />
    </Suspense>
  );
}

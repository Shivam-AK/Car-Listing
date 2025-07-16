import { Skeleton } from "@/components/ui/skeleton";
import { SignIn } from "@clerk/nextjs";
import { Suspense } from "react";

export default function SignInPage() {
  return (
    <Suspense>
      <SignIn fallback={<Skeleton className="h-[480px] w-96" />} />
    </Suspense>
  );
}

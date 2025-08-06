import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";

const SignIn = dynamic(() => import("@clerk/nextjs").then((mod) => mod.SignIn));

export default function SignInPage() {
  return <SignIn fallback={<Skeleton className="h-[480px] w-96" />} />;
}

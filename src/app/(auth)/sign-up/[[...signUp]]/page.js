import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";

const SignUp = dynamic(() => import("@clerk/nextjs").then((mod) => mod.SignUp));

export default function SignUpPage() {
  return <SignUp fallback={<Skeleton className="h-[560px] w-96" />} />;
}

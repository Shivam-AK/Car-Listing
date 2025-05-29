import { getCarById } from "@/actions/carListing";
import { notFound } from "next/navigation";
import TestDriveForm from "./_components/TestDriveForm";

export async function generateMetadata() {
  return {
    title: `Book Test Drive`,
    description: `Schedule a test drive in few seconds.`,
  };
}

export default async function TestDriveById({ params }) {
  const { id } = await params;
  const result = await getCarById(id);

  if (!result.success) {
    return notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="gradient-title mb-6 text-6xl">Book a Test Drive</h1>
      <TestDriveForm
        car={result.data}
        testDriveInfo={result.data.testDriveInfo}
      />
    </div>
  );
}

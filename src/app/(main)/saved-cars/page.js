import { getSavedCars } from "@/actions/carListing";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import SavedCarsList from "./_components/SavedCarsList";

export const metadata = {
  title: "Saved Cars",
  description: "View your Saved Cars and Favorites",
};

export default async function SavedCars() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect=/saved-cars");
  }

  const savedCars = await getSavedCars();

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="gradient-title mb-6 text-6xl">Your Saved Cars</h1>
      <SavedCarsList initialData={savedCars} />
    </div>
  );
}

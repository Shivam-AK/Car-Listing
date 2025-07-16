import CarCardLoading from "@/components/CarCardLoading";
import { Suspense } from "react";
import SavedCarsList from "./_components/SavedCarsList";

export const metadata = {
  title: "Saved Cars",
  description: "View your Saved Cars and Favorites",
};

export default async function SavedCars() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="gradient-title mb-6 text-6xl">Your Saved Cars</h1>
      <Suspense fallback={<CarCardLoading item={3} />}>
        <SavedCarsList />
      </Suspense>
    </div>
  );
}

import { getAllDealerships } from "@/actions/admin";
import SelectSearchParams from "../_components/SelectSearchParams";
import TestDrivesList from "../_components/TestDrivesList";

export const metadata = {
  title: "Test Drives",
  description: "Manage Test Drive Bookings",
};

export default async function TestDrives({ _, searchParams }) {
  const search = await searchParams;
  const dealerships = await getAllDealerships();

  return (
    <section className="mb:p-5 p-3.5">
      <div className="mb:flex-row mb-6 flex flex-col justify-between gap-3">
        <h1 className="text-2xl font-bold">Test Drive Management</h1>
        {dealerships.data.currentDealership?.user?.role === "ADMIN" && (
          <SelectSearchParams
            params={search.filter}
            dealership={dealerships.data.dealerships}
            currentDealership={dealerships.data.currentDealership}
          />
        )}
      </div>
      <TestDrivesList params={search.filter} />
    </section>
  );
}

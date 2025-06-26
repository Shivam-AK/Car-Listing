import { getAllDealerships } from "@/actions/admin";
import CarList from "../_components/CarList";
import SelectSearchParams from "../_components/SelectSearchParams";

export const metadata = {
  title: "Cars",
  description: "Manage Your Cars in Your Marketplace",
};

export default async function Cars({ _, searchParams }) {
  const search = await searchParams;
  const dealerships = await getAllDealerships(search.filter);

  return (
    <section className="mb:p-5 p-3.5">
      <div className="mb:flex-row mb-6 flex flex-col justify-between gap-3">
        <h1 className="text-2xl font-bold">Cars Management</h1>
        {dealerships.data.currentDealership?.user?.role === "ADMIN" && (
          <SelectSearchParams
            params={search.filter}
            dealership={dealerships.data.dealerships}
            currentDealership={dealerships.data.currentDealership}
          />
        )}
      </div>
      <CarList params={search.filter} />
    </section>
  );
}

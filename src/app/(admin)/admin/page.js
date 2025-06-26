import { getDashboardData } from "@/actions/admin";
import Dashboard from "./_components/Dashboard";
import SelectSearchParams from "./_components/SelectSearchParams";

export const metadata = {
  title: "Dashboard",
  description: "Admin Dashboard for Vehiql Car Marketplace",
};

export default async function Admin({ _, searchParams }) {
  const search = await searchParams;
  const dashboardData = await getDashboardData(search.filter);

  return (
    <section className="mb:p-5 p-3.5">
      <div className="mb:flex-row mb-6 flex flex-col justify-between gap-3">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        {dashboardData.data.currentDealership?.user?.role === "ADMIN" && (
          <SelectSearchParams
            params={search.filter}
            dealership={dashboardData.data.dealership}
            currentDealership={dashboardData.data.currentDealership}
          />
        )}
      </div>
      <Dashboard initialData={dashboardData} />
    </section>
  );
}

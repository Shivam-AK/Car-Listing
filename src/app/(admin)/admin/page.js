import { getDashboardData } from "@/actions/admin";
import Dashboard from "./_components/Dashboard";

export const metadata = {
  title: "Dashboard",
  description: "Admin Dashboard for Vehiql Car Marketplace",
};

export default async function Admin() {
  const dashboardData = await getDashboardData();
  return (
    <section className="mb:p-5 p-3.5">
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
      <Dashboard initialData={dashboardData} />
    </section>
  );
}

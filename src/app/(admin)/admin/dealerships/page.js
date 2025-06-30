import NotFound from "@/app/not-found";
import { getLoggedInUser } from "@/lib/auth";
import DealershipList from "../_components/DealershipList";

export const metadata = {
  title: "Dealerships",
  description: "Manage Your Dealerships in Your Marketplace",
};

export default async function Dealerships() {
  const user = await getLoggedInUser();

  if (user instanceof Error) return NotFound();
  if (user?.role !== "ADMIN") return NotFound();

  return (
    <section className="mb:p-5 p-3.5">
      <h1 className="mb-6 text-2xl font-bold">Dealerships Management</h1>
      <DealershipList />
    </section>
  );
}

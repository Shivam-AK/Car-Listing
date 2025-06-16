import DealershipList from "../_components/DealershipList";

export const metadata = {
  title: "Dealerships",
  description: "Manage Your Dealerships in Your Marketplace",
};

export default function Dealerships() {
  return (
    <section className="mb:p-5 p-3.5">
      <h1 className="mb-6 text-2xl font-bold">Dealerships Management</h1>
      <DealershipList />
    </section>
  );
}

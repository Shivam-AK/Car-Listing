import AddCarForm from "../../_components/AddCarForm";

export const metadata = {
  title: "Add New Car",
  description: "Add a New Car to The Marketplace",
};

export default function Cars() {
  return (
    <section className="mb:p-5 p-3.5">
      <h1 className="mb-6 text-2xl font-bold">Add New Car</h1>
      <AddCarForm />
    </section>
  );
}

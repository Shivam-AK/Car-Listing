import AddCarForm from "../../_components/AddCarForm";

export const metadata = {
  title: "Add New Car",
  description: "Add a New Car to The Marketplace",
};

export default function Cars() {
  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Add New Car</h1>
      <AddCarForm />
    </div>
  );
}

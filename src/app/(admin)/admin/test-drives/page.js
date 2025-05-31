import TestDrivesList from "../_components/TestDrivesList";

export const metadata = {
  title: "Test Drives",
  description: "Manage Test Drive Bookings",
};

export default function TestDrives() {
  return (
    <section className="mb:p-5 p-3.5">
      <h1 className="mb-6 text-2xl font-bold">Test Drive Management</h1>
      <TestDrivesList />
    </section>
  );
}

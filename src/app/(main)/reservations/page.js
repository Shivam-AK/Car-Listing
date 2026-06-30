import ReservationsList from "./_components/ReservationsList";

export const metadata = {
  title: "My Reservations",
  description: "Manage your Test Drive Reservations.",
};

export default async function Reservations() {
  return (
    <section className="container mx-auto px-4 py-12">
      <h1 className="gradient-title mb-6 text-6xl">Your Reservations</h1>
      <ReservationsList />
    </section>
  );
}

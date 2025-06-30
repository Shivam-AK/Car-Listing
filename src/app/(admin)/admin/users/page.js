import NotFound from "@/app/not-found";
import { getLoggedInUser } from "@/lib/auth";
import UserList from "../_components/UserList";

export const metadata = {
  title: "Users",
  description: "Manage Your All Users",
};

export default async function User() {
  const user = await getLoggedInUser();

  if (user instanceof Error) return NotFound();
  if (user?.role !== "ADMIN") return NotFound();

  return (
    <section className="mb:p-5 p-3.5">
      <h1 className="mb-6 text-2xl font-bold">Users Management</h1>
      <UserList />
    </section>
  );
}

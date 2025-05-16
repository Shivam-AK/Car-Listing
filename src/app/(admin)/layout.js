import { getAdmin } from "@/actions/admin";
import Header from "@/components/Header";
import { notFound } from "next/navigation";
import Sidebar from "./admin/_components/Sidebar";

export default async function AdminLayout({ children }) {
  const admin = await getAdmin();

  if (!admin.authorized) {
    return notFound();
  }

  return (
    <>
      <Header isAdminPage />
      <Sidebar />
      <main className="mt-16 h-full md:ml-56">{children}</main>
    </>
  );
}

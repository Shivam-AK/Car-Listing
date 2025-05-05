import { getAdmin } from "@/actions/admin";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
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
      <main className="md:ml-56 mt-16 h-full">{children}</main>
    </>
  );
}

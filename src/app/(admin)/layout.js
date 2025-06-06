import { getAdmin } from "@/actions/admin";
import AppSidebar from "@/components/AppSidebar";
import { MainContent } from "@/components/CustomTrigger";
import Header from "@/components/Header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { notFound } from "next/navigation";

// import Sidebar from "./admin/_components/Sidebar"

export default async function AdminLayout({ children }) {
  const admin = await getAdmin();

  if (!admin.authorized) {
    return notFound();
  }

  return (
    <>
      <Header isAdminPage />
      {/* <Sidebar /> */}
      <SidebarProvider className="mt-16 min-h-[calc(100svh-4rem)]">
        <AppSidebar />
        <MainContent>{children}</MainContent>
      </SidebarProvider>
    </>
  );
}

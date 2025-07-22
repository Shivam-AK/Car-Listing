"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Calendar,
  Car,
  Landmark,
  LayoutDashboard,
  PanelLeftIcon,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CustomTrigger } from "./CustomTrigger";

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Cars",
    url: "/admin/cars",
    icon: Car,
  },
  {
    title: "Users",
    url: "/admin/users",
    icon: Users,
  },
  {
    title: "Dealerships",
    url: "/admin/dealerships",
    icon: Landmark,
  },
  {
    title: "Test Drive",
    url: "/admin/test-drives",
    icon: Calendar,
  },
  {
    title: "Settings",
    url: "/admin/settings",
    icon: Settings,
  },
];

const privateUrl = ["/admin/users", "/admin/dealerships"];

export default function AppSidebar({ user }) {
  const { isMobile, toggleSidebar } = useSidebar();
  const pathname = usePathname();

  return (
    <Sidebar
      collapsible="icon"
      side={isMobile ? "right" : "left"}
      className="mt-16 h-[calc(100svh-4rem)]"
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map(
                (item) =>
                  (user.role === "ADMIN" || !privateUrl.includes(item.url)) && (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <Link
                          href={item.url}
                          onClick={isMobile && toggleSidebar}
                          className={pathname === item.url && "bg-green-100/70"}
                        >
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <CustomTrigger>
              <SidebarMenuButton>
                <PanelLeftIcon />
                <span className="truncate font-medium"> Toggle Sidebar</span>
              </SidebarMenuButton>
            </CustomTrigger>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

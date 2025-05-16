"use client";

import { cn } from "@/lib/utils";
import { Calendar, Car, Cog, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

// Navigation items
const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin",
  },
  {
    label: "Cars",
    icon: Car,
    href: "/admin/cars",
  },
  {
    label: "Test Drives",
    icon: Calendar,
    href: "/admin/test-drives",
  },
  {
    label: "Settings",
    icon: Cog,
    href: "/admin/settings",
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside>
      {/* Desktop Sidebar */}
      <div className="fixed inset-y-0 top-16 z-50 hidden h-full w-56 flex-col overflow-y-auto border-r bg-white shadow-sm md:flex">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex h-12 items-center gap-x-2 pl-6 text-sm font-medium text-slate-500 transition-all hover:bg-slate-100/50 hover:text-slate-600",
              pathname === route.href
                ? "bg-blue-100/50 text-blue-700 hover:bg-blue-100 hover:text-blue-700"
                : ""
            )}
          >
            <route.icon className="size-5" />
            {route.label}
          </Link>
        ))}
      </div>

      {/* Mobile Bottom Tabs */}
      <div className="fixed right-0 bottom-0 left-0 z-50 flex h-16 items-center justify-around border-t bg-white md:hidden">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex-center flex-1 flex-col py-1 text-xs font-medium text-slate-500 transition-all",
              pathname === route.href ? "text-blue-700" : ""
            )}
          >
            <route.icon
              className={cn(
                "mb-1 size-6",
                pathname === route.href ? "text-blue-700" : "text-slate-500"
              )}
            />
            {route.label}
          </Link>
        ))}
      </div>
    </aside>
  );
}

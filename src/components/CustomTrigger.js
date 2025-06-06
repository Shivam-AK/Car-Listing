"use client";

import { cn } from "@/lib/utils";
import { useSidebar } from "./ui/sidebar";

export function CustomTrigger({ children }) {
  const { toggleSidebar } = useSidebar();

  return <div onClick={toggleSidebar}>{children}</div>;
}

export function MainContent({ children }) {
  const { state } = useSidebar();

  return (
    <main
      className={cn(
        "w-full",
        state === "collapsed"
          ? "md:w-[calc(100%-3rem)]"
          : "md:w-[calc(100%-16rem)]"
      )}
    >
      {children}
    </main>
  );
}

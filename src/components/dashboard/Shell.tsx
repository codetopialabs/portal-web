"use client";

import React from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DashboardNavbar } from "./Navbar";
import { DashboardSidebar } from "./Sidebar";

function getSidebarDefaultOpen() {
  if (typeof document === "undefined") return true;
  const match = document.cookie.match(/sidebar_state=([^;]+)/);
  return match ? match[1] === "true" : true;
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [defaultOpen] = React.useState(getSidebarDefaultOpen);

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <div className="flex min-h-screen w-full bg-white text-zinc-900 selection:bg-black selection:text-white relative font-mono overflow-hidden">
        <DashboardSidebar />
        <SidebarInset className="flex-1 flex flex-col min-w-0 w-full bg-[#f9fafb] relative h-screen overflow-hidden">
          <DashboardNavbar />

          <div className="flex-1 overflow-y-auto relative min-h-0 w-full">
            {/* Technical Background Overlays (Subtle for light mode) */}
            <div className="absolute inset-0 pointer-events-none z-0">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>

            <main className="relative z-10 flex flex-col min-h-full w-full">
              <div className="p-6 lg:p-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 w-full max-w-none">
                {children}
              </div>
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

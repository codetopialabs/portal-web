"use client";

import { DashboardSidebar } from "./Sidebar";
import { DashboardNavbar } from "./Navbar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-white text-zinc-900 selection:bg-black selection:text-white relative font-sans overflow-hidden">
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

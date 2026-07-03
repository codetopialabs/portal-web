import type React from "react";
import { DashboardShell } from "@/components/dashboard/Shell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell>
      <div className="max-w-6xl mx-auto pb-20 space-y-6">{children}</div>
    </DashboardShell>
  );
}

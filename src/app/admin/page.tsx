"use client";

import { Suspense } from "react";
import { AdminOverview } from "@/components/admin/AdminOverview";
import { RouteGuard } from "@/components/auth/RouteGuard";

function AdminPageContent() {
  return (
    <div className="pb-20">
      <AdminOverview />
    </div>
  );
}

export default function AdminPage() {
  return (
    <RouteGuard permission="admin.panel.access">
      <Suspense>
        <AdminPageContent />
      </Suspense>
    </RouteGuard>
  );
}

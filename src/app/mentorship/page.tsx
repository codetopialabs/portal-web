"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import React from "react";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { ComingSoonPanel } from "@/components/community/coming-soon-panel";
import { DashboardShell } from "@/components/dashboard/Shell";

function MentorshipSkeleton() {
  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <div className="h-4 w-16 bg-zinc-100 animate-pulse" />
        <div className="bg-white border border-zinc-200 p-6 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="h-5 w-48 bg-zinc-100 animate-pulse" />
              <div className="h-4 w-64 bg-zinc-100 animate-pulse" />
              <div className="h-4 w-40 bg-zinc-100 animate-pulse" />
            </div>
            <div className="h-8 w-16 bg-zinc-100 animate-pulse" />
          </div>
          <div className="h-1.5 bg-zinc-100 w-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function MentorshipPage() {
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <RouteGuard permission="authenticated">
      <DashboardShell>
        <div className="max-w-6xl mx-auto pb-20 space-y-10">
          {/* Header */}
          <div className="flex flex-col gap-4 border-b border-zinc-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="font-mono text-xs font-medium text-zinc-400">Member growth</p>
              <h1 className="mt-2 font-sans text-4xl font-bold tracking-tight text-zinc-950">
                Mentorship
              </h1>
              <p className="mt-2 max-w-2xl font-mono text-sm leading-6 text-zinc-500">
                Mentor matching, session planning, goals, and shared resources once mentorship
                opens.
              </p>
            </div>
            <Link
              href="/community?tab=members&role=Mentor"
              className="inline-flex h-10 w-fit items-center gap-2 border border-zinc-200 bg-white px-4 font-mono text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-900 hover:text-zinc-950"
            >
              Browse Mentors
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Content */}
          {loading ? (
            <MentorshipSkeleton />
          ) : (
            <ComingSoonPanel
              type="mentorship"
              title="Mentorship Coming Soon"
              description="Mentor pairings, shared milestones, 1-on-1 session logs, and collaborative goals will live here once the mentorship workspace is connected."
              statusText="This section will show real-time mentor interactions and schedule tracking once the module is connected. No placeholder pairings or dummy logs are being displayed."
            />
          )}
        </div>
      </DashboardShell>
    </RouteGuard>
  );
}

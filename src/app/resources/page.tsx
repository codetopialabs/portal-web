"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import React from "react";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { ComingSoonPanel } from "@/components/community/coming-soon-panel";
import { DashboardShell } from "@/components/dashboard/Shell";

function ResourcesSkeleton() {
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

export default function ResourcesPage() {
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
              <p className="font-mono text-xs font-medium text-zinc-400">Knowledge base</p>
              <h1 className="mt-2 font-sans text-4xl font-bold tracking-tight text-zinc-950">
                Resources
              </h1>
              <p className="mt-2 max-w-2xl font-mono text-sm leading-6 text-zinc-500">
                Search guides, videos, templates, and saved learning material from programs and the
                community.
              </p>
            </div>
            <Link
              href="/community"
              className="inline-flex h-10 w-fit items-center gap-2 border border-zinc-200 bg-white px-4 font-mono text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-900 hover:text-zinc-950"
            >
              Community
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Content */}
          {loading ? (
            <ResourcesSkeleton />
          ) : (
            <ComingSoonPanel
              type="resources"
              title="Resources Coming Soon"
              description="Searchable engineering templates, verified guides, video lectures, and shared toolkits will live here once the resources library is connected."
              statusText="This section will show real ecosystem documentation and curated technical articles once it is connected. No placeholder resource links or dummy books are being displayed."
            />
          )}
        </div>
      </DashboardShell>
    </RouteGuard>
  );
}

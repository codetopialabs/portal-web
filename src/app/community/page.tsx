"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { ComingSoonPanel } from "@/components/community/coming-soon-panel";
import {
  type CommunityTab,
  CommunityTabs,
  getCommunityTab,
} from "@/components/community/community-tabs";
import { MemberDirectory } from "@/components/community/member-directory";
import { DashboardShell } from "@/components/dashboard/Shell";
import { useCommunityMembers } from "@/hooks/useCommunityMembers";

const COMING_SOON_COPY: Record<
  Exclude<CommunityTab, "members">,
  {
    title: string;
    description: string;
  }
> = {
  events: {
    title: "Events Coming Soon",
    description:
      "Meetups, announcements, showcases, and community moments will live here once the events feature is connected.",
  },
  projects: {
    title: "Projects Coming Soon",
    description:
      "Community-led project listings will appear here once real projects are available.",
  },
};

function CommunityContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<CommunityTab>(() =>
    getCommunityTab(searchParams.get("tab"))
  );
  const { data: members = [], isLoading, error } = useCommunityMembers();

  function handleTabChange(tab: CommunityTab) {
    setActiveTab(tab);

    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);

    if (tab !== "members") {
      params.delete("role");
    }

    router.replace(`?${params.toString()}`, { scroll: false });
  }

  function handleRoleFilterChange(role: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (role === "all") {
      params.delete("role");
    } else {
      params.set("role", role);
      params.set("tab", "members");
    }

    router.replace(`?${params.toString()}`, { scroll: false });
  }

  const memberLoadError =
    error instanceof Error ? error.message : error ? "Unable to load members." : null;

  return (
    <DashboardShell>
      <div className="mx-auto max-w-7xl space-y-8 pb-20">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-xs font-medium text-zinc-400">Discover</p>
            <h1 className="mt-2 font-sans text-4xl font-bold tracking-tight text-zinc-950">
              Community
            </h1>
          </div>
        </div>

        <CommunityTabs activeTab={activeTab} onTabChange={handleTabChange} />

        {activeTab === "members" ? (
          <MemberDirectory
            members={members}
            isLoading={isLoading}
            error={memberLoadError}
            initialRoleFilter={searchParams.get("role") || "all"}
            onRoleFilterChange={handleRoleFilterChange}
          />
        ) : (
          <ComingSoonPanel {...COMING_SOON_COPY[activeTab]} type={activeTab} />
        )}
      </div>
    </DashboardShell>
  );
}

export default function CommunityPage() {
  return (
    <RouteGuard permission="authenticated">
      <Suspense fallback={null}>
        <CommunityContent />
      </Suspense>
    </RouteGuard>
  );
}

"use client";

import { cn } from "@/lib/utils";

export type CommunityTab = "members" | "events" | "projects";

export const COMMUNITY_TABS: { id: CommunityTab; label: string }[] = [
  { id: "members", label: "Members" },
  { id: "events", label: "Events" },
  { id: "projects", label: "Projects" },
];

export function getCommunityTab(value: string | null): CommunityTab {
  return COMMUNITY_TABS.some((tab) => tab.id === value) ? (value as CommunityTab) : "members";
}

interface CommunityTabsProps {
  activeTab: CommunityTab;
  onTabChange: (tab: CommunityTab) => void;
}

export function CommunityTabs({ activeTab, onTabChange }: CommunityTabsProps) {
  return (
    <div className="flex overflow-x-auto overflow-y-hidden border-b border-zinc-200">
      {COMMUNITY_TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "-mb-px whitespace-nowrap border-b-2 px-5 py-3 font-mono text-sm transition-all",
            activeTab === tab.id
              ? "border-zinc-900 text-zinc-900"
              : "border-transparent text-zinc-400 hover:border-zinc-300 hover:text-zinc-700"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

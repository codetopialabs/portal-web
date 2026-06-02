"use client";

import React from "react";
import { ActivityCalendar, type ThemeInput } from "react-activity-calendar";
import { Skeleton } from "@/components/ui/skeleton";
import { useContributions } from "@/hooks/useTeams";

interface ContributionGraphProps {
  username: string;
}

export function ContributionGraph({ username }: ContributionGraphProps) {
  const { data, isLoading, isError } = useContributions(username);

  const explicitTheme: ThemeInput = {
    light: ["#f4f4f5", "#d1d5db", "#9ca3af", "#4b5563", "#18181b"],
    dark: ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"],
  };

  if (isLoading) {
    return <Skeleton className="h-48 w-full" />;
  }

  if (isError || !data) {
    return (
      <div className="flex h-48 w-full items-center justify-center border border-zinc-200 bg-white">
        <p className="font-mono text-xs text-zinc-400">Could not load contribution data.</p>
      </div>
    );
  }

  return (
    <div className="border border-zinc-200 bg-white p-6">
      <div className="flex flex-col gap-6">
        <div>
          <h3 className="font-sans text-xl font-black text-zinc-950">
            Contribution Activity
          </h3>
          <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">
            Work reviews & approvals
          </p>
        </div>
        
        <div className="overflow-x-auto pb-2">
          <ActivityCalendar
            data={data}
            theme={explicitTheme}
            labels={{
              legend: {
                less: "Less",
                more: "More",
              },
              months: [
                "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
              ],
              totalCount: "{{count}} contributions in the last year",
            }}
          />
        </div>
      </div>
    </div>
  );
}

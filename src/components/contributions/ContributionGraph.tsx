"use client";

import {
  Activity as ActivityIcon,
  CalendarDays,
  GitCommitHorizontal,
  GitPullRequest,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { cloneElement, useState } from "react";
import {
  type Activity,
  ActivityCalendar,
  type BlockElement,
  type ThemeInput,
} from "react-activity-calendar";
import { useContributions } from "@/hooks/useTeams";
import type { ContributionDay, ContributionItem } from "@/services/teams.service";

interface ContributionGraphProps {
  username: string;
  joinedAt?: string;
  // True on the public profile page, which has no login wall. Internal
  // review links point at /teams/{slug}/reviews/{id}, which requires both
  // auth and team membership — for a logged-out (or unrelated) visitor
  // that link is just a dead end at the login screen, so show the detail
  // as plain text instead of a link there.
  isPublicView?: boolean;
}

const ITEM_TYPE_META: Record<
  ContributionItem["type"],
  { icon: React.ElementType; label: string; badgeClassName: string }
> = {
  review_approved: {
    icon: Sparkles,
    label: "Review approved",
    badgeClassName: "bg-emerald-50 text-emerald-600",
  },
  commit: {
    icon: GitCommitHorizontal,
    label: "Commit",
    badgeClassName: "bg-zinc-100 text-zinc-600",
  },
  pull_request_merged: {
    icon: GitPullRequest,
    label: "PR merged",
    badgeClassName: "bg-violet-50 text-violet-600",
  },
};

function formatDayLabel(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  return new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

function DayDetailPanel({
  day,
  onClose,
  isPublicView,
}: {
  day: ContributionDay;
  onClose: () => void;
  isPublicView?: boolean;
}) {
  return (
    <div className="mt-5 animate-in fade-in-0 slide-in-from-top-1 border border-zinc-200 bg-zinc-50 p-4 duration-200">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-zinc-950 text-white">
            <CalendarDays className="h-4 w-4" />
          </div>
          <div>
            <p className="font-sans text-sm font-black text-zinc-950">{formatDayLabel(day.date)}</p>
            <p className="font-mono text-[11px] text-zinc-500">
              {day.count} contribution{day.count !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="shrink-0 text-zinc-400 transition-colors hover:text-zinc-900"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-1.5">
        {day.items.map((item, i) => {
          const meta = ITEM_TYPE_META[item.type];
          const Icon = meta.icon;
          const content = (
            <>
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center ${meta.badgeClassName}`}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-xs text-zinc-800">{item.title}</p>
                <p className="font-mono text-[10px] font-medium text-zinc-400">{meta.label}</p>
              </div>
            </>
          );
          const linkClassName =
            "group flex items-center gap-3 border border-zinc-200 bg-white p-2.5 transition-all hover:border-zinc-900 hover:shadow-[2px_2px_0_0_rgba(0,0,0,0.08)]";

          if (item.source === "github") {
            return (
              <a
                // biome-ignore lint/suspicious/noArrayIndexKey: items have no stable id
                key={i}
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className={linkClassName}
              >
                {content}
              </a>
            );
          }

          // Internal review links require auth + team membership to view —
          // on the public profile that's just a login dead end, so show the
          // brief detail without a link instead of sending visitors there.
          if (isPublicView) {
            return (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: items have no stable id
                key={i}
                className="flex items-center gap-3 border border-zinc-200 bg-white p-2.5"
              >
                {content}
              </div>
            );
          }

          return (
            <Link
              // biome-ignore lint/suspicious/noArrayIndexKey: items have no stable id
              key={i}
              href={item.url}
              className={linkClassName}
            >
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function ContributionGraph({ username, joinedAt, isPublicView }: ContributionGraphProps) {
  const currentYear = new Date().getFullYear();
  const joinYear = joinedAt ? new Date(joinedAt).getFullYear() : currentYear;
  const years = [];
  for (let y = currentYear; y >= joinYear; y--) {
    years.push(y);
  }

  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  const [selectedDay, setSelectedDay] = useState<ContributionDay | null>(null);
  const { data, isLoading, isError } = useContributions(username, selectedYear);

  const explicitTheme: ThemeInput = {
    light: ["#f4f4f5", "#a7f3d0", "#34d399", "#059669", "#065f46"],
  };

  const contributions = data ?? [];
  const totalCount = contributions.reduce((sum, d) => sum + d.count, 0);

  if (isError || (!isLoading && !data)) {
    return (
      <div className="flex h-48 w-full items-center justify-center border border-zinc-200 bg-white">
        <p className="font-mono text-xs text-zinc-400">Could not load contribution data.</p>
      </div>
    );
  }

  const paddedContributions = (() => {
    const map = new Map(contributions.map((d) => [d.date, d]));
    const result: ContributionDay[] = [];

    if (selectedYear !== undefined) {
      // Pad from Jan 1 to Dec 31
      const startDate = new Date(Date.UTC(selectedYear, 0, 1));
      const endDate = new Date(Date.UTC(selectedYear, 11, 31));
      for (let d = new Date(startDate); d <= endDate; d.setUTCDate(d.getUTCDate() + 1)) {
        const yearStr = d.getUTCFullYear();
        const monthStr = String(d.getUTCMonth() + 1).padStart(2, "0");
        const dayStr = String(d.getUTCDate()).padStart(2, "0");
        const dateStr = `${yearStr}-${monthStr}-${dayStr}`;

        result.push(map.get(dateStr) ?? { date: dateStr, count: 0, level: 0, items: [] });
      }
    } else {
      // Pad last 365 days
      const today = new Date();
      for (let i = 364; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const yearStr = d.getFullYear();
        const monthStr = String(d.getMonth() + 1).padStart(2, "0");
        const dayStr = String(d.getDate()).padStart(2, "0");
        const dateStr = `${yearStr}-${monthStr}-${dayStr}`;

        result.push(map.get(dateStr) ?? { date: dateStr, count: 0, level: 0, items: [] });
      }
    }
    return result;
  })();

  const emptyState = !isLoading && contributions.length === 0;

  return (
    <div className="border border-zinc-200 bg-white p-6">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-zinc-950 text-white">
              <ActivityIcon className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-sans text-xl font-black text-zinc-950">Contribution Activity</h3>
              <p className="mt-0.5 font-mono text-xs font-medium text-zinc-500">
                {isLoading ? "Loading" : `${totalCount} contribution${totalCount !== 1 ? "s" : ""}`}
                {" · "}
                {selectedYear ? selectedYear : "Last year"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1 border border-zinc-200 p-1 self-start">
            <button
              type="button"
              onClick={() => {
                setSelectedYear(undefined);
                setSelectedDay(null);
              }}
              className={`px-3 py-1.5 font-mono text-[11px] whitespace-nowrap transition-colors ${
                selectedYear === undefined
                  ? "bg-zinc-950 text-white font-bold"
                  : "text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100"
              }`}
            >
              Last year
            </button>
            {years.map((year) => (
              <button
                key={year}
                type="button"
                onClick={() => {
                  setSelectedYear(year);
                  setSelectedDay(null);
                }}
                className={`px-3 py-1.5 font-mono text-[11px] whitespace-nowrap transition-colors ${
                  selectedYear === year
                    ? "bg-zinc-950 text-white font-bold"
                    : "text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100"
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>

        {/* react-activity-calendar renders its own internal horizontal
            scroll container (overflow-x: auto) sized to the SVG's natural
            width — wrapping it in another scrolling div here just nests
            two independent scroll containers and fights the library's own
            sizing, so this stays a plain block. */}
        <div className="min-h-56">
          {isLoading ? (
            <div className="flex h-56 w-full items-center justify-center border border-dashed border-zinc-200 bg-zinc-50">
              <p className="font-mono text-xs text-zinc-400 animate-pulse">
                Loading contributions...
              </p>
            </div>
          ) : emptyState ? (
            <div className="flex h-40 w-full items-center justify-center border border-dashed border-zinc-200 bg-zinc-50 text-center">
              <p className="max-w-xs text-sm text-zinc-500">
                No contributions found for {selectedYear ? selectedYear : "the last year"}.
              </p>
            </div>
          ) : (
            <ActivityCalendar
              data={paddedContributions}
              theme={explicitTheme}
              colorScheme="light"
              blockSize={13}
              blockMargin={4}
              blockRadius={3}
              renderBlock={(block: BlockElement, activity: Activity) => {
                const day = activity as ContributionDay;
                if (day.count === 0) return block;
                const isSelected = selectedDay?.date === day.date;
                return (
                  // biome-ignore lint/a11y/useSemanticElements: SVG content, <button> isn't valid here
                  <g
                    onClick={() => setSelectedDay(day)}
                    className="cursor-pointer [&>rect]:transition-[opacity,stroke-width] [&>rect]:duration-150 [&>rect]:hover:opacity-70"
                    role="button"
                    tabIndex={0}
                    aria-label={`${day.count} contribution${day.count !== 1 ? "s" : ""} on ${day.date}`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") setSelectedDay(day);
                    }}
                  >
                    {isSelected
                      ? cloneElement(block, {
                          stroke: "#09090b",
                          strokeWidth: 1.5,
                        })
                      : block}
                  </g>
                );
              }}
              labels={{
                legend: {
                  less: "Less",
                  more: "More",
                },
                months: [
                  "Jan",
                  "Feb",
                  "Mar",
                  "Apr",
                  "May",
                  "Jun",
                  "Jul",
                  "Aug",
                  "Sep",
                  "Oct",
                  "Nov",
                  "Dec",
                ],
                totalCount: selectedYear
                  ? `{{count}} contributions in ${selectedYear}`
                  : "{{count}} contributions in the last year",
              }}
            />
          )}
        </div>

        {selectedDay && (
          <DayDetailPanel
            day={selectedDay}
            onClose={() => setSelectedDay(null)}
            isPublicView={isPublicView}
          />
        )}
      </div>
    </div>
  );
}

"use client";

import {
  Activity as ActivityIcon,
  BadgeCheck,
  CalendarDays,
  ExternalLink,
  GitPullRequest,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { cloneElement, useEffect, useRef, useState } from "react";
import {
  type Activity,
  ActivityCalendar,
  type BlockElement,
  type ThemeInput,
} from "react-activity-calendar";
import { PiGitMergeFill, PiUsersThreeFill } from "react-icons/pi";
import "react-activity-calendar/tooltips.css";
import { ProfileSection } from "@/components/profile/ProfileSection";
import { Badge } from "@/components/ui/badge";
import { useContributions } from "@/hooks/useTeams";
import { cn } from "@/lib/utils";
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
  /** The public profile's light or dark theme. */
  appearance?: "light" | "dark";
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
  pull_request_merged: {
    icon: GitPullRequest,
    label: "PR merged",
    badgeClassName: "bg-violet-50 text-violet-600",
  },
  contribution_approved: {
    icon: BadgeCheck,
    label: "Contribution approved",
    badgeClassName: "bg-sky-50 text-sky-600",
  },
};

function formatDayLabel(dateStr: string, locale = "en"): string {
  const d = new Date(`${dateStr}T00:00:00`);
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

function formatTime(timestamp: string): string {
  return new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(
    new Date(timestamp)
  );
}

function contributionCount(count: number): string {
  return `${count} contribution${count !== 1 ? "s" : ""}`;
}

// Where a piece of work happened, for the quiet label on the right of its
// row: the team, the GitHub repo, or a team review.
function itemPlace(item: ContributionItem): string {
  if (item.team) return item.team;
  if (item.source === "github") return item.url.split("/")[4] ?? "GitHub";
  return "Team review";
}

// The public profile's day card: one line for the day, then one compact row
// per piece of work, marked GitHub or team, with the team's work described
// in the member's own words. Visitors can't open internal reviews, so only
// outside work links out.
function PublicDayPanel({ day, onClose }: { day: ContributionDay; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll each time a new day opens
  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [day.date]);

  return (
    <div
      ref={ref}
      className="mt-6 scroll-mb-28 animate-in rounded-xl bg-[#f2f2f2] p-2 fade-in-0 slide-in-from-top-1 duration-200 motion-reduce:animate-none dark:bg-[#1c1c1c]"
    >
      <div className="flex items-center justify-between gap-4 py-1 pr-1 pl-3">
        <p className="font-sans text-sm">
          <span className="font-semibold text-zinc-950 dark:text-white">
            {formatDayLabel(day.date, "en-GB")}
          </span>
          <span className="text-zinc-500"> · {contributionCount(day.count)}</span>
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-zinc-500 transition-colors hover:bg-black/5 hover:text-zinc-950 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <ul className="mt-1">
        {day.items.map((item, i) => {
          const fromGithub = item.source === "github";
          // GitHub items are merged pull requests, so they show the merge icon.
          const SourceIcon = fromGithub ? PiGitMergeFill : PiUsersThreeFill;
          const row = (
            <>
              <SourceIcon
                aria-label={fromGithub ? "Merged pull request" : "Team"}
                className={cn(
                  "mt-0.5 h-4 w-4 shrink-0",
                  fromGithub ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-500"
                )}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="truncate font-sans text-sm font-medium text-zinc-950 dark:text-white">
                    {item.title}
                  </p>
                  <span className="shrink-0 font-mono text-xs text-zinc-500">
                    {itemPlace(item)}
                  </span>
                </div>
                {item.description && (
                  <p className="mt-1 line-clamp-2 font-sans text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    {item.description}
                  </p>
                )}
              </div>
            </>
          );
          const rowClass = "flex items-start gap-3 rounded-lg px-3 py-2.5";
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: items have no stable id
            <li key={i}>
              {item.source !== "internal" ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className={`${rowClass} transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.05]`}
                >
                  {row}
                </a>
              ) : (
                <div className={rowClass}>{row}</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function DayDetailPanel({ day, onClose }: { day: ContributionDay; onClose: () => void }) {
  return (
    <div className="mt-5 animate-in fade-in-0 slide-in-from-top-1 p-4 duration-200 border border-zinc-200 bg-zinc-50">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-zinc-950 text-white">
            <CalendarDays className="h-4 w-4" />
          </div>
          <div>
            <p className="font-sans text-sm font-black text-zinc-950">{formatDayLabel(day.date)}</p>
            <p className="font-mono text-[11px] text-zinc-700">
              {day.count} contribution{day.count !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="shrink-0 text-zinc-600 transition-colors hover:text-zinc-900"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-2">
        {day.items.map((item, i) => {
          const meta = ITEM_TYPE_META[item.type];
          const Icon = meta.icon;
          const badgeClass = meta.badgeClassName;
          const isExternal = item.source !== "internal";
          const content = (
            <>
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${badgeClass}`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-sans text-sm font-medium text-zinc-800">{item.title}</p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge
                    className={`h-[18px] rounded-none px-1.5 text-[9px] font-bold uppercase tracking-wide ${badgeClass}`}
                  >
                    {meta.label}
                  </Badge>
                  <span className="font-mono text-[10px] text-zinc-600">
                    {formatTime(item.timestamp)}
                  </span>
                </div>
              </div>
              {isExternal && (
                <ExternalLink className="h-3.5 w-3.5 shrink-0 text-zinc-500 transition-colors group-hover:text-zinc-500" />
              )}
            </>
          );
          const rowClassName =
            "group flex items-center gap-3 border border-zinc-200 bg-white p-3 transition-colors hover:border-zinc-300 hover:bg-zinc-50";

          if (isExternal) {
            return (
              <a
                // biome-ignore lint/suspicious/noArrayIndexKey: items have no stable id
                key={i}
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className={rowClassName}
              >
                {content}
              </a>
            );
          }

          return (
            <Link
              // biome-ignore lint/suspicious/noArrayIndexKey: items have no stable id
              key={i}
              href={item.url}
              className={rowClassName}
            >
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function ContributionGraph({
  username,
  joinedAt,
  isPublicView,
  appearance = "dark",
}: ContributionGraphProps) {
  const currentYear = new Date().getFullYear();
  const joinYear = joinedAt ? new Date(joinedAt).getFullYear() : currentYear;
  const years = [];
  for (let y = currentYear; y >= joinYear; y--) {
    years.push(y);
  }

  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  const [selectedDay, setSelectedDay] = useState<ContributionDay | null>(null);
  const { data, isLoading, isError } = useContributions(username, selectedYear);

  // Green is the one colour on the public profile and means work done, so
  // the graph runs from the panel's own grey to green, as in the portal.
  // In dark mode busier days get brighter, not darker.
  const explicitTheme: ThemeInput = isPublicView
    ? {
        light: ["#ebebeb", "#a7f3d0", "#34d399", "#059669", "#065f46"],
        dark: ["#1f1f1f", "#064e3b", "#047857", "#10b981", "#6ee7b7"],
      }
    : { light: ["#f4f4f5", "#a7f3d0", "#34d399", "#059669", "#065f46"] };

  const contributions = data ?? [];
  const totalCount = contributions.reduce((sum, d) => sum + d.count, 0);

  if (isError || (!isLoading && !data)) {
    const message = (
      <div
        className={
          isPublicView
            ? "flex h-48 w-full items-center justify-center rounded-lg bg-[#f2f2f2] dark:bg-[#1c1c1c]"
            : "flex h-48 w-full items-center justify-center border border-zinc-200 bg-white"
        }
      >
        <p
          className={`font-mono text-xs ${isPublicView ? "text-zinc-600 dark:text-zinc-400" : "text-zinc-600"}`}
        >
          Could not load contribution data.
        </p>
      </div>
    );
    return isPublicView ? (
      <ProfileSection title="Contributions">{message}</ProfileSection>
    ) : (
      message
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

  const toggleOn = isPublicView
    ? "rounded bg-zinc-950 dark:bg-white text-white dark:text-black font-bold"
    : "bg-zinc-950 text-white font-bold";
  const toggleOff = isPublicView
    ? "rounded text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white"
    : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100";

  const yearToggle = (
    <div
      className={`flex flex-wrap gap-1 self-start p-1 ${isPublicView ? "rounded-md bg-[#f2f2f2] dark:bg-[#1c1c1c]" : "border border-zinc-200"}`}
    >
      <button
        type="button"
        onClick={() => {
          setSelectedYear(undefined);
          setSelectedDay(null);
        }}
        className={`px-3 py-1.5 font-mono text-[11px] whitespace-nowrap transition-colors ${
          selectedYear === undefined ? toggleOn : toggleOff
        }`}
      >
        Past 12 months
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
            selectedYear === year ? toggleOn : toggleOff
          }`}
        >
          {year}
        </button>
      ))}
    </div>
  );

  const body = (
    // On the public profile the section supplies the title and frame.
    <div className={isPublicView ? "" : "border border-zinc-200 bg-white p-6"}>
      <div className="flex flex-col gap-5">
        {!isPublicView && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-3">
              {!isPublicView && (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-zinc-950 text-white">
                  <ActivityIcon className="h-4 w-4" />
                </div>
              )}
              <div>
                {!isPublicView && (
                  <h3 className="font-sans text-xl font-black text-zinc-950">
                    Contribution Activity
                  </h3>
                )}
                {/* The calendar prints its own total under the grid; the public
                  view relies on that instead of repeating it here. */}
                {!isPublicView && (
                  <p className="mt-0.5 font-mono text-xs font-medium text-zinc-700">
                    {isLoading
                      ? "Loading"
                      : `${totalCount} contribution${totalCount !== 1 ? "s" : ""}`}
                    {" · "}
                    {selectedYear ? selectedYear : "Past 12 months"}
                  </p>
                )}
              </div>
            </div>

            {yearToggle}
          </div>
        )}

        {/* react-activity-calendar renders its own internal horizontal
            scroll container (overflow-x: auto) sized to the SVG's natural
            width — wrapping it in another scrolling div here just nests
            two independent scroll containers and fights the library's own
            sizing, so this stays a plain block. */}
        {/* Space under the squares for the calendar's own scrollbar, which
            otherwise appears over the bottom row and blocks clicks there. */}
        <div
          className={
            isPublicView
              ? "font-mono text-zinc-600 dark:text-zinc-400 [&_[class$=scroll-container]]:pb-4"
              : "min-h-56 [&_[class$=scroll-container]]:pb-4"
          }
        >
          {isLoading && isPublicView ? (
            // Faint squares in the calendar's shape (a year of weeks, at its
            // block size and gap), so nothing jumps when the data arrives.
            <div role="status" className="overflow-hidden pt-6 pb-4">
              <span className="sr-only">Loading contributions</span>
              <div
                aria-hidden="true"
                className="grid w-max animate-pulse grid-flow-col grid-rows-7 gap-[3px] motion-reduce:animate-none"
              >
                {Array.from({ length: 53 * 7 }, (_, index) => (
                  <span
                    // biome-ignore lint/suspicious/noArrayIndexKey: fixed, static placeholder cells
                    key={index}
                    className="h-2.5 w-2.5 rounded-[2px] bg-[#efefef] dark:bg-[#1f1f1f]"
                  />
                ))}
              </div>
            </div>
          ) : isLoading ? (
            <div className="flex h-56 w-full items-center justify-center border border-dashed border-zinc-200 bg-zinc-50">
              <p className="font-mono text-xs animate-pulse text-zinc-600">
                Loading contributions...
              </p>
            </div>
          ) : emptyState ? (
            <div
              className={
                isPublicView
                  ? "flex h-40 w-full items-center justify-center rounded-lg bg-[#f2f2f2] dark:bg-[#1c1c1c] text-center"
                  : "flex h-40 w-full items-center justify-center border border-dashed border-zinc-200 bg-zinc-50 text-center"
              }
            >
              <p
                className={`max-w-xs text-sm ${isPublicView ? "text-zinc-600 dark:text-zinc-400" : "text-zinc-700"}`}
              >
                {/* "Yet" only while the period is still running. */}
                {selectedYear && selectedYear !== new Date().getFullYear()
                  ? `No contributions in ${selectedYear}.`
                  : `No contributions in ${selectedYear ?? "the past 12 months"} yet.`}
              </p>
            </div>
          ) : (
            <ActivityCalendar
              data={paddedContributions}
              theme={explicitTheme}
              colorScheme={isPublicView ? appearance : "light"}
              blockSize={isPublicView ? 10 : 13}
              blockMargin={isPublicView ? 3 : 4}
              blockRadius={isPublicView ? 2 : 3}
              tooltips={
                isPublicView
                  ? {
                      activity: {
                        text: (activity) =>
                          `${activity.count ? contributionCount(activity.count) : "No contributions"} · ${new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(new Date(`${activity.date}T00:00:00`))}`,
                        hoverRestMs: 0,
                        withArrow: true,
                      },
                    }
                  : undefined
              }
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
                          stroke: isPublicView && appearance === "dark" ? "#ffffff" : "#09090b",
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
                totalCount: `{{count}} ${totalCount === 1 ? "contribution" : "contributions"} in ${selectedYear ?? "the past 12 months"}`,
              }}
            />
          )}
        </div>

        {selectedDay &&
          (isPublicView ? (
            <PublicDayPanel day={selectedDay} onClose={() => setSelectedDay(null)} />
          ) : (
            <DayDetailPanel day={selectedDay} onClose={() => setSelectedDay(null)} />
          ))}
      </div>
    </div>
  );

  // On the public profile the graph is its own section, with the year
  // switch on the title line instead of a row of its own.
  if (isPublicView) {
    return (
      <ProfileSection title="Contributions" action={yearToggle}>
        {body}
      </ProfileSection>
    );
  }
  return body;
}

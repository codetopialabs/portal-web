"use client";

import { ArrowRight, BookOpen, Clock, FileText, Play, Search, Video } from "lucide-react";
import Link from "next/link";
import React from "react";
import { DashboardShell } from "@/components/dashboard/Shell";
import { Input } from "@/components/ui/input";

type ResourceType = "Article" | "Guide" | "Video" | "Template";
type ResourceStatus = "saved" | "in-progress" | "completed";

interface Resource {
  id: string;
  title: string;
  type: ResourceType;
  author: string;
  date: string;
  readTime?: string;
  status: ResourceStatus;
  program?: string;
}

const resources: Resource[] = [
  {
    id: "1",
    title: "Getting Started with Open Source Contributions",
    type: "Guide",
    author: "Abena Mensah",
    date: "Apr 10, 2026",
    readTime: "8 min",
    status: "in-progress",
    program: "Full-Stack Web Engineering",
  },
  {
    id: "2",
    title: "Understanding Web Infrastructure Basics",
    type: "Article",
    author: "Kofi Boateng",
    date: "Apr 3, 2026",
    readTime: "12 min",
    status: "completed",
    program: "Full-Stack Web Engineering",
  },
  {
    id: "3",
    title: "Docker for Beginners — Full Workshop Recording",
    type: "Video",
    author: "Ama Owusu",
    date: "Mar 28, 2026",
    status: "saved",
  },
  {
    id: "4",
    title: "Project README Template",
    type: "Template",
    author: "Core Team",
    date: "Mar 15, 2026",
    status: "saved",
  },
  {
    id: "5",
    title: "How to Make the Most of Your Mentorship",
    type: "Guide",
    author: "Yaw Frimpong",
    date: "Mar 8, 2026",
    readTime: "6 min",
    status: "completed",
  },
  {
    id: "6",
    title: "REST API Design Best Practices",
    type: "Article",
    author: "Abena Mensah",
    date: "Feb 20, 2026",
    readTime: "10 min",
    status: "completed",
    program: "Full-Stack Web Engineering",
  },
];

const typeIcons: Record<ResourceType, React.ElementType> = {
  Article: FileText,
  Guide: BookOpen,
  Video: Video,
  Template: FileText,
};

const typeColors: Record<ResourceType, string> = {
  Article: "bg-zinc-50 text-zinc-600 border-zinc-200",
  Guide: "bg-zinc-50 text-zinc-600 border-zinc-200",
  Video: "bg-zinc-50 text-zinc-600 border-zinc-200",
  Template: "bg-zinc-50 text-zinc-600 border-zinc-200",
};

const statusConfig: Record<ResourceStatus, { label: string; color: string }> = {
  saved: { label: "Saved", color: "text-zinc-400" },
  "in-progress": { label: "In Progress", color: "text-amber-600" },
  completed: { label: "Completed", color: "text-emerald-600" },
};

const filterTabs: { label: string; value: ResourceStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "In Progress", value: "in-progress" },
  { label: "Saved", value: "saved" },
  { label: "Completed", value: "completed" },
];

function ResourcesSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-zinc-200 p-4 space-y-2">
            <div className="h-7 w-8 bg-zinc-100 animate-pulse" />
            <div className="h-3 w-20 bg-zinc-100 animate-pulse" />
          </div>
        ))}
      </div>
      <div className="h-11 bg-zinc-100 animate-pulse w-full" />
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-8 w-20 bg-zinc-100 animate-pulse" />
        ))}
      </div>
      <div className="bg-white border border-zinc-200 divide-y divide-zinc-100">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 flex items-center gap-4">
            <div className="w-9 h-9 bg-zinc-100 animate-pulse shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-64 bg-zinc-100 animate-pulse" />
              <div className="h-3 w-40 bg-zinc-100 animate-pulse" />
            </div>
            <div className="h-4 w-16 bg-zinc-100 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white border border-zinc-200 py-24 flex flex-col items-center justify-center text-center">
      <div className="w-12 h-12 border border-zinc-200 bg-zinc-50 flex items-center justify-center mb-4">
        <Clock className="w-5 h-5 text-zinc-300" />
      </div>
      <p className="font-mono font-semibold text-sm text-zinc-900 mb-1">{title}</p>
      <p className="font-mono text-sm text-zinc-500 max-w-xs mx-auto">{description}</p>
    </div>
  );
}

export default function ResourcesPage() {
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [activeFilter, setActiveFilter] = React.useState<ResourceStatus | "all">("all");

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  const filtered = resources.filter((r) => {
    const matchesFilter = activeFilter === "all" || r.status === activeFilter;
    const matchesSearch =
      search === "" ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.author.toLowerCase().includes(search.toLowerCase()) ||
      r.type.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const inProgress = resources.filter((r) => r.status === "in-progress");
  const completed = resources.filter((r) => r.status === "completed");

  return (
    <DashboardShell>
      <div className="max-w-6xl mx-auto pb-20 space-y-8">

        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-sans font-black uppercase tracking-tighter text-zinc-900">
            Resources
          </h1>
          <p className="font-mono text-sm text-zinc-500">
            Saved articles, guides, videos, and templates
          </p>
        </div>

        {loading ? <ResourcesSkeleton /> : (
          <>
            <ComingSoon
              title="Resources Coming Soon"
              description="A curated library of guides, articles, and templates for engineers. We're gathering the best content."
            />
            {false && (
              <>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "In Progress", value: inProgress.length, color: "text-amber-600" },
            { label: "Completed", value: completed.length, color: "text-emerald-600" },
            { label: "Total Saved", value: resources.length, color: "text-zinc-900" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white border border-zinc-200 p-4 space-y-1">
              <p className={`font-mono font-black text-2xl ${stat.color}`}>{stat.value}</p>
              <p className="font-mono text-xs text-zinc-400">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Continue reading */}
        {inProgress.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-sans font-black uppercase text-sm tracking-widest text-zinc-900">
              Continue Reading
            </h2>
            <div className="bg-white border border-zinc-200 divide-y divide-zinc-100">
              {inProgress.map((resource) => {
                const Icon = typeIcons[resource.type];
                return (
                  <div
                    key={resource.id}
                    className="p-5 flex items-center gap-4 group hover:bg-zinc-50 transition-all cursor-pointer"
                  >
                    <div className="w-9 h-9 border border-zinc-200 bg-zinc-50 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-zinc-900" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono font-semibold text-sm text-zinc-900 group-hover:underline underline-offset-4 truncate">
                        {resource.title}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-1 font-mono text-xs text-zinc-400">
                        <span>{resource.author}</span>
                        {resource.readTime && (
                          <>
                            <span className="text-zinc-200">·</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {resource.readTime}
                            </span>
                          </>
                        )}
                        {resource.program && (
                          <>
                            <span className="text-zinc-200">·</span>
                            <span className="text-zinc-500 truncate">{resource.program}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-300 group-hover:text-zinc-600 transition-colors shrink-0" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
          <Input
            placeholder="Search resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 rounded-none border-zinc-200 bg-white pl-9 font-mono text-sm focus-visible:ring-0 focus-visible:border-zinc-900 transition-all"
          />
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveFilter(tab.value)}
              className={`font-mono text-sm px-3 py-1.5 border transition-all ${
                activeFilter === tab.value
                  ? "bg-black text-white border-black"
                  : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-400 hover:text-zinc-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Resource list */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border border-zinc-200 bg-white text-center">
            <div className="w-12 h-12 border border-zinc-200 bg-zinc-50 flex items-center justify-center mb-4">
              <BookOpen className="w-5 h-5 text-zinc-300" />
            </div>
            <p className="font-mono font-semibold text-sm text-zinc-900 mb-1">No resources found</p>
            <p className="font-mono text-sm text-zinc-500 mb-4">
              {search ? "Try a different search term" : "Save resources from the community"}
            </p>
            <Link
              href="/community"
              className="inline-flex items-center gap-2 font-mono text-sm text-zinc-900 border-b border-zinc-900 pb-px hover:text-zinc-500 transition-all"
            >
              Browse Resources <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-zinc-200 divide-y divide-zinc-100 overflow-hidden">
            {filtered.map((resource) => {
              const Icon = typeIcons[resource.type];
              const status = statusConfig[resource.status];
              return (
                <div
                  key={resource.id}
                  className="p-5 flex items-center gap-4 hover:bg-zinc-50 transition-all group cursor-pointer"
                >
                  <div className="w-9 h-9 border border-zinc-200 bg-zinc-50 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-zinc-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-mono font-semibold text-base text-zinc-900 group-hover:underline underline-offset-4 truncate">
                      {resource.title}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-1 font-mono text-sm text-zinc-400">
                      <span>{resource.author}</span>
                      <span className="text-zinc-200">·</span>
                      <span>{resource.date}</span>
                      {resource.readTime && (
                        <>
                          <span className="text-zinc-200">·</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {resource.readTime}
                          </span>
                        </>
                      )}
                      {resource.program && (
                        <>
                          <span className="text-zinc-200">·</span>
                          <span className="text-zinc-500 truncate">{resource.program}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`font-mono text-xs font-semibold ${status.color} hidden sm:inline`}>
                      {status.label}
                    </span>
                    <span className={`font-mono text-xs uppercase tracking-widest border px-2 py-0.5 hidden sm:inline ${typeColors[resource.type]}`}>
                      {resource.type}
                    </span>
                    {resource.type === "Video" ? (
                      <Play className="w-3.5 h-3.5 text-zinc-300 group-hover:text-zinc-600 transition-colors" />
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-300 group-hover:text-zinc-600 transition-colors" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Browse CTA */}
        <div className="flex items-center justify-between p-5 bg-zinc-50 border border-zinc-200">
          <div>
            <p className="font-mono font-semibold text-sm text-zinc-900">Discover more</p>
            <p className="font-mono text-sm text-zinc-500">Browse all community resources</p>
          </div>
          <Link
            href="/community"
            className="inline-flex items-center gap-2 font-mono text-sm font-semibold text-zinc-900 border-b border-zinc-900 pb-px hover:text-zinc-500 hover:border-zinc-400 transition-all shrink-0"
          >
            Browse <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

              </>
            )}
          </>
        )}

      </div>
    </DashboardShell>
  );
}

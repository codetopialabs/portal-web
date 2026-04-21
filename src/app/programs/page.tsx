"use client";

import { ArrowRight, BookOpen, CheckCircle2, Circle, Clock, FileText, Users } from "lucide-react";
import Link from "next/link";
import React from "react";
import { DashboardShell } from "@/components/dashboard/Shell";

interface Program {
  id: string;
  title: string;
  type: "Training" | "Bootcamp" | "Workshop";
  cohort: string;
  progress: number;
  currentModule: string;
  nextDeadline: string;
  status: "active" | "completed" | "upcoming";
}

interface PastProgram {
  id: string;
  title: string;
  type: string;
  cohort: string;
  completedDate: string;
}

const activePrograms: Program[] = [
  {
    id: "1",
    title: "Full-Stack Web Engineering",
    type: "Training",
    cohort: "Cohort 3 · 2026",
    progress: 62,
    currentModule: "Module 6 — API Design & Integration",
    nextDeadline: "Apr 28 · Assignment due",
    status: "active",
  },
];

const upcomingPrograms: Program[] = [
  {
    id: "2",
    title: "DevOps & Cloud Bootcamp",
    type: "Bootcamp",
    cohort: "Cohort 1 · 2026",
    progress: 0,
    currentModule: "Starts May 12",
    nextDeadline: "Orientation · May 10",
    status: "upcoming",
  },
];

const pastPrograms: PastProgram[] = [
  { id: "3", title: "Open Source Contribution Workshop", type: "Workshop", cohort: "Edition 2 · 2025", completedDate: "Nov 2025" },
  { id: "4", title: "Frontend Fundamentals", type: "Training", cohort: "Cohort 1 · 2025", completedDate: "Jun 2025" },
];

const curriculum = [
  { id: "m1", label: "Module 1 — Web Fundamentals", done: true },
  { id: "m2", label: "Module 2 — HTML & CSS Deep Dive", done: true },
  { id: "m3", label: "Module 3 — JavaScript Essentials", done: true },
  { id: "m4", label: "Module 4 — React & Component Design", done: true },
  { id: "m5", label: "Module 5 — State Management", done: true },
  { id: "m6", label: "Module 6 — API Design & Integration", done: false, current: true },
  { id: "m7", label: "Module 7 — Authentication & Security", done: false },
  { id: "m8", label: "Module 8 — Databases & ORMs", done: false },
  { id: "m9", label: "Module 9 — Deployment & DevOps Basics", done: false },
  { id: "m10", label: "Module 10 — Capstone Project", done: false },
];

const upcomingDeadlines = [
  { id: "d1", label: "API Design Assignment", due: "Apr 28", type: "Assignment" },
  { id: "d2", label: "Module 6 Quiz", due: "Apr 30", type: "Quiz" },
  { id: "d3", label: "Peer Review — Module 5 Projects", due: "May 2", type: "Review" },
];

const cohortMembers = [
  { id: "c1", name: "Ama Owusu", avatarUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=60&auto=format&fit=crop" },
  { id: "c2", name: "Kofi Boateng", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=60&auto=format&fit=crop" },
  { id: "c3", name: "Yaw Frimpong", avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=60&auto=format&fit=crop" },
  { id: "c4", name: "Efua Asante", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=60&auto=format&fit=crop" },
];

const typeColors: Record<string, string> = {
  Training: "bg-blue-50 text-blue-700 border-blue-200",
  Bootcamp: "bg-violet-50 text-violet-700 border-violet-200",
  Workshop: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const deadlineTypeColors: Record<string, string> = {
  Assignment: "bg-amber-50 text-amber-700 border-amber-200",
  Quiz: "bg-blue-50 text-blue-700 border-blue-200",
  Review: "bg-zinc-100 text-zinc-600 border-zinc-200",
};

function ProgramsSkeleton() {
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
          <div className="h-1.5 bg-zinc-100 w-full" />
          <div className="flex items-center justify-between">
            <div className="h-4 w-32 bg-zinc-100 animate-pulse" />
            <div className="h-4 w-20 bg-zinc-100 animate-pulse" />
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="h-4 w-24 bg-zinc-100 animate-pulse" />
        <div className="bg-white border border-zinc-200 divide-y divide-zinc-100">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4">
              <div className="w-4 h-4 rounded-full bg-zinc-100 animate-pulse shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 w-48 bg-zinc-100 animate-pulse" />
                <div className="h-3 w-24 bg-zinc-100 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProgramsPage() {
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  return (
    <DashboardShell>
      <div className="max-w-6xl mx-auto pb-20 space-y-10">

        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-sans font-black uppercase tracking-tighter text-zinc-900">
            Programs
          </h1>
          <p className="font-mono text-sm text-zinc-500">
            Your active training, bootcamps, and workshops
          </p>
        </div>

        {loading ? <ProgramsSkeleton /> : <>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Active", value: activePrograms.length, color: "text-zinc-900" },
            { label: "Upcoming", value: upcomingPrograms.length, color: "text-zinc-500" },
            { label: "Completed", value: pastPrograms.length, color: "text-emerald-600" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white border border-zinc-200 p-4 space-y-1">
              <p className={`font-mono font-black text-2xl ${stat.color}`}>{stat.value}</p>
              <p className="font-mono text-xs text-zinc-400">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Active */}
        {activePrograms.length > 0 && (
          <section className="space-y-4">
            <h2 className="font-sans font-black uppercase text-sm tracking-widest text-zinc-900">
              Active
            </h2>
            <div className="space-y-8">
              {activePrograms.map((program) => (
                <div key={program.id} className="space-y-6">

                  {/* Program card */}
                  <div className="bg-white border border-zinc-200 p-6 space-y-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-mono text-xs uppercase tracking-widest border px-2 py-0.5 ${typeColors[program.type]}`}>
                            {program.type}
                          </span>
                          <span className="font-mono text-xs text-zinc-400">{program.cohort}</span>
                        </div>
                        <p className="font-mono font-semibold text-base text-zinc-900">{program.title}</p>
                        <p className="font-mono text-sm text-zinc-500">{program.currentModule}</p>
                      </div>
                      <span className="font-mono text-2xl font-black text-zinc-900 shrink-0">
                        {program.progress}%
                      </span>
                    </div>

                    <div className="h-1.5 bg-zinc-100 w-full">
                      <div className="h-full bg-zinc-900 transition-all" style={{ width: `${program.progress}%` }} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-mono text-sm text-zinc-500">
                        <Clock className="w-3.5 h-3.5" />
                        {program.nextDeadline}
                      </div>
                      <Link
                        href="/community"
                        className="inline-flex items-center gap-1.5 font-mono text-sm text-zinc-900 border-b border-zinc-900 pb-px hover:text-zinc-500 hover:border-zinc-400 transition-all"
                      >
                        Continue <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Curriculum + Deadlines grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    {/* Curriculum */}
                    <div className="bg-white border border-zinc-200 p-5 space-y-4">
                      <h3 className="font-sans font-black uppercase text-xs tracking-widest text-zinc-900">
                        Curriculum
                      </h3>
                      <div className="space-y-2">
                        {curriculum.map((mod) => (
                          <div
                            key={mod.id}
                            className={`flex items-start gap-2.5 font-mono text-xs ${mod.current ? "text-zinc-900 font-semibold" : mod.done ? "text-zinc-400" : "text-zinc-500"}`}
                          >
                            {mod.done ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-px" />
                            ) : (
                              <Circle className={`w-3.5 h-3.5 shrink-0 mt-px ${mod.current ? "text-zinc-900" : "text-zinc-300"}`} />
                            )}
                            <span className={mod.current ? "underline underline-offset-2" : ""}>{mod.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Upcoming deadlines + Cohort */}
                    <div className="space-y-4">
                      <div className="bg-white border border-zinc-200 p-5 space-y-4">
                        <h3 className="font-sans font-black uppercase text-xs tracking-widest text-zinc-900">
                          Upcoming Deadlines
                        </h3>
                        <div className="space-y-3">
                          {upcomingDeadlines.map((d) => (
                            <div key={d.id} className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2 min-w-0">
                                <FileText className="w-3 h-3 text-zinc-400 shrink-0" />
                                <span className="font-mono text-xs text-zinc-700 truncate">{d.label}</span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className={`font-mono text-[10px] uppercase tracking-widest border px-1.5 py-0.5 ${deadlineTypeColors[d.type]}`}>
                                  {d.type}
                                </span>
                                <span className="font-mono text-xs text-zinc-400">{d.due}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white border border-zinc-200 p-5 space-y-3">
                        <h3 className="font-sans font-black uppercase text-xs tracking-widest text-zinc-900">
                          Your Cohort
                        </h3>
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            {cohortMembers.map((m) => (
                              <div key={m.id} className="w-7 h-7 rounded-full overflow-hidden border-2 border-white">
                                {/* biome-ignore lint/performance/noImgElement: cohort avatar */}
                                <img src={m.avatarUrl} alt={m.name} className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                          <span className="font-mono text-xs text-zinc-500">+34 others</span>
                        </div>
                        <Link
                          href="/community"
                          className="inline-flex items-center gap-1 font-mono text-xs text-zinc-500 hover:text-zinc-900 transition-colors border-b border-zinc-300 hover:border-zinc-900 pb-px"
                        >
                          <Users className="w-3 h-3" /> View cohort
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Upcoming */}
        {upcomingPrograms.length > 0 && (
          <section className="space-y-4">
            <h2 className="font-sans font-black uppercase text-sm tracking-widest text-zinc-900">
              Upcoming
            </h2>
            <div className="space-y-3">
              {upcomingPrograms.map((program) => (
                <div key={program.id} className="bg-white border border-zinc-200 p-6 space-y-4 opacity-75">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-mono text-xs uppercase tracking-widest border px-2 py-0.5 ${typeColors[program.type]}`}>
                          {program.type}
                        </span>
                        <span className="font-mono text-xs text-zinc-400">{program.cohort}</span>
                      </div>
                      <p className="font-mono font-semibold text-base text-zinc-900">{program.title}</p>
                      <p className="font-mono text-sm text-zinc-500">{program.currentModule}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-sm text-zinc-500">
                    <Clock className="w-3.5 h-3.5" />
                    {program.nextDeadline}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {activePrograms.length === 0 && upcomingPrograms.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 border border-zinc-200 bg-white text-center">
            <div className="w-12 h-12 border border-zinc-200 bg-zinc-50 flex items-center justify-center mb-4">
              <BookOpen className="w-5 h-5 text-zinc-300" />
            </div>
            <p className="font-mono font-semibold text-sm text-zinc-900 mb-1">No active programs</p>
            <p className="font-mono text-sm text-zinc-500 mb-4">Browse available programs and enroll</p>
            <Link
              href="/community"
              className="inline-flex items-center gap-2 font-mono text-sm text-zinc-900 border-b border-zinc-900 pb-px hover:text-zinc-500 transition-all"
            >
              Browse Programs <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Completed */}
        {pastPrograms.length > 0 && (
          <section className="space-y-4">
            <h2 className="font-sans font-black uppercase text-sm tracking-widest text-zinc-900">
              Completed
            </h2>
            <div className="bg-white border border-zinc-200 divide-y divide-zinc-100 overflow-hidden">
              {pastPrograms.map((program) => (
                <div key={program.id} className="flex items-center gap-4 px-5 py-4">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-mono font-semibold text-sm text-zinc-900">{program.title}</p>
                    <p className="font-mono text-xs text-zinc-400 mt-0.5">{program.cohort}</p>
                  </div>
                  <span className="font-mono text-xs text-zinc-400 shrink-0">{program.completedDate}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Browse CTA */}
        <div className="flex items-center justify-between p-5 bg-zinc-50 border border-zinc-200">
          <div>
            <p className="font-mono font-semibold text-sm text-zinc-900">Looking for more?</p>
            <p className="font-mono text-sm text-zinc-500">Browse all open programs in the community</p>
          </div>
          <Link
            href="/community"
            className="inline-flex items-center gap-2 font-mono text-sm font-semibold text-zinc-900 border-b border-zinc-900 pb-px hover:text-zinc-500 hover:border-zinc-400 transition-all shrink-0"
          >
            Browse <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        </>}

      </div>
    </DashboardShell>
  );
}

"use client";

import { ArrowRight, BookOpen, Calendar, CheckCircle2, Circle, Clock, ExternalLink, FileText, MessageSquare, Users } from "lucide-react";
import Link from "next/link";
import React from "react";
import { DashboardShell } from "@/components/dashboard/Shell";

const activeMentorship = {
  mentor: {
    name: "Abena Mensah",
    role: "Senior Engineer",
    organization: "OSSAfrica",
    bio: "10+ years building distributed systems. Open source maintainer. Passionate about growing African engineering talent.",
    avatarUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=200&auto=format&fit=crop",
  },
  focus: "Systems Design & Open Source Contribution",
  started: "Jan 2026",
  nextSession: "Thu, Apr 24 · 3:00 PM GMT",
  nextSessionTopic: "Distributed Systems & CAP Theorem",
  sessionsCompleted: 4,
  totalSessions: 12,
  notes: "Currently working through system design fundamentals. Next session will cover distributed systems and CAP theorem.",
};

const goals = [
  { id: "g1", label: "Understand the fundamentals of system design", done: true },
  { id: "g2", label: "Contribute a meaningful PR to an open source project", done: true },
  { id: "g3", label: "Design and document a scalable API", done: false, current: true },
  { id: "g4", label: "Learn distributed systems concepts (CAP, consensus)", done: false },
  { id: "g5", label: "Build and deploy a production-ready project", done: false },
];

const sessionHistory = [
  { id: "1", date: "Apr 10, 2026", topic: "Introduction to Systems Design", duration: "60 min" },
  { id: "2", date: "Mar 27, 2026", topic: "Database Design & Normalization", duration: "55 min" },
  { id: "3", date: "Mar 13, 2026", topic: "REST API Best Practices", duration: "60 min" },
  { id: "4", date: "Feb 27, 2026", topic: "Kickoff & Goal Setting", duration: "45 min" },
];

const sharedResources = [
  { id: "r1", title: "Designing Data-Intensive Applications", type: "Book", sharedBy: "Abena Mensah" },
  { id: "r2", title: "System Design Primer — GitHub", type: "Guide", sharedBy: "Abena Mensah" },
  { id: "r3", title: "Martin Fowler — Patterns of Enterprise App Architecture", type: "Book", sharedBy: "Abena Mensah" },
];

const resourceTypeColors: Record<string, string> = {
  Book: "bg-violet-50 text-violet-700 border-violet-200",
  Guide: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Article: "bg-blue-50 text-blue-700 border-blue-200",
};

function MentorshipSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white border border-zinc-200 p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-zinc-100 animate-pulse shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-4 w-32 bg-zinc-100 animate-pulse" />
              <div className="h-3 w-48 bg-zinc-100 animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 w-20 bg-zinc-100 animate-pulse" />
            <div className="h-4 w-56 bg-zinc-100 animate-pulse" />
          </div>
          <div className="h-1.5 bg-zinc-100 w-full" />
        </div>
        <div className="space-y-4">
          <div className="h-4 w-32 bg-zinc-100 animate-pulse" />
          <div className="bg-white border border-zinc-200 divide-y divide-zinc-100">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <div className="w-4 h-4 rounded-full bg-zinc-100 animate-pulse shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 w-48 bg-zinc-100 animate-pulse" />
                  <div className="h-3 w-32 bg-zinc-100 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="space-y-6">
        <div className="bg-white border border-zinc-200 p-5 space-y-3">
          <div className="h-4 w-24 bg-zinc-100 animate-pulse" />
          <div className="h-4 w-40 bg-zinc-100 animate-pulse" />
          <div className="h-9 bg-zinc-100 animate-pulse w-full" />
        </div>
        <div className="bg-white border border-zinc-200 p-5 space-y-4">
          <div className="h-4 w-20 bg-zinc-100 animate-pulse" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="h-3 w-24 bg-zinc-100 animate-pulse" />
              <div className="h-3 w-12 bg-zinc-100 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MentorshipPage() {
  const [loading, setLoading] = React.useState(true);
  const progress = Math.round(
    (activeMentorship.sessionsCompleted / activeMentorship.totalSessions) * 100
  );
  const goalsCompleted = goals.filter((g) => g.done).length;

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
            Mentorship
          </h1>
          <p className="font-mono text-sm text-zinc-500">
            Your active mentorship and session history
          </p>
        </div>

        {loading ? <MentorshipSkeleton /> : <>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* Main */}
          <div className="lg:col-span-2 space-y-6">

            {/* Mentor card */}
            <div className="bg-white border border-zinc-200 p-6 space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full overflow-hidden border border-zinc-200 shrink-0">
                  {/* biome-ignore lint/performance/noImgElement: mentor avatar */}
                  <img
                    src={activeMentorship.mentor.avatarUrl}
                    alt={activeMentorship.mentor.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-mono font-bold text-base text-zinc-900">
                    {activeMentorship.mentor.name}
                  </p>
                  <p className="font-mono text-sm text-zinc-500">
                    {activeMentorship.mentor.role} · {activeMentorship.mentor.organization}
                  </p>
                  <p className="font-mono text-xs text-zinc-400 mt-2 leading-relaxed">
                    {activeMentorship.mentor.bio}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="font-mono text-xs uppercase tracking-widest text-zinc-400">Focus Area</p>
                <p className="font-mono text-sm text-zinc-700">{activeMentorship.focus}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between font-mono text-xs text-zinc-400">
                  <span>Progress — {activeMentorship.sessionsCompleted} of {activeMentorship.totalSessions} sessions</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-1.5 bg-zinc-100 w-full">
                  <div className="h-full bg-zinc-900 transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 font-mono text-sm font-semibold text-zinc-900 border-b border-zinc-900 pb-px hover:text-zinc-500 hover:border-zinc-400 transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> Message Mentor
                </button>
                <Link
                  href="/community"
                  className="inline-flex items-center gap-2 font-mono text-sm text-zinc-400 hover:text-zinc-900 transition-all border-b border-zinc-300 hover:border-zinc-900 pb-px"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> View Profile
                </Link>
              </div>
            </div>

            {/* Goals */}
            <div className="bg-white border border-zinc-200 p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-sans font-black uppercase text-sm tracking-widest text-zinc-900">
                  Goals
                </h2>
                <span className="font-mono text-xs text-zinc-400">{goalsCompleted} of {goals.length} complete</span>
              </div>
              <div className="space-y-3">
                {goals.map((goal) => (
                  <div
                    key={goal.id}
                    className={`flex items-start gap-3 font-mono text-sm ${goal.current ? "text-zinc-900 font-semibold" : goal.done ? "text-zinc-400" : "text-zinc-600"}`}
                  >
                    {goal.done ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-px" />
                    ) : (
                      <Circle className={`w-4 h-4 shrink-0 mt-px ${goal.current ? "text-zinc-900" : "text-zinc-300"}`} />
                    )}
                    <span className={goal.current ? "underline underline-offset-2" : ""}>{goal.label}</span>
                    {goal.current && (
                      <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400 border border-zinc-200 px-1.5 py-0.5 ml-auto shrink-0">
                        Current
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Shared Resources */}
            <div className="bg-white border border-zinc-200 p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-sans font-black uppercase text-sm tracking-widest text-zinc-900">
                  Shared by Mentor
                </h2>
                <Link
                  href="/resources"
                  className="font-mono text-xs text-zinc-400 hover:text-zinc-900 transition-colors flex items-center gap-1"
                >
                  All resources <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-3">
                {sharedResources.map((r) => (
                  <div key={r.id} className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-zinc-400 shrink-0" />
                    <span className="font-mono text-sm text-zinc-700 flex-1 min-w-0 truncate">{r.title}</span>
                    <span className={`font-mono text-[10px] uppercase tracking-widest border px-1.5 py-0.5 shrink-0 ${resourceTypeColors[r.type]}`}>
                      {r.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Session history */}
            <section className="space-y-4">
              <h2 className="font-sans font-black uppercase text-sm tracking-widest text-zinc-900">
                Session History
              </h2>
              <div className="bg-white border border-zinc-200 divide-y divide-zinc-100 overflow-hidden">
                {sessionHistory.map((session) => (
                  <div key={session.id} className="flex items-center gap-4 px-5 py-4">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-mono font-semibold text-sm text-zinc-900">{session.topic}</p>
                      <p className="font-mono text-xs text-zinc-400 mt-0.5">{session.date} · {session.duration}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Next session */}
            <div className="bg-white border border-zinc-200 p-5 space-y-4">
              <h2 className="font-sans font-black uppercase text-sm tracking-widest text-zinc-900">
                Next Session
              </h2>
              <div className="flex items-center gap-2 font-mono text-sm text-zinc-700">
                <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                {activeMentorship.nextSession}
              </div>
              <div className="space-y-1 p-3 bg-zinc-50 border border-zinc-100">
                <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">Topic</p>
                <p className="font-mono text-xs text-zinc-700">{activeMentorship.nextSessionTopic}</p>
              </div>
              <button
                type="button"
                className="w-full h-9 bg-zinc-900 text-white font-mono text-xs uppercase tracking-widest hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
              >
                <Calendar className="w-3.5 h-3.5" /> Add to Calendar
              </button>
            </div>

            {/* Overview stats */}
            <div className="bg-white border border-zinc-200 p-5 space-y-4">
              <h2 className="font-sans font-black uppercase text-sm tracking-widest text-zinc-900">
                Overview
              </h2>
              <div className="space-y-3 font-mono text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Started</span>
                  <span className="text-zinc-900 font-semibold">{activeMentorship.started}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Sessions done</span>
                  <span className="text-zinc-900 font-semibold">{activeMentorship.sessionsCompleted}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Sessions left</span>
                  <span className="text-zinc-900 font-semibold">
                    {activeMentorship.totalSessions - activeMentorship.sessionsCompleted}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Goals done</span>
                  <span className="text-zinc-900 font-semibold">{goalsCompleted}/{goals.length}</span>
                </div>
              </div>
            </div>

            {/* Session notes */}
            <div className="bg-white border border-zinc-200 p-5 space-y-3">
              <h2 className="font-sans font-black uppercase text-sm tracking-widest text-zinc-900">
                Mentor's Notes
              </h2>
              <p className="font-mono text-xs text-zinc-500 leading-relaxed">
                {activeMentorship.notes}
              </p>
            </div>

            {/* Browse mentors CTA */}
            <div className="p-4 bg-zinc-50 border border-zinc-200 space-y-2">
              <p className="font-mono text-xs text-zinc-500 leading-relaxed">
                Want a different focus area? Browse available mentors in the community.
              </p>
              <Link
                href="/community?tab=members&role=Mentor"
                className="inline-flex items-center gap-1.5 font-mono text-xs text-zinc-900 border-b border-zinc-900 pb-px hover:text-zinc-500 transition-all"
              >
                <Users className="w-3 h-3" /> Browse Mentors <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

          </div>
        </div>

        {/* Empty state */}
        {false && (
          <div className="flex flex-col items-center justify-center py-20 border border-zinc-200 bg-white text-center">
            <div className="w-12 h-12 border border-zinc-200 bg-zinc-50 flex items-center justify-center mb-4">
              <Users className="w-5 h-5 text-zinc-300" />
            </div>
            <p className="font-mono font-semibold text-sm text-zinc-900 mb-1">No active mentorship</p>
            <p className="font-mono text-sm text-zinc-500 mb-4">Get paired with a senior engineer</p>
            <Link
              href="/community"
              className="inline-flex items-center gap-2 font-mono text-sm text-zinc-900 border-b border-zinc-900 pb-px hover:text-zinc-500 transition-all"
            >
              Find a Mentor <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        </>}

      </div>
    </DashboardShell>
  );
}

"use client";

import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/Shell";

const member = {
  name: "Kadin Vaccaro",
  email: "kadin.v@codetopia.com",
  role: "Core Contributor",
  memberSince: "Jan 2024",
  communityId: "#CT-7724-912A",
  avatarUrl:
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop",
  twoFactorEnabled: true,
  lastLogin: "Today, 9:14 AM",
  loginLocation: "Toronto, CA",
};

const mentorship = {
  mentor: {
    name: "Abena Mensah",
    role: "Senior Engineer · OSSAfrica",
    avatarUrl:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=200&auto=format&fit=crop",
  },
  focus: "Systems Design & Open Source Contribution",
  nextSession: "Thu, Apr 24 · 3:00 PM GMT",
  sessionsCompleted: 4,
  totalSessions: 12,
};

const training = {
  title: "Full-Stack Web Engineering",
  cohort: "Cohort 3 · 2026",
  progress: 62,
  currentModule: "Module 6 — API Design & Integration",
  nextDeadline: "Apr 28 · Assignment due",
};

const events = [
  {
    id: "1",
    title: "Codetopia Community Meetup",
    date: "Sat, May 3",
    location: "Accra, Ghana",
    type: "in-person",
    attendees: 120,
  },
  {
    id: "2",
    title: "Open Source Contribution Workshop",
    date: "Wed, May 7",
    location: "Virtual · Discord",
    type: "virtual",
    attendees: 80,
  },
  {
    id: "3",
    title: "Hackathon — Build for Africa",
    date: "Sat, May 17",
    location: "Hybrid · Accra + Online",
    type: "hybrid",
    attendees: 300,
  },
];

const stats = [
  { label: "Events Attended", value: "8" },
  { label: "Programs Completed", value: "2" },
  { label: "Sessions Done", value: "4" },
  { label: "Community Rank", value: "#42" },
];

const securityAlerts = [
  { ok: true, label: "Two-factor authentication enabled" },
  { ok: true, label: "Password updated 4 days ago" },
  { ok: false, label: "Unrecognized login attempt on Apr 16" },
];

const connectedApps = [
  { name: "Codetopia Dev Portal", scopes: "Profile, Code" },
  { name: "CommuniTrack", scopes: "Identity, Stats" },
];

const typeColors: Record<string, string> = {
  "in-person": "bg-emerald-50 text-emerald-700 border-emerald-200",
  virtual: "bg-blue-50 text-blue-700 border-blue-200",
  hybrid: "bg-violet-50 text-violet-700 border-violet-200",
};

export default function Dashboard() {
  const mentorshipPct = Math.round((mentorship.sessionsCompleted / mentorship.totalSessions) * 100);

  return (
    <DashboardShell>
      <div className="max-w-7xl mx-auto pb-20 space-y-8">

        {/* Identity Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-zinc-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-zinc-200 shrink-0">
              {/* biome-ignore lint/performance/noImgElement: member avatar */}
              <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-mono font-bold text-xl text-zinc-900">{member.name}</h1>
                <span className="font-mono text-xs uppercase tracking-widest border border-zinc-200 bg-zinc-50 text-zinc-600 px-2 py-0.5">
                  {member.role}
                </span>
              </div>
              <p className="font-mono text-sm text-zinc-400 mt-0.5">
                {member.communityId} · Member since {member.memberSince}
              </p>
            </div>
          </div>
          <Link
            href="/community"
            className="inline-flex items-center gap-2 font-mono text-sm text-zinc-500 hover:text-zinc-900 transition-colors border-b border-zinc-200 hover:border-zinc-900 pb-px self-start sm:self-auto"
          >
            View community profile <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* LEFT — main */}
          <div className="lg:col-span-2 space-y-8">

            {/* Mentorship */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-sans font-black uppercase text-sm tracking-widest text-zinc-900">
                  Active Mentorship
                </h2>
                <span className="font-mono text-xs text-zinc-400">
                  {mentorship.sessionsCompleted}/{mentorship.totalSessions} sessions
                </span>
              </div>
              <div className="bg-white border border-zinc-200 p-6 space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full overflow-hidden border border-zinc-200 shrink-0">
                    {/* biome-ignore lint/performance/noImgElement: mentor avatar */}
                    <img
                      src={mentorship.mentor.avatarUrl}
                      alt={mentorship.mentor.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-mono font-semibold text-base text-zinc-900">
                      {mentorship.mentor.name}
                    </p>
                    <p className="font-mono text-sm text-zinc-500">{mentorship.mentor.role}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="font-mono text-xs uppercase tracking-widest text-zinc-400">Focus</p>
                  <p className="font-mono text-sm text-zinc-700">{mentorship.focus}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between font-mono text-xs text-zinc-400">
                    <span>Progress</span>
                    <span>{mentorshipPct}%</span>
                  </div>
                  <div className="h-1.5 bg-zinc-100 w-full">
                    <div
                      className="h-full bg-zinc-900 transition-all"
                      style={{ width: `${mentorshipPct}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 font-mono text-sm text-zinc-500 pt-1">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  Next session — {mentorship.nextSession}
                </div>
              </div>
            </section>

            {/* Training */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-sans font-black uppercase text-sm tracking-widest text-zinc-900">
                  Active Training
                </h2>
                <span className="font-mono text-xs text-zinc-400">{training.progress}% complete</span>
              </div>
              <div className="bg-white border border-zinc-200 p-6 space-y-5">
                <div>
                  <p className="font-mono font-semibold text-base text-zinc-900">{training.title}</p>
                  <p className="font-mono text-sm text-zinc-500 mt-0.5">{training.cohort}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between font-mono text-xs text-zinc-400">
                    <span>{training.currentModule}</span>
                    <span>{training.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-zinc-100 w-full">
                    <div
                      className="h-full bg-zinc-900 transition-all"
                      style={{ width: `${training.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 font-mono text-sm text-zinc-500">
                  <BookOpen className="w-3.5 h-3.5 shrink-0" />
                  {training.nextDeadline}
                </div>
              </div>
            </section>

            {/* Upcoming Events */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-sans font-black uppercase text-sm tracking-widest text-zinc-900">
                  Upcoming Events
                </h2>
                <Link
                  href="/community"
                  className="font-mono text-xs text-zinc-400 hover:text-zinc-900 transition-colors flex items-center gap-1"
                >
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="bg-white border border-zinc-200 divide-y divide-zinc-100 overflow-hidden">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="p-5 flex items-center gap-4 group hover:bg-zinc-50 transition-all"
                  >
                    <div className="w-10 h-10 bg-zinc-50 border border-zinc-100 flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4 text-zinc-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono font-semibold text-base text-zinc-900 truncate">
                        {event.title}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 mt-1 font-mono text-sm text-zinc-400">
                        <span>{event.date}</span>
                        <span className="text-zinc-200">·</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {event.location}
                        </span>
                        <span className="text-zinc-200">·</span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" /> {event.attendees}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`font-mono text-xs uppercase tracking-widest border px-2 py-0.5 hidden sm:inline ${typeColors[event.type]}`}
                      >
                        {event.type}
                      </span>
                      <button
                        type="button"
                        className="font-mono text-sm font-semibold text-zinc-900 border-b border-zinc-900 pb-px hover:text-zinc-500 hover:border-zinc-400 transition-all"
                      >
                        Register
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT — sidebar */}
          <div className="space-y-6">

            {/* Stats */}
            <section className="space-y-3">
              <h2 className="font-sans font-black uppercase text-sm tracking-widest text-zinc-900">
                Your Stats
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-white border border-zinc-200 p-4 space-y-1"
                  >
                    <p className="font-mono font-black text-2xl text-zinc-900">{stat.value}</p>
                    <p className="font-mono text-xs text-zinc-400 leading-tight">{stat.label}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Security */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-sans font-black uppercase text-sm tracking-widest text-zinc-900">
                  Security
                </h2>
                <Link
                  href="/settings/security"
                  className="font-mono text-xs text-zinc-400 hover:text-zinc-900 transition-colors flex items-center gap-1"
                >
                  Manage <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
              <div className="bg-white border border-zinc-200 divide-y divide-zinc-100 overflow-hidden">
                {securityAlerts.map((alert) => (
                  <div key={alert.label} className="flex items-center gap-3 px-4 py-3">
                    {alert.ok ? (
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <ShieldAlert className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    )}
                    <p
                      className={`font-mono text-sm ${alert.ok ? "text-zinc-600" : "text-red-600 font-semibold"}`}
                    >
                      {alert.label}
                    </p>
                  </div>
                ))}
                <div className="px-4 py-3 bg-zinc-50 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="font-mono text-xs text-zinc-500">
                      Last login — {member.lastLogin} · {member.loginLocation}
                    </span>
                  </div>
                  <Link
                    href="/activity"
                    className="font-mono text-xs text-zinc-400 hover:text-zinc-900 transition-colors flex items-center gap-1 shrink-0"
                  >
                    Activity <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </section>

            {/* Connected Apps */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-sans font-black uppercase text-sm tracking-widest text-zinc-900">
                  Connected Apps
                </h2>
                <Link
                  href="/settings/apps"
                  className="font-mono text-xs text-zinc-400 hover:text-zinc-900 transition-colors flex items-center gap-1"
                >
                  Manage <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
              <div className="bg-white border border-zinc-200 divide-y divide-zinc-100 overflow-hidden">
                {connectedApps.map((app) => (
                  <div key={app.name} className="flex items-center gap-3 px-4 py-3">
                    <Zap className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-sm font-semibold text-zinc-900 truncate">
                        {app.name}
                      </p>
                      <p className="font-mono text-xs text-zinc-400">{app.scopes}</p>
                    </div>
                  </div>
                ))}
                {connectedApps.length === 0 && (
                  <p className="font-mono text-sm text-zinc-400 px-4 py-3">No apps connected</p>
                )}
              </div>
            </section>

          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

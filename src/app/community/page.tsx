"use client";

import React from "react";
import { DashboardShell } from "@/components/dashboard/Shell";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  Calendar,
  Award,
  TrendingUp,
  MapPin,
  Users,
  ArrowRight,
  Plus,
  Star,
  Zap,
  Globe,
  Clock,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

interface TimelineItem {
  id: string;
  role: string;
  status: string;
  period: string;
  description: string;
  isCurrent?: boolean;
}

interface CommunityEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  attendees: number;
  type: "in-person" | "virtual" | "hybrid";
}

interface Opportunity {
  id: string;
  role: string;
  type: "Full-Time" | "Bounty" | "Volunteer" | "Contract";
  compensation: string;
  location: string;
}

interface ReputationBadge {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  earned: boolean;
}

const timelineData: TimelineItem[] = [
  {
    id: "1",
    role: "Senior Identity Architect",
    status: "Active Rank",
    period: "Jan 2026 – Present",
    description: "Leading the core identity protocol migration for Codetopia nodes.",
    isCurrent: true,
  },
  {
    id: "2",
    role: "Security Researcher",
    status: "Verified",
    period: "Jun 2025 – Dec 2025",
    description: "Conducted zero-day audits on community auth-gateways.",
  },
  {
    id: "3",
    role: "Core Contributor",
    status: "Contributor Level 4",
    period: "Jan 2024 – May 2025",
    description: "Architected the initial open-source repository for community identity.",
  },
  {
    id: "4",
    role: "Frontend Developer",
    status: "Intern Rank",
    period: "Jun 2023 – Dec 2023",
    description: "Assisted in building the initial UI components for the Identity Hub prototype.",
  },
  {
    id: "5",
    role: "Community Evangelist",
    status: "Social Rank",
    period: "Jan 2023 – May 2023",
    description: "Promoted Codetopia identity protocols across dev forums and social nodes.",
  },
];

const events: CommunityEvent[] = [
  { id: "1", title: "Codetopia Summit 2026", date: "May 12", location: "Toronto, CA", attendees: 450, type: "in-person" },
  { id: "2", title: "Security Node Workshop", date: "Jun 04", location: "Virtual / Discord", attendees: 120, type: "virtual" },
  { id: "3", title: "Global Identity Hackathon", date: "Jul 20", location: "Prague, CZ", attendees: 800, type: "hybrid" },
];

const opportunities: Opportunity[] = [
  { id: "1", role: "UI/UX Identity Designer", type: "Full-Time", compensation: "$90k – $120k", location: "Global / Remote" },
  { id: "2", role: "Runtime Security Engineer", type: "Bounty", compensation: "15,000 Credits", location: "Node Network" },
  { id: "3", role: "Community Moderator", type: "Volunteer", compensation: "Legendary Badge", location: "Digital Hub" },
];

const reputationBadges: ReputationBadge[] = [
  { id: "1", label: "Core Contributor", description: "Merged 10+ PRs", icon: Star, earned: true },
  { id: "2", label: "Security Auditor", description: "Completed 3 audits", icon: CheckCircle2, earned: true },
  { id: "3", label: "Protocol Pioneer", description: "Early adopter", icon: Zap, earned: true },
  { id: "4", label: "Global Node", description: "Attend 5 events", icon: Globe, earned: false },
];

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-7 h-7 bg-black text-white flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5" />
      </div>
      <h2 className="font-sans font-black uppercase text-sm tracking-widest text-zinc-900">{title}</h2>
    </div>
  );
}

export default function CommunityPage() {
  const [showAllTimeline, setShowAllTimeline] = React.useState(false);
  const visibleTimeline = showAllTimeline ? timelineData : timelineData.slice(0, 3);

  return (
    <DashboardShell>
      <div className="max-w-6xl space-y-8 pb-20">

        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-sans font-black uppercase tracking-tighter text-zinc-900">
            Community
          </h1>
          <p className="font-mono text-xs uppercase tracking-widest text-zinc-400">
            Your progression, events, and open opportunities
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* LEFT — main content */}
          <div className="lg:col-span-2 space-y-8">

            {/* Identity Journey */}
            <section className="space-y-4">
              <SectionHeader icon={TrendingUp} title="Identity Journey" />
              <div className="bg-white border border-zinc-200 overflow-hidden">
                <div className="p-6">
                  <div className="relative">
                    <div className="absolute left-[5px] top-2 bottom-2 w-px bg-zinc-100" />
                    <div className="space-y-0">
                      {visibleTimeline.map((item, idx) => (
                        <div
                          key={item.id}
                          className={`relative pl-7 group ${idx < visibleTimeline.length - 1 ? "pb-6" : ""}`}
                        >
                          <div
                            className={`absolute left-0 top-[7px] w-[11px] h-[11px] rounded-full border-2 transition-all ${
                              item.isCurrent
                                ? "bg-black border-black"
                                : "bg-white border-zinc-300 group-hover:border-zinc-600"
                            }`}
                          />
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1 flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-sans font-black text-sm uppercase tracking-tight text-zinc-900 leading-none">
                                  {item.role}
                                </h3>
                                {item.isCurrent && (
                                  <span className="inline-flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-widest bg-black text-white px-2 py-0.5 leading-none">
                                    <span className="w-1 h-1 bg-white rounded-full animate-pulse" />
                                    Current
                                  </span>
                                )}
                              </div>
                              <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-400 flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5 shrink-0" />
                                {item.period}
                              </p>
                              <p className="text-[11px] text-zinc-500 leading-relaxed">
                                {item.description}
                              </p>
                            </div>
                            <span className="font-mono text-[8px] uppercase tracking-widest border border-zinc-200 text-zinc-400 px-2 py-0.5 shrink-0 whitespace-nowrap">
                              {item.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {timelineData.length > 3 && (
                  <div className="px-6 py-3 bg-zinc-50 border-t border-zinc-100">
                    <button
                      onClick={() => setShowAllTimeline((v) => !v)}
                      className="font-mono text-[9px] uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors flex items-center gap-1.5"
                    >
                      {showAllTimeline ? "Show less" : `Show ${timelineData.length - 3} more`}
                      <ArrowRight className={`w-3 h-3 transition-transform duration-200 ${showAllTimeline ? "-rotate-90" : ""}`} />
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* Open Opportunities */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <SectionHeader icon={Briefcase} title="Open Opportunities" />
                <Button variant="ghost" className="font-mono text-[9px] uppercase tracking-widest text-zinc-400 hover:text-zinc-900 h-8 px-3">
                  View All <ArrowRight className="ml-1.5 w-3 h-3" />
                </Button>
              </div>
              <div className="bg-white border border-zinc-200 divide-y divide-zinc-100 overflow-hidden">
                {opportunities.map((op) => (
                  <div key={op.id} className="p-5 flex items-center gap-4 group hover:bg-zinc-50 transition-all">
                    <div className="w-9 h-9 bg-zinc-50 border border-zinc-100 flex items-center justify-center shrink-0 group-hover:border-zinc-300 transition-colors">
                      <Briefcase className="w-4 h-4 text-zinc-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-sans font-black uppercase text-xs tracking-wider text-zinc-900 leading-none">
                        {op.role}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="font-mono text-[8px] uppercase tracking-widest border border-zinc-200 bg-zinc-50 text-zinc-500 px-2 py-0.5">
                          {op.type}
                        </span>
                        <span className="font-mono text-[9px] text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5" />
                          {op.location}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="font-mono text-[10px] font-black tracking-widest text-zinc-900 whitespace-nowrap hidden sm:block">
                        {op.compensation}
                      </span>
                      <Button
                        variant="outline"
                        className="h-8 rounded-none border-black bg-black text-white hover:bg-zinc-800 font-mono text-[9px] uppercase tracking-widest px-4"
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>

          {/* RIGHT — sidebar */}
          <div className="space-y-8">

            {/* Reputation */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <SectionHeader icon={Award} title="Reputation" />
                {reputationBadges.length > 0 && (
                  <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-400">
                    {reputationBadges.filter((b) => b.earned).length}/{reputationBadges.length}
                  </span>
                )}
              </div>
              <div className="bg-white border border-zinc-200 overflow-hidden">
                {reputationBadges.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
                    <div className="w-10 h-10 border border-zinc-200 bg-zinc-50 flex items-center justify-center mb-3">
                      <Award className="w-4 h-4 text-zinc-300" />
                    </div>
                    <p className="font-mono text-[10px] font-black uppercase tracking-widest text-zinc-900 mb-1">No Badges Yet</p>
                    <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-400 leading-relaxed">
                      Complete activities to earn badges
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-100">
                    {reputationBadges.map((badge) => (
                      <div
                        key={badge.id}
                        className={`flex items-center gap-3 p-4 transition-all ${badge.earned ? "hover:bg-zinc-50" : "opacity-40"}`}
                      >
                        <div className="w-8 h-8 flex items-center justify-center shrink-0 border border-zinc-200 bg-zinc-50">
                          <badge.icon className={`w-3.5 h-3.5 ${badge.earned ? "text-zinc-900" : "text-zinc-300"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-mono text-[9px] font-black uppercase tracking-widest text-zinc-900 truncate leading-none">
                            {badge.label}
                          </p>
                          <p className="font-mono text-[8px] uppercase tracking-widest text-zinc-400 mt-0.5">
                            {badge.description}
                          </p>
                        </div>
                        {badge.earned
                          ? <CheckCircle2 className="w-3.5 h-3.5 text-zinc-900 shrink-0" />
                          : <Plus className="w-3.5 h-3.5 text-zinc-300 shrink-0" />
                        }
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Upcoming Events */}
            <section className="space-y-4">
              <SectionHeader icon={Calendar} title="Events" />
              <div className="bg-white border border-zinc-200 divide-y divide-zinc-100 overflow-hidden">
                {events.map((event) => (
                  <div key={event.id} className="p-4 group hover:bg-zinc-50 transition-all cursor-pointer">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[9px] font-black text-zinc-900 uppercase tracking-widest">
                            {event.date}
                          </span>
                          <span className="font-mono text-[7px] uppercase tracking-widest border border-zinc-200 bg-zinc-50 text-zinc-400 px-1.5 py-0.5">
                            {event.type}
                          </span>
                        </div>
                        <h4 className="font-sans font-black text-xs uppercase tracking-wider text-zinc-900 group-hover:underline underline-offset-4 leading-tight">
                          {event.title}
                        </h4>
                      </div>
                      <ExternalLink className="w-3 h-3 text-zinc-300 group-hover:text-zinc-500 transition-colors shrink-0 mt-1" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-mono text-[8px] text-zinc-400 uppercase tracking-widest">
                        <span className="flex items-center gap-1"><MapPin className="w-2 h-2" />{event.location}</span>
                        <span className="text-zinc-200">·</span>
                        <span className="flex items-center gap-1"><Users className="w-2 h-2" />{event.attendees.toLocaleString()}</span>
                      </div>
                      <button className="font-mono text-[8px] uppercase tracking-widest text-zinc-900 border-b border-zinc-900 pb-px hover:text-zinc-400 hover:border-zinc-400 transition-all font-bold">
                        Register
                      </button>
                    </div>
                  </div>
                ))}
                <div className="p-3 bg-zinc-50">
                  <Button variant="ghost" className="w-full text-[9px] font-mono uppercase tracking-widest text-zinc-400 hover:text-zinc-900 h-7">
                    View Calendar <ArrowRight className="ml-1.5 w-3 h-3" />
                  </Button>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

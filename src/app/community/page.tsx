"use client";

import {
  ArrowRight,
  BookOpen,
  Briefcase,
  Calendar,
  ExternalLink,
  FolderGit2,
  MapPin,
  Search,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { DashboardShell } from "@/components/dashboard/Shell";
import { Input } from "@/components/ui/input";

// ─── Types ───────────────────────────────────────────────────────────────────

type Tab = "members" | "events" | "programs" | "projects" | "resources";
type MemberRole = "Member" | "Mentor" | "Volunteer" | "Core Team";

interface Member {
  id: string;
  name: string;
  role: string;
  communityRole: MemberRole;
  location: string;
  skills: string[];
  avatarUrl: string;
}

interface CommunityEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  type: "in-person" | "virtual" | "hybrid";
  attendees: number;
  spotsLeft?: number;
}

interface Opportunity {
  id: string;
  title: string;
  type: "Mentorship" | "Volunteer" | "Bounty" | "Full-Time" | "Contract";
  description: string;
  postedBy: string;
}

interface Spotlight {
  id: string;
  member: string;
  avatarUrl: string;
  achievement: string;
  detail: string;
}

interface Program {
  id: string;
  title: string;
  type: "Training" | "Mentorship" | "Bootcamp" | "Workshop";
  description: string;
  duration: string;
  enrolledCount: number;
  spotsLeft?: number;
  status: "open" | "ongoing" | "closed";
}

interface Project {
  id: string;
  title: string;
  description: string;
  stack: string[];
  contributors: number;
  stars: number;
  status: "active" | "seeking-contributors" | "completed";
  repoUrl?: string;
}

interface Resource {
  id: string;
  title: string;
  type: "Article" | "Guide" | "Video" | "Template";
  author: string;
  date: string;
  readTime?: string;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const members: Member[] = [
  {
    id: "1",
    name: "Abena Mensah",
    role: "Senior Engineer",
    communityRole: "Mentor",
    location: "Accra, GH",
    skills: ["Systems Design", "Go", "Kubernetes"],
    avatarUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: "2",
    name: "Kwame Asante",
    role: "Frontend Developer",
    communityRole: "Member",
    location: "Kumasi, GH",
    skills: ["React", "TypeScript", "Figma"],
    avatarUrl: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: "3",
    name: "Ama Owusu",
    role: "DevOps Engineer",
    communityRole: "Mentor",
    location: "Takoradi, GH",
    skills: ["Docker", "CI/CD", "AWS"],
    avatarUrl: "https://images.unsplash.com/photo-1589156229687-496a31ad1d1f?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: "4",
    name: "Kofi Boateng",
    role: "Backend Engineer",
    communityRole: "Member",
    location: "Accra, GH",
    skills: ["Django", "PostgreSQL", "Redis"],
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: "5",
    name: "Efua Darko",
    role: "Mobile Developer",
    communityRole: "Member",
    location: "Cape Coast, GH",
    skills: ["Flutter", "Dart", "Firebase"],
    avatarUrl: "https://images.unsplash.com/photo-1614644147798-f8c0fc9da7f6?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: "6",
    name: "Yaw Frimpong",
    role: "Security Researcher",
    communityRole: "Volunteer",
    location: "Accra, GH",
    skills: ["Pentesting", "Rust", "Cryptography"],
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
  },
];

const events: CommunityEvent[] = [
  {
    id: "1",
    title: "Codetopia Community Meetup",
    date: "Sat, May 3",
    location: "Accra, Ghana",
    type: "in-person",
    attendees: 120,
    spotsLeft: 18,
  },
  {
    id: "2",
    title: "Open Source Contribution Workshop",
    date: "Wed, May 7",
    location: "Virtual · Discord",
    type: "virtual",
    attendees: 80,
    spotsLeft: 40,
  },
  {
    id: "3",
    title: "Hackathon — Build for Africa",
    date: "Sat, May 17",
    location: "Hybrid · Accra + Online",
    type: "hybrid",
    attendees: 300,
  },
  {
    id: "4",
    title: "Web Infrastructure Bootcamp",
    date: "Mon, Jun 2",
    location: "Kumasi, Ghana",
    type: "in-person",
    attendees: 60,
    spotsLeft: 12,
  },
];

const opportunities: Opportunity[] = [
  {
    id: "1",
    title: "Mentor — Frontend Engineering",
    type: "Mentorship",
    description: "Guide 1–2 junior members through React and modern web development practices.",
    postedBy: "Core Team",
  },
  {
    id: "2",
    title: "Community Moderator",
    type: "Volunteer",
    description: "Help moderate Discord, support new members, and keep discussions productive.",
    postedBy: "Core Team",
  },
  {
    id: "3",
    title: "Auth System Security Audit",
    type: "Bounty",
    description: "Review and harden the identity platform's auth layer.",
    postedBy: "Identify Project",
  },
  {
    id: "4",
    title: "Technical Writer",
    type: "Contract",
    description: "Document community projects and publish engineering articles on the Codetopia blog.",
    postedBy: "Content Team",
  },
];

const spotlights: Spotlight[] = [
  {
    id: "1",
    member: "Kwame Asante",
    avatarUrl: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?q=80&w=200&auto=format&fit=crop",
    achievement: "First open-source PR merged",
    detail: "Contributed a critical accessibility fix to OSSAfrica's main platform.",
  },
  {
    id: "2",
    member: "Efua Darko",
    avatarUrl: "https://images.unsplash.com/photo-1614644147798-f8c0fc9da7f6?q=80&w=200&auto=format&fit=crop",
    achievement: "Completed Full-Stack Cohort 2",
    detail: "Graduated with distinction and shipped a live community project.",
  },
  {
    id: "3",
    member: "Yaw Frimpong",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
    achievement: "Security bounty awarded",
    detail: "Identified and reported a critical vulnerability in the community auth gateway.",
  },
];

const programs: Program[] = [
  {
    id: "1",
    title: "Full-Stack Web Engineering",
    type: "Training",
    description: "A structured 6-month program covering frontend, backend, and deployment. From fundamentals to production-grade systems.",
    duration: "6 months",
    enrolledCount: 42,
    spotsLeft: 8,
    status: "open",
  },
  {
    id: "2",
    title: "1-on-1 Mentorship Program",
    type: "Mentorship",
    description: "Get paired with a senior engineer for personalised guidance on your tech journey. Sessions twice a month.",
    duration: "3 months",
    enrolledCount: 18,
    spotsLeft: 4,
    status: "open",
  },
  {
    id: "3",
    title: "DevOps & Cloud Bootcamp",
    type: "Bootcamp",
    description: "Intensive 8-week bootcamp covering Docker, CI/CD pipelines, AWS, and infrastructure as code.",
    duration: "8 weeks",
    enrolledCount: 30,
    status: "ongoing",
  },
  {
    id: "4",
    title: "Open Source Contribution Workshop",
    type: "Workshop",
    description: "A 2-day hands-on workshop teaching Git workflows, code review, and how to contribute to real open-source projects.",
    duration: "2 days",
    enrolledCount: 65,
    status: "closed",
  },
];

const projects: Project[] = [
  {
    id: "1",
    title: "Codetopia Identity (Identify)",
    description: "The community identity and auth platform. Members manage their profile, security, and connected apps here.",
    stack: ["Next.js", "Django", "PostgreSQL"],
    contributors: 6,
    stars: 24,
    status: "active",
  },
  {
    id: "2",
    title: "CommuniTrack",
    description: "An open-source attendance and participation tracker for community events and programs.",
    stack: ["React", "FastAPI", "SQLite"],
    contributors: 3,
    stars: 11,
    status: "seeking-contributors",
  },
  {
    id: "3",
    title: "Codetopia Blog Engine",
    description: "A lightweight CMS built by the community for publishing technical articles and tutorials.",
    stack: ["Astro", "MDX", "Tailwind"],
    contributors: 8,
    stars: 37,
    status: "active",
  },
  {
    id: "4",
    title: "DevPath CLI",
    description: "A command-line tool that helps new developers navigate learning paths and track their progress.",
    stack: ["Rust", "TOML"],
    contributors: 2,
    stars: 9,
    status: "seeking-contributors",
  },
];

const resources: Resource[] = [
  {
    id: "1",
    title: "Getting Started with Open Source Contributions",
    type: "Guide",
    author: "Abena Mensah",
    date: "Apr 10, 2026",
    readTime: "8 min",
  },
  {
    id: "2",
    title: "Understanding Web Infrastructure Basics",
    type: "Article",
    author: "Kofi Boateng",
    date: "Apr 3, 2026",
    readTime: "12 min",
  },
  {
    id: "3",
    title: "Docker for Beginners — Full Workshop Recording",
    type: "Video",
    author: "Ama Owusu",
    date: "Mar 28, 2026",
  },
  {
    id: "4",
    title: "Project README Template",
    type: "Template",
    author: "Core Team",
    date: "Mar 15, 2026",
  },
  {
    id: "5",
    title: "How to Make the Most of Your Mentorship",
    type: "Guide",
    author: "Yaw Frimpong",
    date: "Mar 8, 2026",
    readTime: "6 min",
  },
];

// ─── Style maps ──────────────────────────────────────────────────────────────

const eventTypeColors: Record<string, string> = {
  "in-person": "bg-emerald-50 text-emerald-700 border-emerald-200",
  virtual: "bg-blue-50 text-blue-700 border-blue-200",
  hybrid: "bg-violet-50 text-violet-700 border-violet-200",
};

const opportunityColors: Record<string, string> = {
  Mentorship: "bg-amber-50 text-amber-700 border-amber-200",
  Volunteer: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Bounty: "bg-violet-50 text-violet-700 border-violet-200",
  "Full-Time": "bg-blue-50 text-blue-700 border-blue-200",
  Contract: "bg-zinc-100 text-zinc-600 border-zinc-200",
};

const programTypeColors: Record<string, string> = {
  Training: "bg-blue-50 text-blue-700 border-blue-200",
  Mentorship: "bg-amber-50 text-amber-700 border-amber-200",
  Bootcamp: "bg-violet-50 text-violet-700 border-violet-200",
  Workshop: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const programStatusColors: Record<string, string> = {
  open: "text-emerald-600",
  ongoing: "text-amber-600",
  closed: "text-zinc-400",
};

const projectStatusColors: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "seeking-contributors": "bg-amber-50 text-amber-700 border-amber-200",
  completed: "bg-zinc-100 text-zinc-500 border-zinc-200",
};

const projectStatusLabels: Record<string, string> = {
  active: "Active",
  "seeking-contributors": "Seeking Contributors",
  completed: "Completed",
};

const resourceTypeColors: Record<string, string> = {
  Article: "bg-blue-50 text-blue-700 border-blue-200",
  Guide: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Video: "bg-violet-50 text-violet-700 border-violet-200",
  Template: "bg-zinc-100 text-zinc-600 border-zinc-200",
};

const memberRoleColors: Record<MemberRole, string> = {
  Mentor: "bg-amber-50 text-amber-700 border-amber-200",
  Member: "bg-zinc-100 text-zinc-500 border-zinc-200",
  Volunteer: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Core Team": "bg-blue-50 text-blue-700 border-blue-200",
};

const memberRoleFilters: { label: string; value: MemberRole | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Mentor", value: "Mentor" },
  { label: "Member", value: "Member" },
  { label: "Volunteer", value: "Volunteer" },
  { label: "Core Team", value: "Core Team" },
];

// ─── Tab config ───────────────────────────────────────────────────────────────

const tabs: { id: Tab; label: string }[] = [
  { id: "members", label: "Members" },
  { id: "events", label: "Events" },
  { id: "programs", label: "Programs" },
  { id: "projects", label: "Projects" },
  { id: "resources", label: "Resources" },
];

// ─── Component ───────────────────────────────────────────────────────────────

function CommunityContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [activeTab, setActiveTab] = React.useState<Tab>(() => {
    const t = searchParams.get("tab");
    return (tabs.map((x) => x.id) as string[]).includes(t ?? "") ? (t as Tab) : "members";
  });
  const [memberSearch, setMemberSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<MemberRole | "all">(() => {
    const r = searchParams.get("role");
    return (["all", "Mentor", "Member", "Volunteer", "Core Team"] as string[]).includes(r ?? "") ? (r as MemberRole | "all") : "all";
  });

  function handleTabChange(tab: Tab) {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    if (tab !== "members") params.delete("role");
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  function handleRoleFilter(role: MemberRole | "all") {
    setRoleFilter(role);
    const params = new URLSearchParams(searchParams.toString());
    if (role === "all") params.delete("role");
    else params.set("role", role);
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  const filteredMembers = members.filter((m) => {
    const matchesRole = roleFilter === "all" || m.communityRole === roleFilter;
    const matchesSearch =
      memberSearch === "" ||
      m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.role.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.skills.some((s) => s.toLowerCase().includes(memberSearch.toLowerCase()));
    return matchesRole && matchesSearch;
  });

  return (
    <DashboardShell>
      <div className="max-w-7xl mx-auto pb-20 space-y-8">

        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-sans font-black uppercase tracking-tighter text-zinc-900">
            Community
          </h1>
          <p className="font-mono text-sm text-zinc-500">
            500+ members building Ghana's tech ecosystem
          </p>
        </div>

        {/* Tab nav */}
        <div className="flex border-b border-zinc-200 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`font-mono text-sm px-5 py-3 border-b-2 -mb-px transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-zinc-900 text-zinc-900"
                  : "border-transparent text-zinc-400 hover:text-zinc-700 hover:border-zinc-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Members ── */}
        {activeTab === "members" && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
                <Input
                  placeholder="Search by name, role, or skill..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="h-11 rounded-none border-zinc-200 bg-white pl-9 font-mono text-sm focus-visible:ring-0 focus-visible:border-zinc-900 transition-all"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {memberRoleFilters.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => handleRoleFilter(f.value)}
                    className={`font-mono text-sm px-3 h-11 border transition-all whitespace-nowrap ${
                      roleFilter === f.value
                        ? "bg-black text-white border-black"
                        : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-400 hover:text-zinc-900"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredMembers.map((member) => (
                <Link
                  key={member.id}
                  href={`/community/${member.id}`}
                  className="bg-white border border-zinc-200 p-4 flex items-start gap-3 hover:border-zinc-400 transition-all group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-zinc-200 shrink-0">
                    {/* biome-ignore lint/performance/noImgElement: member avatar */}
                    <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-mono font-semibold text-sm text-zinc-900 truncate group-hover:underline underline-offset-4">{member.name}</p>
                      <ExternalLink className="w-3 h-3 text-zinc-300 group-hover:text-zinc-500 transition-colors shrink-0" />
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <p className="font-mono text-xs text-zinc-500">{member.role}</p>
                      <span className={`font-mono text-[10px] uppercase tracking-widest border px-1.5 py-0.5 ${memberRoleColors[member.communityRole]}`}>
                        {member.communityRole}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin className="w-2.5 h-2.5 text-zinc-300 shrink-0" />
                      <p className="font-mono text-xs text-zinc-400">{member.location}</p>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {member.skills.map((skill) => (
                        <span key={skill} className="font-mono text-[10px] uppercase tracking-widest bg-zinc-50 border border-zinc-100 text-zinc-500 px-1.5 py-0.5">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
              {filteredMembers.length === 0 && (
                <div className="col-span-3 py-16 text-center border border-zinc-200 bg-white">
                  <p className="font-mono text-sm text-zinc-500">No members match your search</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Events ── */}
        {activeTab === "events" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-3">
              {events.map((event) => (
                <div key={event.id} className="bg-white border border-zinc-200 p-5 flex items-center gap-4 hover:bg-zinc-50 transition-all group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`font-mono text-xs uppercase tracking-widest border px-2 py-0.5 ${eventTypeColors[event.type]}`}>
                        {event.type}
                      </span>
                      <span className="font-mono text-sm text-zinc-400">{event.date}</span>
                    </div>
                    <p className="font-mono font-semibold text-base text-zinc-900">{event.title}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-1 font-mono text-sm text-zinc-400">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{event.location}</span>
                      <span className="text-zinc-200">·</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{event.attendees} attending</span>
                      {event.spotsLeft && (
                        <>
                          <span className="text-zinc-200">·</span>
                          <span className="text-amber-600 font-semibold">{event.spotsLeft} spots left</span>
                        </>
                      )}
                    </div>
                  </div>
                  <button type="button" className="font-mono text-sm font-semibold text-zinc-900 border-b border-zinc-900 pb-px hover:text-zinc-500 hover:border-zinc-400 transition-all shrink-0">
                    Register
                  </button>
                </div>
              ))}
            </div>

            {/* Spotlight sidebar */}
            <div className="space-y-4">
              <h2 className="font-sans font-black uppercase text-sm tracking-widest text-zinc-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Spotlight
              </h2>
              <div className="space-y-3">
                {spotlights.map((s) => (
                  <div key={s.id} className="bg-white border border-zinc-200 p-4 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden border border-zinc-200 shrink-0">
                        {/* biome-ignore lint/performance/noImgElement: spotlight avatar */}
                        <img src={s.avatarUrl} alt={s.member} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-mono font-semibold text-sm text-zinc-900">{s.member}</p>
                        <p className="font-mono text-xs text-zinc-500">{s.achievement}</p>
                      </div>
                    </div>
                    <p className="font-mono text-xs text-zinc-400 leading-relaxed">{s.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Programs ── */}
        {activeTab === "programs" && (
          <div className="space-y-3">
            {programs.map((program) => (
              <div key={program.id} className="bg-white border border-zinc-200 p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-zinc-50 transition-all group">
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-mono text-xs uppercase tracking-widest border px-2 py-0.5 ${programTypeColors[program.type]}`}>
                      {program.type}
                    </span>
                    <span className={`font-mono text-xs font-semibold ${programStatusColors[program.status]}`}>
                      {program.status === "open" ? "Open for enrollment" : program.status === "ongoing" ? "In progress" : "Closed"}
                    </span>
                  </div>
                  <p className="font-mono font-semibold text-base text-zinc-900">{program.title}</p>
                  <p className="font-mono text-sm text-zinc-500 leading-relaxed">{program.description}</p>
                  <div className="flex flex-wrap items-center gap-3 font-mono text-sm text-zinc-400">
                    <span>{program.duration}</span>
                    <span className="text-zinc-200">·</span>
                    <span>{program.enrolledCount} enrolled</span>
                    {program.spotsLeft && (
                      <>
                        <span className="text-zinc-200">·</span>
                        <span className="text-amber-600 font-semibold">{program.spotsLeft} spots left</span>
                      </>
                    )}
                  </div>
                </div>
                {program.status === "open" && (
                  <button type="button" className="font-mono text-sm font-semibold text-zinc-900 border-b border-zinc-900 pb-px hover:text-zinc-500 hover:border-zinc-400 transition-all shrink-0 self-start sm:self-auto">
                    Enroll
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Projects ── */}
        {activeTab === "projects" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {projects.map((project) => (
              <div key={project.id} className="bg-white border border-zinc-200 p-5 space-y-3 hover:border-zinc-400 transition-all group">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <FolderGit2 className="w-4 h-4 text-zinc-400 shrink-0" />
                    <p className="font-mono font-semibold text-base text-zinc-900">{project.title}</p>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-300 group-hover:text-zinc-500 transition-colors shrink-0 mt-0.5" />
                </div>
                <p className="font-mono text-sm text-zinc-500 leading-relaxed">{project.description}</p>
                <div className="flex flex-wrap gap-1">
                  {project.stack.map((tech) => (
                    <span key={tech} className="font-mono text-[10px] uppercase tracking-widest bg-zinc-50 border border-zinc-100 text-zinc-500 px-1.5 py-0.5">
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-4 font-mono text-sm text-zinc-400">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{project.contributors}</span>
                    <span className="flex items-center gap-1"><Star className="w-3 h-3" />{project.stars}</span>
                  </div>
                  <span className={`font-mono text-[10px] uppercase tracking-widest border px-2 py-0.5 ${projectStatusColors[project.status]}`}>
                    {projectStatusLabels[project.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Resources ── */}
        {activeTab === "resources" && (
          <div className="bg-white border border-zinc-200 divide-y divide-zinc-100 overflow-hidden">
            {resources.map((resource) => (
              <div key={resource.id} className="p-5 flex items-center gap-4 hover:bg-zinc-50 transition-all group cursor-pointer">
                <BookOpen className="w-4 h-4 text-zinc-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-mono font-semibold text-base text-zinc-900 group-hover:underline underline-offset-4">
                    {resource.title}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-1 font-mono text-sm text-zinc-400">
                    <span>{resource.author}</span>
                    <span className="text-zinc-200">·</span>
                    <span>{resource.date}</span>
                    {resource.readTime && (
                      <>
                        <span className="text-zinc-200">·</span>
                        <span>{resource.readTime} read</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`font-mono text-xs uppercase tracking-widest border px-2 py-0.5 hidden sm:inline ${resourceTypeColors[resource.type]}`}>
                    {resource.type}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-300 group-hover:text-zinc-600 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </DashboardShell>
  );
}

export default function CommunityPage() {
  return (
    <React.Suspense fallback={null}>
      <CommunityContent />
    </React.Suspense>
  );
}

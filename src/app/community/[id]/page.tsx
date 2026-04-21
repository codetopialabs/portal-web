"use client";

import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle2,
  ExternalLink,
  FolderGit2,
  Link2,
  Mail,
  MapPin,
  MessageSquare,
  Star,
  X,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import React from "react";
import { DashboardShell } from "@/components/dashboard/Shell";

type MemberRole = "Member" | "Mentor" | "Volunteer" | "Core Team";

interface MemberProfile {
  id: string;
  name: string;
  role: string;
  communityRole: MemberRole;
  location: string;
  memberSince: string;
  bio: string;
  skills: string[];
  avatarUrl: string;
  social: {
    github?: string;
    twitter?: string;
    linkedin?: string;
    email?: string;
  };
  stats: {
    programsCompleted: number;
    sessionsGiven?: number;
    sessionsReceived?: number;
    eventsAttended: number;
    contributions: number;
  };
  programs: { id: string; title: string; status: "completed" | "active"; cohort: string }[];
  projects: { id: string; title: string; role: string; stars: number }[];
  mentorshipAvailable?: boolean;
  mentorshipFocus?: string;
}

const profiles: Record<string, MemberProfile> = {
  "1": {
    id: "1",
    name: "Abena Mensah",
    role: "Senior Engineer",
    communityRole: "Mentor",
    location: "Accra, GH",
    memberSince: "Mar 2023",
    bio: "10+ years building distributed systems across fintech and open source. I maintain several Go libraries used in production across Africa. Passionate about growing the next generation of African engineers — I mentor 2 members at any given time and believe deeply in learning-by-doing.",
    skills: ["Systems Design", "Go", "Kubernetes", "PostgreSQL", "gRPC"],
    avatarUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=400&auto=format&fit=crop",
    social: { github: "abenamensah", twitter: "abenamensah", linkedin: "abenamensah" },
    stats: { programsCompleted: 0, sessionsGiven: 24, eventsAttended: 12, contributions: 47 },
    programs: [
      { id: "1", title: "Full-Stack Web Engineering", status: "active", cohort: "Cohort 3 · 2026" },
    ],
    projects: [
      { id: "1", title: "Codetopia Identity (Identify)", role: "Contributor", stars: 24 },
      { id: "3", title: "Codetopia Blog Engine", role: "Maintainer", stars: 37 },
    ],
    mentorshipAvailable: true,
    mentorshipFocus: "Systems Design, Open Source, Backend Engineering",
  },
  "2": {
    id: "2",
    name: "Kwame Asante",
    role: "Frontend Developer",
    communityRole: "Member",
    location: "Kumasi, GH",
    memberSince: "Aug 2024",
    bio: "Frontend engineer focused on accessible, performant UIs. Currently enrolled in the Full-Stack Web Engineering cohort. I contributed my first open-source PR this year and haven't stopped since.",
    skills: ["React", "TypeScript", "Figma", "CSS", "Next.js"],
    avatarUrl: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?q=80&w=400&auto=format&fit=crop",
    social: { github: "kwameasante", twitter: "kwameasante" },
    stats: { programsCompleted: 1, sessionsReceived: 4, eventsAttended: 6, contributions: 8 },
    programs: [
      { id: "1", title: "Full-Stack Web Engineering", status: "active", cohort: "Cohort 3 · 2026" },
      { id: "4", title: "Frontend Fundamentals", status: "completed", cohort: "Cohort 1 · 2025" },
    ],
    projects: [
      { id: "1", title: "Codetopia Identity (Identify)", role: "Contributor", stars: 24 },
    ],
  },
  "3": {
    id: "3",
    name: "Ama Owusu",
    role: "DevOps Engineer",
    communityRole: "Mentor",
    location: "Takoradi, GH",
    memberSince: "Jan 2023",
    bio: "Infrastructure engineer at heart. I automate everything and believe every developer should understand how their code runs in production. I run the DevOps & Cloud Bootcamp and mentor engineers transitioning into platform engineering.",
    skills: ["Docker", "CI/CD", "AWS", "Terraform", "Linux"],
    avatarUrl: "https://images.unsplash.com/photo-1589156229687-496a31ad1d1f?q=80&w=400&auto=format&fit=crop",
    social: { github: "amaowusu", linkedin: "amaowusu", email: "ama@codetopia.com" },
    stats: { programsCompleted: 2, sessionsGiven: 18, eventsAttended: 15, contributions: 31 },
    programs: [
      { id: "2", title: "DevOps & Cloud Bootcamp", status: "active", cohort: "Cohort 1 · 2026" },
    ],
    projects: [
      { id: "2", title: "CommuniTrack", role: "Contributor", stars: 11 },
    ],
    mentorshipAvailable: false,
    mentorshipFocus: "DevOps, Cloud Infrastructure, Linux",
  },
  "4": {
    id: "4",
    name: "Kofi Boateng",
    role: "Backend Engineer",
    communityRole: "Member",
    location: "Accra, GH",
    memberSince: "Jun 2024",
    bio: "Backend engineer specialising in API design and database performance. I write a lot of Django and love digging into slow queries. Currently working on CommuniTrack with the community.",
    skills: ["Django", "PostgreSQL", "Redis", "Python", "REST APIs"],
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop",
    social: { github: "kofiboateng", twitter: "kofiboateng" },
    stats: { programsCompleted: 1, sessionsReceived: 6, eventsAttended: 9, contributions: 14 },
    programs: [
      { id: "4", title: "Open Source Contribution Workshop", status: "completed", cohort: "Edition 2 · 2025" },
    ],
    projects: [
      { id: "2", title: "CommuniTrack", role: "Maintainer", stars: 11 },
    ],
  },
  "5": {
    id: "5",
    name: "Efua Darko",
    role: "Mobile Developer",
    communityRole: "Member",
    location: "Cape Coast, GH",
    memberSince: "Oct 2024",
    bio: "Building mobile apps with Flutter. Recently graduated from the Full-Stack Cohort 2 with distinction and shipped a live community attendance app. Looking to contribute more to open source in 2026.",
    skills: ["Flutter", "Dart", "Firebase", "UI/UX", "REST APIs"],
    avatarUrl: "https://images.unsplash.com/photo-1614644147798-f8c0fc9da7f6?q=80&w=400&auto=format&fit=crop",
    social: { github: "efuadarko", linkedin: "efuadarko" },
    stats: { programsCompleted: 1, sessionsReceived: 3, eventsAttended: 5, contributions: 6 },
    programs: [
      { id: "3", title: "Full-Stack Web Engineering (Cohort 2)", status: "completed", cohort: "Cohort 2 · 2025" },
    ],
    projects: [],
  },
  "6": {
    id: "6",
    name: "Yaw Frimpong",
    role: "Security Researcher",
    communityRole: "Volunteer",
    location: "Accra, GH",
    memberSince: "May 2023",
    bio: "Security researcher and CTF enthusiast. I run the community's security audit initiatives and have been responsible for hardening the Identify platform's auth layer. If there's a bug bounty, I'm on it.",
    skills: ["Pentesting", "Rust", "Cryptography", "OSINT", "Web Security"],
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop",
    social: { github: "yawfrimpong", twitter: "yawfrimpong" },
    stats: { programsCompleted: 3, eventsAttended: 20, contributions: 29 },
    programs: [
      { id: "4", title: "Open Source Contribution Workshop", status: "completed", cohort: "Edition 2 · 2025" },
    ],
    projects: [
      { id: "1", title: "Codetopia Identity (Identify)", role: "Security Auditor", stars: 24 },
    ],
  },
};

const communityRoleColors: Record<MemberRole, string> = {
  Mentor: "bg-amber-50 text-amber-700 border-amber-200",
  Member: "bg-zinc-100 text-zinc-500 border-zinc-200",
  Volunteer: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Core Team": "bg-blue-50 text-blue-700 border-blue-200",
};

function NotFound() {
  return (
    <DashboardShell>
      <div className="max-w-6xl mx-auto pb-20 pt-10 flex flex-col items-center gap-4 text-center">
        <p className="font-mono font-semibold text-sm text-zinc-900">Member not found</p>
        <Link
          href="/community"
          className="inline-flex items-center gap-2 font-mono text-sm text-zinc-500 hover:text-zinc-900 transition-colors border-b border-zinc-300 hover:border-zinc-900 pb-px"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Community
        </Link>
      </div>
    </DashboardShell>
  );
}

export default function MemberProfilePage() {
  const { id } = useParams<{ id: string }>();
  const profile = profiles[id];

  if (!profile) return <NotFound />;

  const statItems = [
    { label: "Programs Completed", value: profile.stats.programsCompleted },
    ...(profile.stats.sessionsGiven !== undefined
      ? [{ label: "Sessions Given", value: profile.stats.sessionsGiven }]
      : []),
    ...(profile.stats.sessionsReceived !== undefined
      ? [{ label: "Sessions Received", value: profile.stats.sessionsReceived }]
      : []),
    { label: "Events Attended", value: profile.stats.eventsAttended },
    { label: "Contributions", value: profile.stats.contributions },
  ];

  return (
    <DashboardShell>
      <div className="max-w-6xl mx-auto pb-20 space-y-8">

        {/* Back */}
        <Link
          href="/community?tab=members"
          className="inline-flex items-center gap-2 font-mono text-sm text-zinc-400 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Community
        </Link>

        {/* Profile header */}
        <div className="bg-white border border-zinc-200 p-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-zinc-200 shrink-0">
              {/* biome-ignore lint/performance/noImgElement: member profile avatar */}
              <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="font-mono font-bold text-xl text-zinc-900">{profile.name}</h1>
                <span className={`font-mono text-xs uppercase tracking-widest border px-2 py-0.5 ${communityRoleColors[profile.communityRole]}`}>
                  {profile.communityRole}
                </span>
              </div>
              <p className="font-mono text-sm text-zinc-500">{profile.role}</p>
              <div className="flex flex-wrap items-center gap-4 mt-2 font-mono text-xs text-zinc-400">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{profile.location}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Member since {profile.memberSince}</span>
              </div>

              {/* Social links */}
              <div className="flex items-center gap-3 mt-4">
                {profile.social.github && (
                  <a href={`https://github.com/${profile.social.github}`} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-xs text-zinc-400 hover:text-zinc-900 transition-colors border-b border-zinc-200 hover:border-zinc-900 pb-px">
                    <Link2 className="w-3 h-3" /> GitHub
                  </a>
                )}
                {profile.social.twitter && (
                  <a href={`https://x.com/${profile.social.twitter}`} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-xs text-zinc-400 hover:text-zinc-900 transition-colors border-b border-zinc-200 hover:border-zinc-900 pb-px">
                    <X className="w-3 h-3" /> X
                  </a>
                )}
                {profile.social.linkedin && (
                  <a href={`https://linkedin.com/in/${profile.social.linkedin}`} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-xs text-zinc-400 hover:text-zinc-900 transition-colors border-b border-zinc-200 hover:border-zinc-900 pb-px">
                    <Link2 className="w-3 h-3" /> LinkedIn
                  </a>
                )}
                {profile.social.email && (
                  <a href={`mailto:${profile.social.email}`}
                    className="inline-flex items-center gap-1 font-mono text-xs text-zinc-400 hover:text-zinc-900 transition-colors border-b border-zinc-200 hover:border-zinc-900 pb-px">
                    <Mail className="w-3 h-3" /> Email
                  </a>
                )}
              </div>
            </div>

            <button
              type="button"
              className="inline-flex items-center gap-2 h-9 px-4 bg-zinc-900 text-white font-mono text-xs uppercase tracking-widest hover:bg-zinc-700 transition-colors shrink-0"
            >
              <MessageSquare className="w-3.5 h-3.5" /> Message
            </button>
          </div>

          {/* Bio */}
          <div className="mt-6 pt-6 border-t border-zinc-100">
            <p className="font-mono text-sm text-zinc-600 leading-relaxed">{profile.bio}</p>
          </div>

          {/* Skills */}
          <div className="mt-5 flex flex-wrap gap-1.5">
            {profile.skills.map((skill) => (
              <span key={skill} className="font-mono text-xs uppercase tracking-widest bg-zinc-50 border border-zinc-200 text-zinc-600 px-2 py-1">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div className={`grid gap-3 grid-cols-2 sm:grid-cols-${Math.min(statItems.length, 4)}`}>
          {statItems.map((s) => (
            <div key={s.label} className="bg-white border border-zinc-200 p-4 space-y-1">
              <p className="font-mono font-black text-2xl text-zinc-900">{s.value}</p>
              <p className="font-mono text-xs text-zinc-400">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* Left — main content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Mentorship availability */}
            {profile.communityRole === "Mentor" && (
              <div className={`border p-5 space-y-3 ${profile.mentorshipAvailable ? "bg-amber-50 border-amber-200" : "bg-zinc-50 border-zinc-200"}`}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Users className={`w-4 h-4 shrink-0 ${profile.mentorshipAvailable ? "text-amber-600" : "text-zinc-400"}`} />
                    <p className={`font-mono font-semibold text-sm ${profile.mentorshipAvailable ? "text-amber-900" : "text-zinc-600"}`}>
                      {profile.mentorshipAvailable ? "Available for mentorship" : "Not accepting new mentees"}
                    </p>
                  </div>
                  {profile.mentorshipAvailable && (
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 h-8 px-3 bg-zinc-900 text-white font-mono text-xs uppercase tracking-widest hover:bg-zinc-700 transition-colors shrink-0"
                    >
                      Request Mentorship
                    </button>
                  )}
                </div>
                {profile.mentorshipFocus && (
                  <p className="font-mono text-xs text-zinc-500">
                    <span className="text-zinc-400 uppercase tracking-widest">Focus — </span>
                    {profile.mentorshipFocus}
                  </p>
                )}
              </div>
            )}

            {/* Programs */}
            {profile.programs.length > 0 && (
              <section className="space-y-4">
                <h2 className="font-sans font-black uppercase text-sm tracking-widest text-zinc-900">Programs</h2>
                <div className="bg-white border border-zinc-200 divide-y divide-zinc-100 overflow-hidden">
                  {profile.programs.map((p) => (
                    <div key={p.id} className="flex items-center gap-4 px-5 py-4">
                      {p.status === "completed" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <BookOpen className="w-4 h-4 text-zinc-400 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-mono font-semibold text-sm text-zinc-900">{p.title}</p>
                        <p className="font-mono text-xs text-zinc-400 mt-0.5">{p.cohort}</p>
                      </div>
                      <span className={`font-mono text-xs font-semibold shrink-0 ${p.status === "completed" ? "text-emerald-600" : "text-amber-600"}`}>
                        {p.status === "completed" ? "Completed" : "Active"}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Projects */}
            {profile.projects.length > 0 && (
              <section className="space-y-4">
                <h2 className="font-sans font-black uppercase text-sm tracking-widest text-zinc-900">Projects</h2>
                <div className="bg-white border border-zinc-200 divide-y divide-zinc-100 overflow-hidden">
                  {profile.projects.map((p) => (
                    <div key={p.id} className="flex items-center gap-4 px-5 py-4 group hover:bg-zinc-50 transition-all cursor-pointer">
                      <FolderGit2 className="w-4 h-4 text-zinc-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-mono font-semibold text-sm text-zinc-900 group-hover:underline underline-offset-4">{p.title}</p>
                        <p className="font-mono text-xs text-zinc-400 mt-0.5">{p.role}</p>
                      </div>
                      <div className="flex items-center gap-1 font-mono text-xs text-zinc-400 shrink-0">
                        <Star className="w-3 h-3" /> {p.stars}
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-zinc-300 group-hover:text-zinc-500 transition-colors shrink-0" />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            <div className="bg-white border border-zinc-200 p-5 space-y-4">
              <h2 className="font-sans font-black uppercase text-sm tracking-widest text-zinc-900">About</h2>
              <div className="space-y-3 font-mono text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Role</span>
                  <span className="text-zinc-900 font-semibold">{profile.role}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Location</span>
                  <span className="text-zinc-900 font-semibold">{profile.location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Member since</span>
                  <span className="text-zinc-900 font-semibold">{profile.memberSince}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Community role</span>
                  <span className={`font-mono text-xs uppercase tracking-widest border px-1.5 py-0.5 ${communityRoleColors[profile.communityRole]}`}>
                    {profile.communityRole}
                  </span>
                </div>
              </div>
            </div>

            <Link
              href="/community?tab=members"
              className="flex items-center gap-2 font-mono text-sm text-zinc-400 hover:text-zinc-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Members
            </Link>
          </div>
        </div>

      </div>
    </DashboardShell>
  );
}

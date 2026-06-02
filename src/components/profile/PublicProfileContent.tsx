"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Bot,
  BrainCircuit,
  CalendarDays,
  Cloud,
  Code2,
  Cpu,
  FileText,
  FlaskConical,
  Globe,
  HelpCircle,
  Link2,
  MapPin,
  Pencil,
  Paintbrush,
  Shield,
  Smartphone,
  Sparkles,
  TestTube2,
} from "lucide-react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import type { ComponentType } from "react";
import { FaGithub, FaLinkedin, FaXTwitter } from "react-icons/fa6";
import { ProfileSkeleton } from "@/components/profile/ProfileSkeleton";
import { ContributionGraph } from "@/components/contributions/ContributionGraph";
import { PublicProfileFooter } from "@/components/profile/PublicProfileFooter";
import { PublicProfileHeader } from "@/components/profile/PublicProfileHeader";
import { formatJoinedAt, formatRoleLabel } from "@/components/profile/utils";
import { usePermission } from "@/hooks/usePermission";
import { getAvatarUrl, getCoverUrl } from "@/lib/utils";
import { UserService } from "@/services/user.service";
import { useUserStore } from "@/store/user.store";
import type { SocialLink } from "@/types/profile";
import { normalizeUrl } from "@/utils/url";

// ─── Discipline icon + label map ─────────────────────────────────────────────

interface DisciplineMeta {
  label: string;
  icon: ComponentType<{ className?: string }>;
  color: string; // tailwind text colour
}

const DISCIPLINE_MAP: Record<string, DisciplineMeta> = {
  software_engineering: { label: "Software Engineering", icon: Code2, color: "text-sky-400" },
  ux_ui_design: { label: "UX / UI Design", icon: Paintbrush, color: "text-pink-400" },
  data_science: { label: "Data Science", icon: FlaskConical, color: "text-violet-400" },
  ml_ai: { label: "Machine Learning / AI", icon: BrainCircuit, color: "text-amber-400" },
  cybersecurity: { label: "Cybersecurity", icon: Shield, color: "text-red-400" },
  cloud_devops: { label: "Cloud / DevOps", icon: Cloud, color: "text-cyan-400" },
  product_management: { label: "Product Management", icon: Sparkles, color: "text-emerald-400" },
  hardware_embedded: { label: "Hardware / Embedded", icon: Cpu, color: "text-orange-400" },
  robotics_iot: { label: "Robotics / IoT", icon: Bot, color: "text-lime-400" },
  mobile_development: { label: "Mobile Development", icon: Smartphone, color: "text-blue-400" },
  qa_testing: { label: "QA / Testing", icon: TestTube2, color: "text-yellow-400" },
  technical_writing: { label: "Technical Writing", icon: FileText, color: "text-zinc-300" },
  other: { label: "Other", icon: HelpCircle, color: "text-zinc-400" },
};

export function PublicProfileContent() {
  const { username: paramUsername } = useParams<{ username: string }>();
  let username = paramUsername ? decodeURIComponent(paramUsername) : "";
  username = username.startsWith("@") ? username.substring(1) : username;

  const currentUser = useUserStore((s) => s.profile);
  const canEditMembers = usePermission("users.edit");
  const canEditOwnProfile = usePermission("profile.edit");

  const {
    data: profile,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["member-public-profile", username],
    queryFn: () => UserService.getMemberByUsername(username),
    enabled: Boolean(username),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-white text-zinc-950">
        <PublicProfileHeader />
        <div className="flex-grow">
          <ProfileSkeleton />
        </div>
        <PublicProfileFooter />
      </div>
    );
  }

  if (!profile || isError) {
    notFound();
  }

  // ─── derived values ───────────────────────────────────────────────────────

  const primaryRole = profile.primaryRole
    ? formatRoleLabel(profile.primaryRole)
    : profile.communityRoles?.[0]
      ? formatRoleLabel(profile.communityRoles[0])
      : "Member";

  const roleList =
    profile.communityRoles && profile.communityRoles.length > 0
      ? profile.communityRoles.map(formatRoleLabel)
      : ["Member"];

  const jobTitle = profile.currentRole || null;
  const displayLocation = profile.location || null;
  const discipline = profile.discipline
    ? (DISCIPLINE_MAP[profile.discipline] ?? { label: profile.discipline.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase()), icon: HelpCircle, color: "text-zinc-400" })
    : null;
  const skills = profile.skills ?? [];
  const firstName = profile.fullName?.split(" ")[0] || "This member";

  const isOwnProfile = currentUser?.username === username;
  const showOwnProfileEdit = isOwnProfile && canEditOwnProfile;
  const showAdminEdit = !isOwnProfile && canEditMembers;

  const socialLinks: SocialLink[] = [];
  if (profile.githubHandle) {
    socialLinks.push({
      label: "GitHub",
      href: `https://github.com/${profile.githubHandle.replace(/^@/, "")}`,
      icon: FaGithub,
    });
  }
  if (profile.twitterHandle) {
    socialLinks.push({
      label: "X / Twitter",
      href: `https://x.com/${profile.twitterHandle.replace(/^@/, "")}`,
      icon: FaXTwitter,
    });
  }
  if (profile.linkedinUrl) {
    socialLinks.push({
      label: "LinkedIn",
      href: normalizeUrl(profile.linkedinUrl),
      icon: FaLinkedin,
    });
  }
  if (profile.websiteUrl) {
    socialLinks.push({
      label: "Website",
      href: normalizeUrl(profile.websiteUrl),
      icon: Globe,
    });
  }

  // ─── render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col bg-white text-zinc-950">
      <PublicProfileHeader />

      <main className="flex-grow">

        {/* ── Hero ── */}
        <section className="relative min-h-[28rem] bg-zinc-950 pt-16 text-white">
          <div className="absolute inset-0">
            {/* biome-ignore lint/performance/noImgElement: user cover image */}
            <img
              src={getCoverUrl(profile.coverImageUrl, profile.fullName)}
              alt=""
              className="h-full w-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,#00000066_0%,#00000033_32%,#000000e6_92%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,#000000e6_0%,#00000099_42%,#00000026_100%)]" />
          </div>

          <div className="relative mx-auto flex min-h-[calc(28rem-4rem)] max-w-7xl items-end px-4 py-10 sm:px-6 lg:py-14">
            <div className="w-full">
              {/* Community role + discipline badges */}
              <div className="mb-6 flex flex-wrap items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-300">
                <span className="inline-flex items-center gap-2 border border-white/15 bg-white/10 px-3 py-1.5">
                  <Sparkles className="h-3 w-3 text-amber-300" />
                  {primaryRole}
                </span>
                {discipline && (
                  <span className="inline-flex items-center gap-2 border border-white/15 bg-white/10 px-3 py-1.5">
                    <discipline.icon className={`h-3 w-3 ${discipline.color}`} />
                    {discipline.label}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
                {/* Avatar */}
                <div className="h-28 w-28 shrink-0 border border-white/30 bg-white p-1 shadow-2xl sm:h-36 sm:w-36">
                  {/* biome-ignore lint/performance/noImgElement: user avatar */}
                  <img
                    src={getAvatarUrl(profile.profilePictureUrl, profile.fullName)}
                    alt={profile.fullName}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Name + meta */}
                <div className="min-w-0">
                  <p className="font-mono text-[11px] font-bold uppercase tracking-[0.28em] text-emerald-300">
                    {jobTitle ?? primaryRole}
                  </p>
                  <h1 className="mt-2 max-w-4xl font-sans text-4xl font-black leading-[0.95] tracking-normal text-white sm:text-6xl">
                    {profile.fullName}
                  </h1>
                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-300">
                    <span className="inline-flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-sky-300" />
                      {displayLocation ?? "Remote"}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <CalendarDays className="h-3.5 w-3.5 text-amber-300" />
                      Joined {formatJoinedAt(profile.joinedAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Main body ── */}
        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 pb-20 sm:px-6 lg:grid-cols-[1.4fr_0.6fr]">

          {/* Left — bio + skills */}
          <div className="space-y-6">

            {/* Bio */}
            <div className="border border-zinc-200 bg-white p-6 sm:p-8">
              <h2 className="font-sans text-xl font-black text-zinc-950">Bio</h2>
              <div className="mt-5">
                {profile.bio ? (
                  <p className="whitespace-pre-wrap font-sans text-sm leading-7 text-zinc-600 sm:text-base">
                    {profile.bio}
                  </p>
                ) : (
                  <p className="font-mono text-sm text-zinc-400 italic">
                    {firstName} hasn't added a bio yet.
                  </p>
                )}
              </div>
            </div>

            {/* Skills */}
            <div className="border border-zinc-200 bg-white p-6 sm:p-8">
              <h2 className="font-sans text-xl font-black text-zinc-950">Skills</h2>
              <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-400">
                Tools and focus areas
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {skills.length > 0 ? (
                  skills.map((skill) => (
                    <span
                      key={skill}
                      className="border border-zinc-200 bg-zinc-50 px-3 py-1.5 font-mono text-[10px] font-black uppercase tracking-[0.16em] text-zinc-700"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="font-mono text-sm text-zinc-400 italic">No skills added yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right — roles, links, edit */}
          <aside className="space-y-5">

            {/* Discipline */}
            {discipline && (
              <div className="border border-zinc-200 bg-white p-5">
                <h2 className="font-sans text-base font-black text-zinc-950">Discipline</h2>
                <p className="mt-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-400">
                  Primary focus area
                </p>
                <div className="mt-4 flex items-center gap-3 border border-zinc-100 bg-zinc-50 px-3 py-3">
                  <discipline.icon className={`h-5 w-5 shrink-0 ${discipline.color}`} />
                  <span className="font-mono text-[11px] font-black uppercase tracking-[0.16em] text-zinc-700">
                    {discipline.label}
                  </span>
                </div>
              </div>
            )}

            {/* Community roles */}
            <div className="border border-zinc-200 bg-white p-5">
              <h2 className="font-sans text-base font-black text-zinc-950">Community Roles</h2>
              <p className="mt-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-400">
                Access level
              </p>
              <div className="mt-4 space-y-2">
                {roleList.map((role) => (
                  <div
                    key={role}
                    className="flex items-center justify-between border border-zinc-100 bg-zinc-50 px-3 py-2.5"
                  >
                    <span className="font-mono text-[11px] font-black uppercase tracking-[0.16em] text-zinc-700">
                      {role}
                    </span>
                    <span className="h-1.5 w-1.5 shrink-0 bg-zinc-900" />
                  </div>
                ))}
              </div>
            </div>

            {/* Social links */}
            {socialLinks.length > 0 && (
              <div className="border border-zinc-200 bg-white p-5">
                <h2 className="font-sans text-base font-black text-zinc-950">Links</h2>
                <p className="mt-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-400">
                  Find {firstName} online
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {socialLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <a
                        key={link.label}
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        title={link.label}
                        className="flex h-10 w-10 items-center justify-center border border-zinc-200 bg-zinc-50 text-zinc-500 transition-colors hover:border-zinc-900 hover:bg-zinc-900 hover:text-white"
                      >
                        <Icon className="h-4 w-4" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Edit buttons */}
            {showOwnProfileEdit && (
              <Link
                href="/settings/profile"
                className="inline-flex h-11 w-full items-center justify-center gap-2 bg-zinc-900 px-5 font-mono text-[11px] font-black uppercase tracking-[0.16em] text-white transition-colors hover:bg-zinc-800"
              >
                Edit Your Profile
                <Link2 className="h-4 w-4" />
              </Link>
            )}

            {showAdminEdit && (
              <Link
                href={`/admin/members/${profile.username}/edit`}
                className="inline-flex h-11 w-full items-center justify-center gap-2 border border-zinc-900 px-5 font-mono text-[11px] font-black uppercase tracking-[0.16em] text-zinc-950 transition-colors hover:bg-zinc-900 hover:text-white"
              >
                <Pencil className="h-4 w-4" />
                Edit Member
              </Link>
            )}
          </aside>
        </section>
      </main>

      <PublicProfileFooter />
    </div>
  );
}

    </div>
  );
}

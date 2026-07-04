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
  Paintbrush,
  Pencil,
  Shield,
  Smartphone,
  Sparkles,
  TestTube2,
} from "lucide-react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import type { ComponentType } from "react";
import { FaGithub, FaLinkedin, FaXTwitter } from "react-icons/fa6";
import { ContributionGraph } from "@/components/contributions/ContributionGraph";
import { ProfileSkeleton } from "@/components/profile/ProfileSkeleton";
import { PublicProfileFooter } from "@/components/profile/PublicProfileFooter";
import { PublicProfileHeader } from "@/components/profile/PublicProfileHeader";
import { formatJoinedAt } from "@/components/profile/utils";
import { usePermission } from "@/hooks/usePermission";
import { LINK_PLATFORMS } from "@/lib/social-platforms";
import { getAvatarUrl, getCoverUrl, sanitizeHandle } from "@/lib/utils";
import { UserService } from "@/services/user.service";
import { useUserStore } from "@/store/user.store";
import type { SocialLink } from "@/types/profile";
import { normalizeUrl } from "@/utils/url";

interface DisciplineMeta {
  label: string;
  icon: ComponentType<{ className?: string }>;
}

const DISCIPLINE_MAP: Record<string, DisciplineMeta> = {
  software_engineering: { label: "Software Engineering", icon: Code2 },
  ux_ui_design: { label: "UX / UI Design", icon: Paintbrush },
  data_science: { label: "Data Science", icon: FlaskConical },
  ml_ai: { label: "Machine Learning / AI", icon: BrainCircuit },
  cybersecurity: { label: "Cybersecurity", icon: Shield },
  cloud_devops: { label: "Cloud / DevOps", icon: Cloud },
  product_management: { label: "Product Management", icon: Sparkles },
  hardware_embedded: { label: "Hardware / Embedded", icon: Cpu },
  robotics_iot: { label: "Robotics / IoT", icon: Bot },
  mobile_development: { label: "Mobile Development", icon: Smartphone },
  qa_testing: { label: "QA / Testing", icon: TestTube2 },
  technical_writing: { label: "Technical Writing", icon: FileText },
  other: { label: "Other", icon: HelpCircle },
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

  const primaryRole = profile.primaryRole || profile.communityRoles?.[0] || "Member";
  const filteredRoles = profile.communityRoles?.filter((r: string) => r.trim() !== "") || [];
  const roleList = filteredRoles.length > 0 ? filteredRoles : ["Member"];
  const jobTitle = profile.currentRole || null;
  const displayLocation = profile.location || null;
  const discipline = profile.discipline
    ? (DISCIPLINE_MAP[profile.discipline] ?? {
        label: profile.discipline
          .replace(/_/g, " ")
          .replace(/\b\w/g, (l: string) => l.toUpperCase()),
        icon: HelpCircle,
      })
    : null;
  const skills = profile.skills ?? [];
  const careerProgressions = profile.careerProgressions ?? [];
  const firstName = profile.fullName?.split(" ")[0] || "This member";

  const isOwnProfile = currentUser?.username === username;
  const showOwnProfileEdit = isOwnProfile && canEditOwnProfile;
  const showAdminEdit = !isOwnProfile && canEditMembers;

  const socialLinks: SocialLink[] = [];
  if (profile.githubHandle) {
    socialLinks.push({
      label: "GitHub",
      href: `https://github.com/${sanitizeHandle(profile.githubHandle)}`,
      icon: FaGithub,
    });
  }
  if (profile.twitterHandle) {
    socialLinks.push({
      label: "X / Twitter",
      href: `https://x.com/${sanitizeHandle(profile.twitterHandle)}`,
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
    socialLinks.push({ label: "Website", href: normalizeUrl(profile.websiteUrl), icon: Globe });
  }
  for (const link of profile.socialLinks ?? []) {
    if (!link.url.trim()) continue;
    const platform = LINK_PLATFORMS.find((p) => p.value === link.platform);
    socialLinks.push({
      label: link.label || platform?.label || "Link",
      href: normalizeUrl(link.url),
      icon: platform?.icon ?? Globe,
    });
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-zinc-950">
      <PublicProfileHeader />

      <main className="flex-grow">
        {/* â”€â”€ Hero â”€â”€ */}
        <section className="relative bg-zinc-950">
          {/* Cover image */}
          <div className="absolute inset-0 h-80">
            {/* biome-ignore lint/performance/noImgElement: user cover image */}
            <img
              src={getCoverUrl(profile.coverImageUrl, profile.fullName)}
              alt=""
              className="h-full w-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
          </div>

          {/* Hero content */}
          <div className="relative mx-auto max-w-7xl px-4 pb-0 pt-28 sm:px-6">
            {/* Badges */}
            <div className="mb-5 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 border border-white/15 bg-white/10 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                <Sparkles className="h-3 w-3 text-white/70" />
                {primaryRole}
              </span>
              {discipline && (
                <span className="inline-flex items-center gap-1.5 border border-white/15 bg-white/10 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                  <discipline.icon className="h-3 w-3 text-white/70" />
                  {discipline.label}
                </span>
              )}
            </div>

            {/* Avatar + name block */}
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
              <div className="h-32 w-32 shrink-0 border-[3px] border-zinc-800 bg-zinc-900 p-0.5 sm:h-40 sm:w-40">
                {/* biome-ignore lint/performance/noImgElement: user avatar */}
                <img
                  src={getAvatarUrl(profile.profilePictureUrl, profile.fullName)}
                  alt={profile.fullName}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="min-w-0 pb-6">
                {jobTitle && (
                  <p className="mb-1 font-mono text-[11px] font-bold uppercase tracking-[0.24em] text-white/50">
                    {jobTitle}
                  </p>
                )}
                <h1 className="font-sans text-5xl font-black leading-none tracking-tight text-white sm:text-7xl">
                  {profile.fullName}
                </h1>
                {profile.discordId ? (
                  <a
                    href={`https://discord.com/users/${profile.discordId}`}
                    target="_blank"
                    rel="noreferrer"
                    title={`Message ${firstName} on Discord`}
                    className="mt-1.5 inline-block font-mono text-sm text-zinc-400 transition-colors hover:text-white hover:underline"
                  >
                    @{profile.username}
                  </a>
                ) : (
                  <p className="mt-1.5 font-mono text-sm text-zinc-400">@{profile.username}</p>
                )}
                <div className="mt-4 flex flex-wrap items-center gap-4 font-mono text-[11px] text-zinc-400">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-zinc-500" />
                    {displayLocation ?? "Remote"}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5 text-zinc-500" />
                    Joined {formatJoinedAt(profile.joinedAt)}
                  </span>
                  {socialLinks.slice(0, 3).map((link) => {
                    const Icon = link.icon;
                    return (
                      <a
                        key={`${link.label}-${link.href}`}
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        title={link.label}
                        className="inline-flex items-center gap-1.5 text-zinc-400 transition-colors hover:text-white"
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Stats bar */}
            <div className="mt-0 flex items-stretch border-t border-white/10">
              <div className="flex items-center gap-2 border-r border-white/10 px-5 py-4 first:pl-0">
                <span className="font-sans text-xl font-black text-white">{skills.length}</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                  Skills
                </span>
              </div>
              <div className="flex items-center gap-2 border-r border-white/10 px-5 py-4">
                <span className="font-sans text-xl font-black text-white">{roleList.length}</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                  {roleList.length === 1 ? "Role" : "Roles"}
                </span>
              </div>
              {socialLinks.length > 0 && (
                <div className="flex items-center gap-2 px-5 py-4">
                  <span className="font-sans text-xl font-black text-white">
                    {socialLinks.length}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                    Links
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* â”€â”€ Main body â”€â”€ */}
        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 pb-16 sm:px-6 lg:grid-cols-[1fr_320px]">
          {/* Left â€” bio + skills */}
          <div className="space-y-6">
            {/* Bio */}
            <div className="border border-zinc-200 bg-white">
              <div className="border-b border-zinc-100 px-6 py-4">
                <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-zinc-400">
                  Bio
                </h2>
              </div>
              <div className="p-6">
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

            {/* Career Progression */}
            <div className="border border-zinc-200 bg-white">
              <div className="border-b border-zinc-100 px-6 py-4 flex items-center justify-between">
                <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-zinc-400">
                  Career Progression
                </h2>
              </div>
              <div className="p-6">
                {careerProgressions.length > 0 ? (
                  <div className={`relative space-y-0 ${careerProgressions.length > 1 ? "before:absolute before:left-[4px] before:top-3 before:h-[calc(100%-1.5rem)] before:w-px before:bg-zinc-200" : ""}`}>
                    {careerProgressions.map((item, index) => {
                      const isLast = index === careerProgressions.length - 1;
                      const isCurrent = !item.endDate;
                      const totalMonths = (() => {
                        const start = new Date(item.startDate);
                        const end = item.endDate ? new Date(item.endDate) : new Date();
                        return (
                          (end.getFullYear() - start.getFullYear()) * 12 +
                          (end.getMonth() - start.getMonth())
                        );
                      })();
                      const years = Math.floor(totalMonths / 12);
                      const months = totalMonths % 12;
                      const durationParts: string[] = [];
                      if (years > 0) durationParts.push(`${years} yr${years > 1 ? "s" : ""}`);
                      if (months > 0) durationParts.push(`${months} mo${months > 1 ? "s" : ""}`);
                      const duration = totalMonths < 1 ? "< 1 mo" : durationParts.join(" ");
                      const fmt = (d: string) =>
                        new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(
                          new Date(d)
                        );

                      return (
                        <article key={item.id} className={`relative pl-6 ${isLast ? "" : "pb-7"}`}>
                          {/* Timeline dot */}
                          <span
                            className={`absolute left-0 top-[6px] h-[10px] w-[10px] border-2 ${isCurrent ? "border-zinc-950 bg-zinc-950" : "border-zinc-300 bg-white"}`}
                          />

                          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <h3 className="font-sans text-base font-black uppercase tracking-tight text-zinc-950 leading-snug">
                                {item.title}
                              </h3>
                              {item.organization && (
                                <p className="mt-0.5 font-mono text-xs font-bold text-zinc-600">
                                  {item.organization}
                                </p>
                              )}
                              <p className="mt-1 font-mono text-[11px] text-zinc-400">
                                {fmt(item.startDate)} <span className="text-zinc-300">–</span>{" "}
                                {isCurrent ? (
                                  <span className="font-bold text-zinc-950">Present</span>
                                ) : (
                                  fmt(item.endDate as string)
                                )}
                                <span className="mx-1.5 text-zinc-200">·</span>
                                {duration}
                              </p>
                            </div>
                          </div>

                          {item.description && (
                            <p className="mt-2.5 whitespace-pre-wrap font-sans text-sm leading-6 text-zinc-600">
                              {item.description}
                            </p>
                          )}
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <p className="font-mono text-sm text-zinc-400 italic">
                    {firstName} hasn't added any progression entries yet.
                  </p>
                )}
              </div>
            </div>
            {/* Skills */}
            <div className="border border-zinc-200 bg-white">
              <div className="border-b border-zinc-100 px-6 py-4 flex items-center justify-between">
                <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-zinc-400">
                  Skills
                </h2>
                {skills.length > 0 && (
                  <span className="font-mono text-[10px] text-zinc-400">{skills.length} total</span>
                )}
              </div>
              <div className="p-6">
                {skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <span
                        key={skill}
                        className="border border-zinc-200 bg-white px-3 py-1.5 font-mono text-[10px] font-black uppercase tracking-[0.16em] text-zinc-700 transition-colors hover:border-zinc-900 hover:bg-zinc-900 hover:text-white"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="font-mono text-sm text-zinc-400 italic">No skills added yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <aside className="space-y-4">
            {/* Edit / action buttons */}
            {showOwnProfileEdit && (
              <Link
                href="/settings/profile"
                className="flex h-11 w-full items-center justify-center gap-2 bg-zinc-900 font-mono text-[11px] font-black uppercase tracking-[0.16em] text-white transition-colors hover:bg-zinc-800"
              >
                Edit Your Profile
                <Link2 className="h-4 w-4" />
              </Link>
            )}
            {showAdminEdit && (
              <Link
                href={`/admin/members/${profile.username}/edit`}
                className="flex h-11 w-full items-center justify-center gap-2 border border-zinc-900 font-mono text-[11px] font-black uppercase tracking-[0.16em] text-zinc-950 transition-colors hover:bg-zinc-900 hover:text-white"
              >
                <Pencil className="h-4 w-4" />
                Edit Member
              </Link>
            )}

            {/* Discipline */}
            {discipline && (
              <div className="border border-zinc-200 bg-white">
                <div className="border-b border-zinc-100 px-5 py-3">
                  <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-400">
                    Discipline
                  </h2>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-3 border border-zinc-900 bg-zinc-900 px-4 py-3">
                    <discipline.icon className="h-4 w-4 shrink-0 text-white/70" />
                    <span className="font-mono text-[11px] font-black uppercase tracking-[0.16em] text-white">
                      {discipline.label}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Community roles */}
            <div className="border border-zinc-200 bg-white">
              <div className="border-b border-zinc-100 px-5 py-3">
                <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-400">
                  Community Roles
                </h2>
              </div>
              <div className="divide-y divide-zinc-100">
                {roleList.map((role, i) => (
                  <div key={role} className="flex items-center justify-between px-5 py-3">
                    <span className="font-mono text-[11px] font-black uppercase tracking-[0.16em] text-zinc-800">
                      {role}
                    </span>
                    {i === 0 && (
                      <span className="bg-zinc-900 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-white">
                        Primary
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Social links */}
            {socialLinks.length > 0 && (
              <div className="border border-zinc-200 bg-white">
                <div className="border-b border-zinc-100 px-5 py-3">
                  <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-400">
                    Find {firstName} online
                  </h2>
                </div>
                <div className="divide-y divide-zinc-100">
                  {socialLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <a
                        key={`${link.label}-${link.href}`}
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="flex h-11 items-center gap-3 px-5 font-mono text-[11px] font-bold text-zinc-600 transition-colors hover:bg-zinc-900 hover:text-white"
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {link.label}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </aside>
        </section>

        {/* â”€â”€ Contributions â”€â”€ */}
        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
          <ContributionGraph username={profile.username} joinedAt={profile.joinedAt} />
        </section>
      </main>

      <PublicProfileFooter />
    </div>
  );
}

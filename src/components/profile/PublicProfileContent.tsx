"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Award,
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
  Users,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ComponentType } from "react";
import { FaDiscord, FaGithub, FaLinkedin, FaXTwitter } from "react-icons/fa6";
import { PublicProfileBadges } from "@/components/badges/PublicProfileBadges";
import { ContributionGraph } from "@/components/contributions/ContributionGraph";
import { PublicProfileFooter } from "@/components/profile/PublicProfileFooter";
import { PublicProfileHeader } from "@/components/profile/PublicProfileHeader";
import { formatJoinedAt } from "@/components/profile/utils";
import { useMemberBadges } from "@/hooks/useBadges";
import { usePermission } from "@/hooks/usePermission";
import { LINK_PLATFORMS } from "@/lib/social-platforms";
import { getAvatarUrl, getCoverUrl, sanitizeHandle } from "@/lib/utils";
import { type CommunityMember, UserService } from "@/services/user.service";
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

function SectionHeader({
  icon: Icon,
  title,
  meta,
  size = "default",
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  meta?: string;
  size?: "default" | "compact";
}) {
  const isCompact = size === "compact";
  return (
    <div
      className={`flex items-center justify-between gap-3 border-b border-zinc-100 ${isCompact ? "px-5 py-3" : "px-6 py-4"}`}
    >
      <div className="flex items-center gap-2.5">
        {isCompact ? (
          <Icon className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
        ) : (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-zinc-950 text-white">
            <Icon className="h-3.5 w-3.5" />
          </div>
        )}
        <h2 className={`font-sans font-bold text-zinc-900 ${isCompact ? "text-base" : "text-lg"}`}>
          {title}
        </h2>
      </div>
      {meta && <span className="font-mono text-[10px] text-zinc-400">{meta}</span>}
    </div>
  );
}

export function PublicProfileContent({ initialProfile }: { initialProfile: CommunityMember }) {
  const username = initialProfile.username;

  const currentUser = useUserStore((s) => s.profile);
  const canEditMembers = usePermission("users.edit");
  const canEditOwnProfile = usePermission("profile.edit");

  const { data: profile, isError } = useQuery({
    queryKey: ["member-public-profile", username],
    queryFn: () => UserService.getMemberByUsername(username),
    initialData: initialProfile,
  });

  if (!profile || isError) {
    notFound();
  }

  // The generated dicebear pattern (no coverImageUrl) is flat, low-contrast
  // vector art — safe to show at high opacity. A real uploaded photo can be
  // arbitrarily bright/busy, so it stays closer to the original muted look
  // to keep the name/badges legible over it.
  const hasCustomCover = Boolean(profile.coverImageUrl?.trim());
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

  // Badge count for hero stats bar
  const { data: badgeAwards = [] } = useMemberBadges(username);
  const badgeCount = badgeAwards.filter((a) => !a.isRevoked).length;

  const socialLinks: SocialLink[] = [];
  if (profile.discordId) {
    socialLinks.push({
      label: profile.discordUsername ? `@${profile.discordUsername}` : "Discord",
      href: `https://discord.com/users/${profile.discordId}`,
      icon: FaDiscord,
    });
  }
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
          <div className="absolute inset-0 h-96">
            {/* biome-ignore lint/performance/noImgElement: user cover image */}
            <img
              src={getCoverUrl(profile.coverImageUrl, profile.fullName)}
              alt=""
              className={`h-full w-full object-cover ${hasCustomCover ? "opacity-45" : "opacity-80"}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-zinc-950/10" />
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/40 via-transparent to-transparent" />
          </div>

          {/* Hero content */}
          <div className="relative mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-2 px-4 pb-0 pt-32 duration-500 sm:px-6">
            {/* Badges */}
            <div className="mb-5 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 border border-white/15 bg-white/10 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur-sm transition-colors hover:bg-white/15">
                <Sparkles className="h-3 w-3 text-white/70" />
                {primaryRole}
              </span>
              {discipline && (
                <span className="inline-flex items-center gap-1.5 border border-white/15 bg-white/10 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur-sm transition-colors hover:bg-white/15">
                  <discipline.icon className="h-3 w-3 text-white/70" />
                  {discipline.label}
                </span>
              )}
            </div>

            {/* Avatar + name block */}
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="h-32 w-32 shrink-0 border-[3px] border-zinc-800 bg-zinc-900 p-0.5 ring-2 ring-white/25 sm:h-40 sm:w-40">
                {/* biome-ignore lint/performance/noImgElement: user avatar */}
                <img
                  src={getAvatarUrl(profile.profilePictureUrl, profile.fullName)}
                  alt={profile.fullName}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="min-w-0">
                {jobTitle && (
                  <p className="mb-1 font-mono text-sm font-medium text-white/50">{jobTitle}</p>
                )}
                <h1 className="font-sans text-5xl font-black leading-none tracking-tight text-white sm:text-7xl">
                  {profile.fullName}
                </h1>
                <p className="mt-1.5 font-mono text-sm text-zinc-400">@{profile.username}</p>
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
            <div className="mt-0 flex flex-wrap items-stretch border-t border-white/10">
              <div className="flex items-center gap-2.5 border-r border-white/10 px-5 py-4 transition-colors first:pl-0 hover:bg-white/[0.03]">
                <Code2 className="h-4 w-4 text-zinc-600" />
                <span className="font-sans text-xl font-black text-white">{skills.length}</span>
                <span className="font-mono text-xs font-medium text-zinc-500">Skills</span>
              </div>
              <div className="flex items-center gap-2.5 border-r border-white/10 px-5 py-4 transition-colors hover:bg-white/[0.03]">
                <Users className="h-4 w-4 text-zinc-600" />
                <span className="font-sans text-xl font-black text-white">{roleList.length}</span>
                <span className="font-mono text-xs font-medium text-zinc-500">
                  {roleList.length === 1 ? "Role" : "Roles"}
                </span>
              </div>
              {socialLinks.length > 0 && (
                <div className="flex items-center gap-2.5 border-r border-white/10 px-5 py-4 transition-colors hover:bg-white/[0.03]">
                  <Link2 className="h-4 w-4 text-zinc-600" />
                  <span className="font-sans text-xl font-black text-white">
                    {socialLinks.length}
                  </span>
                  <span className="font-mono text-xs font-medium text-zinc-500">Links</span>
                </div>
              )}
              {badgeCount > 0 && (
                <div className="flex items-center gap-2.5 px-5 py-4 transition-colors hover:bg-white/[0.03]">
                  <Award className="h-4 w-4 text-zinc-600" />
                  <span className="font-sans text-xl font-black text-white">{badgeCount}</span>
                  <span className="font-mono text-xs font-medium text-zinc-500">
                    {badgeCount === 1 ? "Badge" : "Badges"}
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
              <SectionHeader icon={FileText} title="Bio" />
              <div className="p-6">
                {profile.bio ? (
                  <p className="whitespace-pre-wrap font-sans text-sm leading-7 text-zinc-600">
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
              <SectionHeader icon={CalendarDays} title="Career Progression" />
              <div className="p-6">
                {careerProgressions.length > 0 ? (
                  <div className="relative space-y-0">
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
                            className={`absolute left-0 top-[6px] h-[10px] w-[10px] border-2 ${isCurrent ? "border-zinc-950 bg-zinc-950 shadow-[0_0_0_3px_var(--grey-100)]" : "border-zinc-300 bg-white"}`}
                          />
                          {/* Connector line — only between entries, never below the last */}
                          {!isLast && (
                            <span className="absolute left-[4px] top-[16px] bottom-0 w-px bg-zinc-200" />
                          )}

                          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <h3 className="font-sans text-base font-bold text-zinc-950 leading-snug">
                                {item.title}
                              </h3>
                              <p className="mt-0.5 font-mono text-xs font-bold text-zinc-600">
                                {item.teamName ?? "Codetopia Community"}
                              </p>
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
                            <p className="mt-2.5 whitespace-pre-wrap font-mono text-xs leading-5 text-zinc-500">
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
              <SectionHeader
                icon={Code2}
                title="Skills"
                meta={skills.length > 0 ? `${skills.length} total` : undefined}
              />
              <div className="p-6">
                {skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <span
                        key={skill}
                        className="border border-zinc-200 bg-white px-3 py-1.5 font-mono text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-900 hover:bg-zinc-900 hover:text-white"
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
                className="flex h-11 w-full items-center justify-center gap-2 bg-zinc-900 font-mono text-sm font-medium text-white shadow-[4px_4px_0_0_var(--grey-300)] transition-all hover:-translate-x-px hover:-translate-y-px hover:bg-zinc-800 hover:shadow-[5px_5px_0_0_var(--grey-300)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_0_var(--grey-300)]"
              >
                Edit Your Profile
                <Link2 className="h-4 w-4" />
              </Link>
            )}
            {showAdminEdit && (
              <Link
                href={`/admin/members/${profile.username}/edit`}
                className="flex h-11 w-full items-center justify-center gap-2 border border-zinc-900 font-mono text-sm font-medium text-zinc-950 shadow-[4px_4px_0_0_var(--grey-200)] transition-all hover:-translate-x-px hover:-translate-y-px hover:bg-zinc-900 hover:text-white hover:shadow-[5px_5px_0_0_var(--grey-200)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_0_var(--grey-200)]"
              >
                <Pencil className="h-4 w-4" />
                Edit Member
              </Link>
            )}

            {/* Discipline */}
            {discipline && (
              <div className="border border-zinc-200 bg-white">
                <SectionHeader icon={discipline.icon} title="Discipline" size="compact" />
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
              <SectionHeader icon={Users} title="Community Roles" size="compact" />
              <div className="divide-y divide-zinc-100">
                {roleList.map((role, i) => (
                  <div
                    key={role}
                    className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-zinc-50"
                  >
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
                <SectionHeader icon={Link2} title={`Find ${firstName} online`} size="compact" />
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
        <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6">
          <ContributionGraph username={profile.username} joinedAt={profile.joinedAt} isPublicView />
        </section>

        {badgeCount > 0 && (
          <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
            <PublicProfileBadges username={profile.username} />
          </section>
        )}
      </main>

      <PublicProfileFooter />
    </div>
  );
}

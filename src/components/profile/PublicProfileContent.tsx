"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  Globe,
  GraduationCap,
  Link2,
  MapPin,
  MessageCircle,
  Pencil,
  Sparkles,
  UserRoundCheck,
} from "lucide-react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { FaGithub, FaLinkedin, FaXTwitter } from "react-icons/fa6";
import { ProfileSkeleton } from "@/components/profile/ProfileSkeleton";
import { PublicProfileFooter } from "@/components/profile/PublicProfileFooter";
import { PublicProfileHeader } from "@/components/profile/PublicProfileHeader";
import { formatJoinedAt, formatRoleLabel } from "@/components/profile/utils";
import { usePermission } from "@/hooks/usePermission";
import { getAvatarUrl, getCoverUrl } from "@/lib/utils";
import { UserService } from "@/services/user.service";
import { useUserStore } from "@/store/user.store";
import type { SocialLink } from "@/types/profile";
import { normalizeUrl } from "@/utils/url";

export function PublicProfileContent() {
  const { username: paramUsername } = useParams<{ username: string }>();
  let username = paramUsername ? decodeURIComponent(paramUsername) : "";
  username = username.startsWith("@") ? username.substring(1) : username;
  const currentUser = useUserStore((s) => s.profile);
  const canEditMembers = usePermission("members.edit");
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

  const primaryRole = profile.primaryRole
    ? formatRoleLabel(profile.primaryRole)
    : profile.communityRoles?.[0]
      ? formatRoleLabel(profile.communityRoles[0])
      : "Member";
  const roleList =
    profile.communityRoles && profile.communityRoles.length > 0
      ? profile.communityRoles.map(formatRoleLabel)
      : ["Member"];
  const displayRole = profile.currentRole || "Community Member";
  const displayLocation = profile.location || "Remote";
  const displayExperience = profile.experienceLevel || "Not specified";
  const skills = profile.skills ?? [];
  const firstName = profile.fullName.split(" ")[0] || "this member";
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
      label: "X",
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

  return (
    <div className="min-h-screen flex flex-col bg-white text-zinc-950">
      <PublicProfileHeader />

      <main className="flex-grow">
        <section className="relative min-h-[28rem] bg-zinc-950 pt-16 text-white">
          <div className="absolute inset-0">
            {/* biome-ignore lint/performance/noImgElement: user-provided image */}
            <img
              src={getCoverUrl(profile.coverImageUrl, profile.fullName)}
              alt=""
              className="h-full w-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,#00000066_0%,#00000033_32%,#000000e6_92%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,#000000e6_0%,#00000099_42%,#00000026_100%)]" />
          </div>

          <div className="relative mx-auto flex min-h-[calc(28rem-4rem)] max-w-7xl items-end px-4 py-10 sm:px-6 lg:py-14">
            <div className="grid w-full gap-8 lg:grid-cols-[1fr_20rem] lg:items-end">
              <div>
                <div className="mb-7 flex flex-wrap items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-300">
                  <span className="inline-flex items-center gap-2 border border-white/15 bg-white/10 px-3 py-1.5">
                    <Sparkles className="h-3 w-3 text-amber-300" />
                    Personal profile
                  </span>
                  <span className="inline-flex items-center gap-2 border border-white/15 bg-white/10 px-3 py-1.5">
                    <UserRoundCheck className="h-3 w-3 text-emerald-300" />
                    {primaryRole}
                  </span>
                </div>

                <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
                  <div className="h-28 w-28 shrink-0 border border-white/30 bg-white p-1 shadow-2xl sm:h-36 sm:w-36">
                    {/* biome-ignore lint/performance/noImgElement: user-provided image */}
                    <img
                      src={getAvatarUrl(profile.profilePictureUrl, profile.fullName)}
                      alt={profile.fullName}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="font-mono text-[11px] font-bold uppercase tracking-[0.28em] text-emerald-300">
                      {displayRole}
                    </p>
                    <h1 className="mt-2 max-w-4xl font-sans text-4xl font-black leading-[0.95] tracking-normal text-white sm:text-6xl">
                      {profile.fullName}
                    </h1>
                    <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-zinc-200">
                      <span className="inline-flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-sky-300" />
                        {displayLocation}
                      </span>
                      <span className="hidden h-1 w-1 bg-zinc-500 sm:block" />
                      <span className="inline-flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-amber-300" />
                        Joined {formatJoinedAt(profile.joinedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <aside className="border border-white/15 bg-black/35 p-5 backdrop-blur-md">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-400">
                  Connect
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
                        className="inline-flex h-11 w-11 items-center justify-center border border-white/20 bg-white/10 text-white transition-colors hover:bg-white hover:text-zinc-950"
                      >
                        <Icon className="h-4 w-4" />
                      </a>
                    );
                  })}
                  {socialLinks.length === 0 ? (
                    <p className="text-sm leading-6 text-zinc-400">
                      No public links have been added yet.
                    </p>
                  ) : null}
                </div>

                <div className="mt-6 border-t border-white/10 pt-5">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-400">
                    Community role
                  </p>
                  <p className="mt-2 font-sans text-2xl font-black text-white">{primaryRole}</p>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:px-6 md:grid-cols-3">
          <div className="border border-zinc-200 bg-white p-5">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">
              Role
            </p>
            <p className="mt-3 flex items-center gap-2 font-sans text-lg font-black text-zinc-950">
              <BriefcaseBusiness className="h-4 w-4 text-zinc-500" />
              {displayRole}
            </p>
          </div>
          <div className="border border-zinc-200 bg-white p-5">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">
              Experience
            </p>
            <p className="mt-3 flex items-center gap-2 font-sans text-lg font-black text-zinc-950">
              <GraduationCap className="h-4 w-4 text-zinc-500" />
              {displayExperience}
            </p>
          </div>
          <div className="border border-zinc-200 bg-white p-5">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">
              Location
            </p>
            <p className="mt-3 flex items-center gap-2 font-sans text-lg font-black text-zinc-950">
              <MapPin className="h-4 w-4 text-zinc-500" />
              {displayLocation}
            </p>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-20 pt-2 sm:px-6 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="space-y-6">
            <section className="border border-zinc-200 bg-white p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-sans text-2xl font-black text-zinc-950">About</h2>
                  <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">
                    Member introduction
                  </p>
                </div>
              </div>
              <p className="mt-6 whitespace-pre-wrap text-sm leading-7 text-zinc-700 sm:text-base">
                {profile.bio || `${firstName} has not added a profile bio yet.`}
              </p>
            </section>

            <section className="border border-zinc-200 bg-white p-6 sm:p-8">
              <div>
                <h2 className="font-sans text-2xl font-black text-zinc-950">Skills</h2>
                <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">
                  Tools and focus areas
                </p>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {skills.length > 0 ? (
                  skills.map((skill) => (
                    <span
                      key={skill}
                      className="border border-zinc-200 bg-zinc-50 px-3 py-1.5 font-mono text-[10px] font-black uppercase tracking-[0.16em] text-zinc-800"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-sm leading-6 text-zinc-500">
                    No skills have been added to this profile yet.
                  </p>
                )}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="border border-zinc-200 bg-white p-6">
              <h2 className="font-sans text-xl font-black text-zinc-950">Roles</h2>
              <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">
                Community access
              </p>
              <div className="mt-5 space-y-2">
                {roleList.map((role) => (
                  <div
                    key={role}
                    className="flex items-center justify-between border border-zinc-200 bg-zinc-50 px-3 py-2.5"
                  >
                    <span className="font-mono text-[11px] font-black uppercase tracking-[0.16em] text-zinc-700">
                      {role}
                    </span>
                    <span className="h-1.5 w-1.5 bg-zinc-900" />
                  </div>
                ))}
              </div>
            </section>

            <section className="border border-zinc-200 bg-white p-6">
              <h2 className="font-sans text-xl font-black text-zinc-950">Contact</h2>
              <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">
                Public links
              </p>
              <div className="mt-5 space-y-2">
                {profile.discordUsername ? (
                  <div className="flex items-center gap-3 border border-zinc-200 px-3 py-2.5 text-sm text-zinc-700">
                    <MessageCircle className="h-4 w-4 text-zinc-500" />
                    {profile.discordUsername}
                  </div>
                ) : null}
                {socialLinks.length > 0 ? (
                  socialLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <a
                        key={link.label}
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between gap-3 border border-zinc-200 px-3 py-2.5 text-sm text-zinc-700 transition-colors hover:border-zinc-900 hover:text-zinc-950"
                      >
                        <span className="inline-flex items-center gap-3">
                          <Icon className="h-4 w-4 text-zinc-500" />
                          {link.label}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </a>
                    );
                  })
                ) : !profile.discordUsername ? (
                  <p className="text-sm leading-6 text-zinc-500">
                    No public contact links have been added.
                  </p>
                ) : null}
              </div>
            </section>

            {showOwnProfileEdit ? (
              <Link
                href="/settings/profile"
                className="inline-flex h-11 w-full items-center justify-center gap-2 bg-zinc-900 px-5 font-mono text-[11px] font-black uppercase tracking-[0.16em] text-white transition-colors hover:bg-zinc-800"
              >
                Edit Your Profile
                <Link2 className="h-4 w-4" />
              </Link>
            ) : null}

            {showAdminEdit ? (
              <Link
                href={`/admin/members/${profile.id}/edit`}
                className="inline-flex h-11 w-full items-center justify-center gap-2 border border-zinc-900 px-5 font-mono text-[11px] font-black uppercase tracking-[0.16em] text-zinc-950 transition-colors hover:bg-zinc-900 hover:text-white"
              >
                <Pencil className="h-4 w-4" />
                Edit Member
              </Link>
            ) : null}
          </aside>
        </section>
      </main>

      <PublicProfileFooter />
    </div>
  );
}

"use client";

import { useQuery } from "@tanstack/react-query";
import type { DriveStep } from "driver.js";
import {
  ArrowRight,
  Copy,
  MapPin,
  Pencil,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { ContributionGraph } from "@/components/contributions/ContributionGraph";
import { ProfileCompletionCarousel } from "@/components/dashboard/ProfileCompletionCarousel";
import { DASHBOARD_MODULES, DASHBOARD_NEXT_ACTIONS } from "@/data/dashboard";
import { useWalkthrough } from "@/hooks/useWalkthrough";
import { getAvatarUrl, getCoverUrl } from "@/lib/utils";
import { SessionService } from "@/services/auth.service";
import { useUserStore } from "@/store/user.store";
import {
  buildStrengthItems,
  calcStrength,
  formatDateTime,
  strengthBarColor,
  strengthLabel,
} from "@/utils/dashboard";

export function DashboardContent() {
  const profile = useUserStore((s) => s.profile);

  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ["sessions"],
    queryFn: () => SessionService.getSessions(),
  });

  const strengthItems = profile ? buildStrengthItems(profile) : [];
  const profileStrength = profile ? calcStrength(strengthItems) : 0;
  const incompleteItems = profile ? strengthItems.filter((i) => !i.fulfilled) : [];
  const walkthroughSteps: DriveStep[] = [
    {
      popover: {
        title: "Welcome to your Dashboard",
        description:
          "This is your central hub for Codetopia Community. Let's take a quick look around.",
      },
    },
    {
      element: "#dashboard-profile-header",
      popover: {
        title: "Your Profile",
        description:
          "Here you can see your current community standing, roles, and how strong your profile is. Click 'Edit Profile' to add your skills and bio.",
        side: "bottom",
        align: "start",
      },
    },
  ];

  if (incompleteItems.length > 0) {
    walkthroughSteps.push({
      element: "#dashboard-profile-completion",
      popover: {
        title: "Profile Completion",
        description:
          "Your profile is missing a few details. You can easily complete them by following these quick suggestions right here!",
        side: "top",
        align: "center",
      },
    });
  }

  walkthroughSteps.push({
    element: "#dashboard-quick-actions",
    popover: {
      title: "Quick Actions",
      description:
        "Use these shortcuts to tune your public profile, review security, or browse the community directory.",
      side: "bottom",
      align: "center",
    },
  });

  walkthroughSteps.push({
    element: "#dashboard-security-widget",
    popover: {
      title: "Account Security",
      description:
        "This widget tracks your most recent active session. Keep an eye on the IP address and device to ensure there's no unauthorized access to your account.",
      side: "left",
      align: "start",
    },
  });

  useWalkthrough({
    tourId: "dashboard_welcome_tour_v3",
    steps: walkthroughSteps,
    enabled: Boolean(profile),
  });

  if (!profile) return null;

  const lastSession = sessions && sessions.length > 0 ? sessions[0] : null;
  const publicProfileHref = `/@${profile.username}`;
  const displayLocation = profile.location;
  const skills = profile.skills ?? [];
  const visibleSkills = skills.slice(0, 8);
  const { text: strengthText, color: strengthColor } = strengthLabel(profileStrength);
  const barColor = strengthBarColor(profileStrength);

  return (
    <div className="w-full max-w-7xl mx-auto pb-20 pt-2 space-y-6">
      <section
        id="dashboard-profile-header"
        className="overflow-hidden border border-zinc-200 bg-white"
      >
        <div className="relative h-[11rem] sm:h-[13rem] bg-zinc-950 text-white overflow-hidden">
          {/* biome-ignore lint/performance/noImgElement: user-provided image */}
          <img
            src={getCoverUrl(profile.coverImageUrl, profile.fullName)}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

          <div className="absolute top-5 left-5 sm:left-7 lg:left-8 flex flex-wrap items-center gap-2 font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-zinc-300">
            <span className="inline-flex items-center gap-1.5 border border-white/15 bg-black/40 px-2.5 py-1 backdrop-blur-sm">
              <Sparkles className="h-3 w-3 text-amber-300" />
              Member dashboard
            </span>
            {displayLocation && (
              <span className="inline-flex items-center gap-1.5 border border-white/15 bg-black/40 px-2.5 py-1 backdrop-blur-sm">
                <MapPin className="h-3 w-3 text-sky-300" />
                {displayLocation}
              </span>
            )}
          </div>
        </div>

        <div className="relative p-5 pt-0 sm:p-7 sm:pt-0 lg:p-8 lg:pt-0">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="relative -mt-14 sm:-mt-20 h-28 w-28 shrink-0 border-4 border-white bg-white p-0.5 overflow-hidden shadow-sm sm:h-36 sm:w-36">
                  {/* biome-ignore lint/performance/noImgElement: user-provided image */}
                  <img
                    src={getAvatarUrl(profile.profilePictureUrl, profile.fullName)}
                    alt={profile.fullName}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="min-w-0 pb-1">
                  <h1 className="font-sans text-3xl font-black leading-[1.1] tracking-tight text-zinc-950 sm:text-4xl">
                    {profile.fullName}
                  </h1>

                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {profile.roles && profile.roles.filter((r) => r.trim() !== "").length > 0 ? (
                      profile.roles
                        .filter((r) => r.trim() !== "")
                        .map((role) => (
                          <span
                            key={role}
                            className="inline-flex items-center border border-zinc-950 bg-zinc-950 px-2.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-white"
                          >
                            {role}
                          </span>
                        ))
                    ) : (
                      <span className="inline-flex items-center border border-zinc-950 bg-zinc-950 px-2.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-white">
                        Member
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <p className="mt-5 max-w-2xl text-sm leading-6 text-zinc-600 sm:text-base">
                {profile.bio ||
                  "Add a short profile summary so mentors, collaborators, and community members know what you are building toward."}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={publicProfileHref}
                  className="inline-flex h-9 items-center gap-2 border border-zinc-900 bg-zinc-950 px-4 font-mono text-[10px] font-black uppercase tracking-[0.16em] text-white transition-colors hover:bg-zinc-800"
                >
                  View Public Profile
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/settings/profile"
                  className="inline-flex h-9 items-center gap-2 border border-zinc-200 bg-white px-4 font-mono text-[10px] font-black uppercase tracking-[0.16em] text-zinc-800 transition-colors hover:border-zinc-950 hover:text-zinc-950 hover:bg-zinc-50"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit Profile
                </Link>
                <div className="inline-flex h-9 items-center gap-2 border border-zinc-200 bg-zinc-50 pl-2 pr-1">
                  <span className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-zinc-500">
                    ID
                  </span>
                  <span className="max-w-[9.5rem] truncate font-mono text-[11px] text-zinc-700">
                    {profile.communityId}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(profile.communityId);
                      toast.success("Community ID copied to clipboard!");
                    }}
                    title="Copy community ID"
                    className="shrink-0 flex h-7 w-8 items-center justify-center border border-zinc-200 bg-white text-zinc-500 transition-colors hover:border-zinc-900 hover:text-zinc-900"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>

            <aside className="w-full shrink-0 border border-zinc-900 bg-zinc-950 p-5 lg:w-72 lg:mt-6 flex flex-col justify-between gap-6">
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-400">
                      Profile strength
                    </p>
                    <p className="mt-2 font-sans text-3xl font-black text-white">
                      {profileStrength}%
                    </p>
                    <p
                      className={`mt-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] ${strengthColor.replace("-600", "-400")}`}
                    >
                      {strengthText}
                    </p>
                  </div>
                  <UserRoundCheck className="h-5 w-5 text-emerald-400 shrink-0" />
                </div>
                <div className="mt-4 h-1.5 bg-zinc-800">
                  <div className={`h-full ${barColor}`} style={{ width: `${profileStrength}%` }} />
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {incompleteItems.length > 0 && (
        <ProfileCompletionCarousel
          items={incompleteItems}
          profileStrength={profileStrength}
          barColor={barColor}
        />
      )}

      <section id="dashboard-quick-actions" className="grid gap-4 lg:grid-cols-4">
        {DASHBOARD_NEXT_ACTIONS.map((action) => (
          <Link
            key={action.title}
            id={action.id}
            href={action.href}
            className="group border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-900"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-9 w-9 items-center justify-center border border-zinc-200 bg-zinc-50 text-zinc-600">
                <action.icon className="h-4 w-4" />
              </div>
              <ArrowRight className="h-4 w-4 text-zinc-300 transition-transform group-hover:translate-x-1 group-hover:text-zinc-950" />
            </div>
            <h2 className="mt-5 font-sans text-sm font-black uppercase tracking-wider text-zinc-950">
              {action.title}
            </h2>
            <p className="mt-2 font-mono text-xs leading-5 text-zinc-500">{action.description}</p>
          </Link>
        ))}
      </section>

      <ContributionGraph username={profile.username} joinedAt={profile.joinedAt ?? undefined} />

      <section className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="border border-zinc-200 bg-white p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="font-sans text-xl font-black text-zinc-950">Portal Modules</h2>
              <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">
                Core workspaces
              </p>
            </div>
            <Link
              href="/community"
              className="inline-flex h-9 items-center gap-2 border border-zinc-200 px-3 font-mono text-[10px] font-black uppercase tracking-[0.16em] text-zinc-700 transition-colors hover:border-zinc-900 hover:text-zinc-950"
            >
              Explore
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            {DASHBOARD_MODULES.map((module) => (
              <Link
                key={module.title}
                href={module.href}
                className="group flex items-start gap-5 border border-zinc-200 bg-white p-5 transition-colors hover:border-zinc-900"
              >
                <div className={`shrink-0 border p-3 ${module.accent}`}>
                  <module.icon className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                        {module.subtitle}
                      </p>
                      <h3 className="mt-2 font-sans text-lg font-black text-zinc-950">
                        {module.title}
                      </h3>
                    </div>
                    <span className="inline-flex w-fit shrink-0 border border-zinc-200 px-2.5 py-1 font-mono text-[10px] font-black uppercase tracking-[0.16em] text-zinc-600">
                      {module.status}
                    </span>
                  </div>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
                    {module.description}
                  </p>
                </div>

                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-zinc-300 transition-transform group-hover:translate-x-1 group-hover:text-zinc-950" />
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <section id="dashboard-security-widget" className="border border-zinc-200 bg-white p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-sans text-xl font-black text-zinc-950">Security</h2>
                <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">
                  Latest session
                </p>
              </div>
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
            </div>

            {sessionsLoading ? (
              <p className="mt-6 text-sm text-zinc-500">Fetching session details...</p>
            ) : lastSession ? (
              <div className="mt-6 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4 border-b border-zinc-100 pb-3">
                  <span className="text-zinc-500">Device</span>
                  <span className="truncate font-medium text-zinc-950">
                    {lastSession.deviceName}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 border-b border-zinc-100 pb-3">
                  <span className="text-zinc-500">IP address</span>
                  <span className="font-medium text-zinc-950">{lastSession.ipAddress}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-zinc-500">Created</span>
                  <span className="text-right font-medium text-zinc-950">
                    {formatDateTime(lastSession.createdAt)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="mt-6 text-sm text-zinc-500">No sessions found.</p>
            )}
          </section>

          <section className="border border-zinc-200 bg-white p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-sans text-xl font-black text-zinc-950">Skills</h2>
                <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">
                  Public profile tags
                </p>
              </div>
              <Link
                href="/settings/profile"
                className="text-zinc-400 transition-colors hover:text-zinc-950"
                title="Edit skills"
              >
                <Pencil className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {visibleSkills.length > 0 ? (
                visibleSkills.map((skill) => (
                  <span
                    key={skill}
                    className="border border-zinc-200 bg-zinc-50 px-3 py-1.5 font-mono text-[10px] font-black uppercase tracking-[0.16em] text-zinc-800"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-sm leading-6 text-zinc-500">
                  Add skills to help other members understand what you work with.
                </p>
              )}
              {skills.length > visibleSkills.length ? (
                <span className="border border-zinc-200 px-3 py-1.5 font-mono text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">
                  +{skills.length - visibleSkills.length} more
                </span>
              ) : null}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

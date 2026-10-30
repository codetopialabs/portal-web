"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Dialog, Tooltip } from "radix-ui";
import { type ComponentType, type ReactNode, useEffect, useState } from "react";
import {
  PiBehanceLogo,
  PiCheck,
  PiCodepenLogo,
  PiDiscordLogo,
  PiDribbbleLogo,
  PiFacebookLogo,
  PiGithubLogo,
  PiGitlabLogo,
  PiGitMergeFill,
  PiGlobeSimple,
  PiIdentificationCardFill,
  PiInstagramLogo,
  PiLinkedinLogo,
  PiLinkSimple,
  PiLinkSimpleHorizontal,
  PiMedalFill,
  PiMediumLogo,
  PiMoonFill,
  PiPencilSimple,
  PiStackOverflowLogo,
  PiSunFill,
  PiTelegramLogo,
  PiTiktokLogo,
  PiWhatsappLogo,
  PiX,
  PiXLogo,
} from "react-icons/pi";
import { PublicProfileBadges } from "@/components/badges/PublicProfileBadges";
import { ContributionGraph } from "@/components/contributions/ContributionGraph";
import { ProfileCoverArt } from "@/components/profile/ProfileCoverArt";
import { ProfileRow, ProfileSection } from "@/components/profile/ProfileSection";
import { PublicProfileFooter } from "@/components/profile/PublicProfileFooter";
import { PublicProfileHeader } from "@/components/profile/PublicProfileHeader";
import { formatJoinedAt } from "@/components/profile/utils";
import { useMemberBadges } from "@/hooks/useBadges";
import { usePermission } from "@/hooks/usePermission";
import { LINK_PLATFORMS } from "@/lib/social-platforms";
import {
  cn,
  getAvatarUrl,
  getCoverUrl,
  getWallOfImpactUrl,
  sanitizeHandle,
  withCloudinaryTransform,
} from "@/lib/utils";
import { type CommunityMember, UserService } from "@/services/user.service";
import { useUserStore } from "@/store/user.store";
import { normalizeUrl } from "@/utils/url";

const DISCIPLINE_LABELS: Record<string, string> = {
  software_engineering: "Software Engineering",
  ux_ui_design: "UX / UI Design",
  data_science: "Data Science",
  ml_ai: "Machine Learning / AI",
  cybersecurity: "Cybersecurity",
  cloud_devops: "Cloud / DevOps",
  product_management: "Product Management",
  hardware_embedded: "Hardware / Embedded",
  robotics_iot: "Robotics / IoT",
  mobile_development: "Mobile Development",
  qa_testing: "QA / Testing",
  technical_writing: "Technical Writing",
  other: "Other",
};

type IconType = ComponentType<{ className?: string }>;

// One icon family (Phosphor, regular weight) for every link on the page, so the row
// of links reads as a set. Platforms without a match fall back to a link.
const PLATFORM_ICONS: Record<string, IconType> = {
  gitlab: PiGitlabLogo,
  stackoverflow: PiStackOverflowLogo,
  codepen: PiCodepenLogo,
  dribbble: PiDribbbleLogo,
  behance: PiBehanceLogo,
  instagram: PiInstagramLogo,
  facebook: PiFacebookLogo,
  tiktok: PiTiktokLogo,
  telegram: PiTelegramLogo,
  whatsapp: PiWhatsappLogo,
  medium: PiMediumLogo,
};

interface ProfileLink {
  label: string;
  href: string;
  icon: IconType;
}

function yearRange(start: string, end: string | null | undefined) {
  const from = new Date(start).getFullYear();
  if (!end) return `${from} – Now`;
  const to = new Date(end).getFullYear();
  return from === to ? `${from}` : `${from} – ${to}`;
}

// Copies the profile's address so members can paste it anywhere.
function CopyLinkButton({ username }: { username: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(`${window.location.origin}/${username}`);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          // Clipboard can be blocked (e.g. insecure context); nothing to undo.
        }
      }}
      className="inline-flex items-center gap-1.5 font-mono text-sm text-zinc-600 dark:text-zinc-400 transition-colors hover:text-zinc-950 dark:hover:text-white"
    >
      {copied ? <PiCheck className="h-4 w-4" /> : <PiLinkSimpleHorizontal className="h-4 w-4" />}
      {copied ? "Copied" : "Copy link"}
    </button>
  );
}

type Detail = { label: string; value: ReactNode };

// Short labels, like skills, roles and teams, sit in grey pills.
const PILL_CLASS =
  "rounded-md bg-[#efefef] px-2.5 py-1 font-mono text-sm text-zinc-700 dark:bg-[#1f1f1f] dark:text-zinc-300";

// The avatar sits a third over the cover's bottom edge. A member's own
// photo opens full size on click; the generated fallback has nothing to show.
function ProfileAvatar({ url, name }: { url: string; name: string }) {
  const avatarClass =
    "relative -mt-10 h-28 w-28 bg-[#f2f2f2] object-cover ring-1 ring-black/10 dark:bg-[#1c1c1c] dark:ring-white/10 sm:-mt-14 sm:h-40 sm:w-40";

  const [open, setOpen] = useState(false);

  if (!url?.trim()) {
    // biome-ignore lint/performance/noImgElement: generated avatar
    return <img src={getAvatarUrl(url, name)} alt={name} className={avatarClass} />;
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          aria-label={`View ${name}'s photo`}
          className="block cursor-zoom-in outline-offset-4 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-zinc-950 dark:focus-visible:outline-white"
        >
          {/* 320px covers the 160px avatar on retina screens. */}
          {/* biome-ignore lint/performance/noImgElement: user avatar */}
          <img
            src={withCloudinaryTransform(url, "c_fill,g_face,w_320,h_320,f_auto,q_auto")}
            alt={name}
            className={avatarClass}
          />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/85 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-0 z-50 flex items-center justify-center p-6 outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
          // The content fills the screen, so a click around the photo lands
          // on it rather than the overlay: treat that as a backdrop click.
          onClick={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <Dialog.Title className="sr-only">{name}</Dialog.Title>
          {/* Shown no larger than it was uploaded, so small photos stay sharp. */}
          {/* biome-ignore lint/performance/noImgElement: user avatar */}
          <img
            src={withCloudinaryTransform(url, "c_limit,w_1200,h_1200,f_auto,q_auto")}
            alt={name}
            className="max-h-[85vh] max-w-full object-contain"
          />
          <Dialog.Close
            aria-label="Close"
            className="absolute top-4 right-4 p-2 text-white/70 outline-offset-2 hover:text-white focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-white"
          >
            <PiX aria-hidden className="h-6 w-6" />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

type Pill = { label: string; description?: string };

// A pill with a description says what it means on hover or focus.
function Pills({ items }: { items: (string | Pill)[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => {
        const { label, description } = typeof item === "string" ? { label: item } : item;
        return (
          <li key={label} className="flex">
            {description ? (
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button
                    type="button"
                    className={cn(
                      PILL_CLASS,
                      "cursor-help outline-offset-2 hover:bg-[#e4e4e4] focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-zinc-950 dark:hover:bg-[#2a2a2a] dark:focus-visible:outline-white"
                    )}
                  >
                    {label}
                  </button>
                </Tooltip.Trigger>
                {/* Not portalled, so it sits inside the profile's .dark
                    wrapper and follows the page theme. */}
                <Tooltip.Content
                  side="top"
                  sideOffset={6}
                  className="z-50 max-w-xs bg-zinc-950 px-3 py-2 font-mono text-xs leading-snug text-white dark:bg-white dark:text-zinc-950"
                >
                  {description}
                  <Tooltip.Arrow className="fill-zinc-950 dark:fill-white" />
                </Tooltip.Content>
              </Tooltip.Root>
            ) : (
              <span className={PILL_CLASS}>{label}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

// Facts about the member, under the header: a quiet label over each value,
// in rows of three so they line up however many there are.
function DetailsList({ details }: { details: Detail[] }) {
  return (
    <dl className="grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3">
      {details.map(({ label, value }) => (
        <div key={label} className="flex min-w-0 flex-col gap-1">
          <dt className="font-sans text-sm text-zinc-500">{label}</dt>
          <dd className="font-mono text-base font-medium leading-snug text-zinc-950 dark:text-white [&_ul]:mt-1">
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

type View = "overview" | "contributions" | "badges";
type Theme = "light" | "dark";

const THEME_KEY = "profile-theme";

interface RailItem {
  view: View;
  label: string;
  icon: IconType;
  count?: number;
}

// The left rail, like an editor's activity bar: one quiet icon per part of
// the profile, a count where there is one, and a bar beside the open one.
// It sits just left of the profile column; on smaller screens it moves to
// the bottom of the screen.
function ProfileRail({
  items,
  active,
  onSelect,
  theme,
  onToggleTheme,
}: {
  items: RailItem[];
  active: View;
  onSelect: (view: View) => void;
  theme: Theme;
  onToggleTheme: () => void;
}) {
  const ThemeIcon = theme === "dark" ? PiSunFill : PiMoonFill;
  return (
    <nav
      aria-label="Profile sections"
      className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-black/5 dark:border-white/5 bg-[#ebebeb] dark:bg-[#0b0b0b] py-1 lg:sticky lg:inset-x-auto lg:bottom-auto lg:top-24 lg:w-20 lg:flex-col lg:justify-start lg:gap-1 lg:border-t-0 lg:bg-transparent lg:dark:bg-transparent lg:py-0"
    >
      {items.map(({ view, label, icon: Icon, count }) => {
        const isActive = view === active;
        return (
          <button
            key={view}
            type="button"
            onClick={() => onSelect(view)}
            aria-label={count ? `${label} (${count})` : label}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "relative flex h-14 flex-1 lg:w-20 lg:flex-none flex-col items-center justify-center gap-1 transition-colors duration-200",
              isActive
                ? "text-zinc-950 dark:text-white"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
            )}
          >
            <span
              aria-hidden
              className={cn(
                "absolute bg-zinc-950 dark:bg-white transition-opacity duration-200",
                "inset-x-3 top-0 h-0.5 lg:inset-x-auto lg:inset-y-2 lg:left-0 lg:h-auto lg:w-0.5",
                isActive ? "opacity-100" : "opacity-0"
              )}
            />
            <Icon className="h-6 w-6" />
            <span className="font-sans text-[11px] font-medium leading-none">{label}</span>
            {count ? (
              <span className="absolute top-0.5 right-4 grid h-5 min-w-5 place-items-center rounded-full bg-zinc-950 dark:bg-white px-1 font-mono text-[11px] font-bold leading-none text-white dark:text-black">
                {count > 99 ? "99+" : count}
              </span>
            ) : null}
          </button>
        );
      })}
      {/* Kept apart at the bottom, like the settings icons in an editor. */}
      <button
        type="button"
        onClick={onToggleTheme}
        aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
        className="flex h-14 flex-1 lg:w-20 lg:flex-none flex-col items-center justify-center gap-1 text-zinc-500 transition-colors duration-200 hover:text-zinc-900 lg:mt-4 dark:hover:text-zinc-200"
      >
        <ThemeIcon className="h-6 w-6" />
        <span className="font-sans text-[11px] font-medium leading-none">
          {theme === "dark" ? "Light" : "Dark"}
        </span>
      </button>
    </nav>
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

  // Badge count decides whether the Badges section renders at all.
  const { data: badgeAwards = [] } = useMemberBadges(username);

  // The open section follows the address (#badges etc.), so a link can
  // point straight at one.
  const [view, setView] = useState<View>("overview");
  useEffect(() => {
    const fromHash = window.location.hash.slice(1);
    // #activity was its own section before it joined Contributions.
    if (fromHash === "activity") setView("contributions");
    else if (["overview", "contributions", "badges"].includes(fromHash)) {
      setView(fromHash as View);
    }
  }, []);
  // Dark by default; a visitor's own choice is remembered on their device.
  const [theme, setTheme] = useState<Theme>("dark");
  useEffect(() => {
    try {
      if (window.localStorage.getItem(THEME_KEY) === "light") setTheme("light");
    } catch {
      // Storage can be blocked; the default theme is fine.
    }
  }, []);
  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      window.localStorage.setItem(THEME_KEY, next);
    } catch {
      // Storage can be blocked; the switch still works for this visit.
    }
  };

  const selectView = (next: View) => {
    setView(next);
    window.history.replaceState(null, "", next === "overview" ? " " : `#${next}`);
  };

  if (!profile || isError) {
    notFound();
  }

  // Only a cover the member uploaded is shown. The generated pattern used
  // elsewhere is decoration, and this page has none.
  const hasCustomCover = Boolean(profile.coverImageUrl?.trim());
  const filteredRoles = profile.communityRoles?.filter((r: string) => r.trim() !== "") || [];
  const roleList = filteredRoles.length > 0 ? filteredRoles : ["Member"];
  const discipline = profile.discipline
    ? (DISCIPLINE_LABELS[profile.discipline] ??
      profile.discipline.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase()))
    : null;
  const skills = profile.skills ?? [];
  const teams = profile.teams ?? [];
  const careerProgressions = profile.careerProgressions ?? [];
  const recognitions = profile.recognitions ?? [];
  const bio = profile.bio?.trim();
  const firstName = profile.fullName?.split(" ")[0] || "This member";
  const badgeCount = badgeAwards.filter((a) => !a.isRevoked).length;
  // Empty sections are left out, so a profile with nothing filled in needs
  // one line saying so instead of a bare page.
  const hasDetails =
    Boolean(bio) || careerProgressions.length > 0 || recognitions.length > 0 || skills.length > 0;

  const isOwnProfile = currentUser?.username === username;
  const showOwnProfileEdit = isOwnProfile && canEditOwnProfile;
  // Only the owner sees what's missing, each linking to its place in
  // settings. Visitors just see the sections that are filled in.
  const missing = showOwnProfileEdit
    ? [
        ...(bio ? [] : [{ label: "Add a bio", href: "/settings/profile#bio" }]),
        ...(skills.length > 0
          ? []
          : [{ label: "Add skills", href: "/settings/profile#settings-skills" }]),
      ]
    : [];
  const showAdminEdit = !isOwnProfile && canEditMembers;

  const links: ProfileLink[] = [];
  if (profile.githubHandle) {
    links.push({
      label: "GitHub",
      href: `https://github.com/${sanitizeHandle(profile.githubHandle)}`,
      icon: PiGithubLogo,
    });
  }
  if (profile.linkedinUrl) {
    links.push({
      label: "LinkedIn",
      href: normalizeUrl(profile.linkedinUrl),
      icon: PiLinkedinLogo,
    });
  }
  if (profile.twitterHandle) {
    links.push({
      label: "X",
      href: `https://x.com/${sanitizeHandle(profile.twitterHandle)}`,
      icon: PiXLogo,
    });
  }
  if (profile.discordId) {
    links.push({
      label: profile.discordUsername ? `Discord: @${profile.discordUsername}` : "Discord",
      href: `https://discord.com/users/${profile.discordId}`,
      icon: PiDiscordLogo,
    });
  }
  if (profile.websiteUrl) {
    links.push({
      label: "Website",
      href: normalizeUrl(profile.websiteUrl),
      icon: PiGlobeSimple,
    });
  }
  for (const link of profile.socialLinks ?? []) {
    if (!link.url.trim()) continue;
    const platform = LINK_PLATFORMS.find((p) => p.value === link.platform);
    links.push({
      label: link.label || platform?.label || "Link",
      href: normalizeUrl(link.url),
      icon: PLATFORM_ICONS[link.platform] ?? PiLinkSimple,
    });
  }

  // Roles are single words: the team level first, then community roles.
  // "Member" only shows when there is nothing else.
  const allRoles = [
    ...new Set([
      ...(teams.length > 0 && profile.teamLevel ? [profile.teamLevel] : []),
      ...roleList,
    ]),
  ];
  const roles = allRoles.length > 1 ? allRoles.filter((role) => role !== "Member") : allRoles;
  const roleDescriptions = new Map(
    (profile.communityRoleDetails ?? []).map((role) => [role.name, role.description])
  );
  if (teams.length > 0 && profile.teamLevel && profile.teamLevelDescription) {
    roleDescriptions.set(profile.teamLevel, profile.teamLevelDescription);
  }

  const details: Detail[] = [
    ...(discipline ? [{ label: "Field", value: discipline }] : []),
    ...(profile.experienceLevel ? [{ label: "Level", value: profile.experienceLevel }] : []),
    {
      label: roles.length > 1 ? "Roles" : "Role",
      value: (
        <Pills
          items={roles.map((role) => ({ label: role, description: roleDescriptions.get(role) }))}
        />
      ),
    },
    ...(teams.length > 0
      ? [
          {
            label: teams.length > 1 ? "Teams" : "Team",
            value: (
              <Pills
                items={teams.map((team) => ({ label: team.name, description: team.description }))}
              />
            ),
          },
        ]
      : []),
    { label: "Joined", value: formatJoinedAt(profile.joinedAt) },
  ];

  const railItems: RailItem[] = [
    { view: "overview", label: "Overview", icon: PiIdentificationCardFill },
    { view: "contributions", label: "Contributions", icon: PiGitMergeFill },
    ...(badgeCount > 0
      ? [{ view: "badges" as const, label: "Badges", icon: PiMedalFill, count: badgeCount }]
      : []),
  ];
  // A section can disappear (e.g. a badge is revoked); fall back to overview.
  const openView = railItems.some((item) => item.view === view) ? view : "overview";

  return (
    // Tailwind's dark styles apply inside a .dark element, so the switch
    // sits on a wrapper around the page.
    <div className={theme === "dark" ? "dark" : undefined}>
      <div className="flex min-h-screen flex-col bg-[#ebebeb] text-zinc-900 dark:bg-[#0b0b0b] dark:text-zinc-100">
        <PublicProfileHeader />

        <div className="flex flex-grow pt-16">
          {/* The panel sits one shade lighter than the frame around it, with a
            soft corner, so it reads as lifted without any borders. */}
          <main className="min-h-[calc(100vh-4rem)] min-w-0 flex-grow overflow-x-clip bg-white dark:bg-[#151515] pb-28 sm:rounded-tl-xl lg:pb-24">
            <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3 font-mono text-sm text-zinc-500 sm:px-8">
              <p className="min-w-0 truncate">
                community <span className="text-zinc-300 dark:text-zinc-700">›</span> members{" "}
                <span className="text-zinc-300 dark:text-zinc-700">›</span>{" "}
                <span className="text-zinc-700 dark:text-zinc-300">{profile.username}</span>
              </p>
              <div className="flex shrink-0 items-center gap-5">
                <CopyLinkButton username={profile.username} />
                {(showOwnProfileEdit || showAdminEdit) && (
                  <Link
                    href={
                      showOwnProfileEdit
                        ? "/settings/profile"
                        : `/admin/members/${profile.username}/edit`
                    }
                    className="inline-flex items-center gap-1.5 font-mono text-sm text-zinc-600 dark:text-zinc-400 transition-colors hover:text-zinc-950 dark:hover:text-white"
                  >
                    <PiPencilSimple className="h-4 w-4" />
                    {showOwnProfileEdit ? "Edit profile" : "Edit member"}
                  </Link>
                )}
              </div>
            </div>

            <div className="h-32 w-full overflow-hidden bg-[#f2f2f2] dark:bg-[#1c1c1c] sm:h-56">
              {hasCustomCover ? (
                // biome-ignore lint/performance/noImgElement: user cover image
                <img
                  src={getCoverUrl(profile.coverImageUrl, profile.fullName)}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <ProfileCoverArt seed={profile.username} />
              )}
            </div>

            {/* Their handle, huge and faint behind the header. */}
            <div aria-hidden="true" className="relative">
              <p className="pointer-events-none absolute top-3 right-4 select-none sm:right-8 whitespace-nowrap font-mono text-[clamp(72px,15vw,240px)] font-semibold leading-none tracking-tighter text-[#f2f2f2] dark:text-[#1d1d1d]">
                @{profile.username}
              </p>
            </div>

            <article className="relative mx-auto max-w-3xl px-4 sm:px-8">
              {/* A strip as tall as the column, left of it, so the rail can
                  stay in view while the profile scrolls. */}
              <div className="lg:absolute lg:inset-y-0 lg:-left-24 lg:pt-24">
                <ProfileRail
                  items={railItems}
                  active={openView}
                  onSelect={selectView}
                  theme={theme}
                  onToggleTheme={toggleTheme}
                />
              </div>

              <header className="animate-in fade-in slide-in-from-bottom-1 duration-500 motion-reduce:animate-none">
                <ProfileAvatar url={profile.profilePictureUrl} name={profile.fullName} />

                <div className="mt-5 min-w-0 sm:mt-6">
                  <h1 className="font-sans text-[32px] font-semibold leading-tight tracking-tighter text-zinc-950 dark:text-white sm:text-5xl">
                    {/* Non-breaking hyphens keep "Mensah-Bonsu" on one line. */}
                    {profile.fullName.replaceAll("-", "\u2011")}
                  </h1>
                  <p className="mt-1 font-mono text-base text-zinc-500 sm:text-lg">
                    @{profile.username}
                  </p>
                  {(profile.currentRole || profile.location) && (
                    <p className="mt-3 font-mono text-base text-zinc-600 dark:text-zinc-400 sm:text-lg">
                      {[profile.currentRole, profile.location].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  {links.length > 0 && (
                    <ul className="mt-4 flex flex-wrap items-center gap-5 sm:mt-5">
                      {links.map(({ label, href, icon: Icon }) => (
                        <li key={`${label}-${href}`}>
                          <a
                            href={href}
                            target="_blank"
                            rel="noreferrer"
                            title={label}
                            aria-label={label}
                            className="text-zinc-500 transition-colors duration-200 hover:text-zinc-950 dark:hover:text-white"
                          >
                            <Icon className="h-5 w-5" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </header>

              {/* Who they are in the community sits with the header, so it
                  shows on every section and never drops to the bottom. */}
              <div className="mt-8 animate-in fade-in slide-in-from-bottom-1 duration-500 motion-reduce:animate-none sm:mt-10">
                <DetailsList details={details} />
              </div>

              <div className="mt-12 sm:mt-20">
                {openView === "overview" && (
                  <>
                    {missing.length > 0 ? (
                      <p className="mb-12 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-sm text-zinc-600 dark:text-zinc-400">
                        <span>Only you can see this:</span>
                        {missing.map(({ label, href }) => (
                          <Link
                            key={href}
                            href={href}
                            className="text-zinc-950 dark:text-white underline decoration-zinc-400 dark:decoration-zinc-600 underline-offset-4 transition-colors hover:decoration-zinc-950 dark:hover:decoration-white"
                          >
                            {label}
                          </Link>
                        ))}
                      </p>
                    ) : (
                      !hasDetails && (
                        <p className="font-mono text-sm text-zinc-600 dark:text-zinc-400">
                          {firstName} hasn't added profile details yet.
                        </p>
                      )
                    )}

                    {bio && (
                      <ProfileSection title="About">
                        <p className="whitespace-pre-wrap font-mono text-base leading-7 text-zinc-700 dark:text-zinc-300">
                          {bio}
                        </p>
                      </ProfileSection>
                    )}
                    {skills.length > 0 && (
                      <ProfileSection title="Skills">
                        <Pills items={skills} />
                      </ProfileSection>
                    )}

                    {recognitions.length > 0 && (
                      <ProfileSection title="Recognition">
                        <div className="space-y-9">
                          {recognitions.map((item) => (
                            <ProfileRow key={item.id} date={item.period}>
                              <a
                                href={getWallOfImpactUrl(item.slug)}
                                target="_blank"
                                rel="noreferrer"
                                className="group block"
                              >
                                <h3 className="font-sans text-base font-semibold text-zinc-950 dark:text-white group-hover:underline group-hover:underline-offset-4">
                                  {item.awardName}
                                </h3>
                                <p className="mt-0.5 font-mono text-sm text-zinc-500">
                                  {item.domain || item.roleLabel || "Codetopia Community"}
                                </p>
                                <p className="mt-2 font-mono text-[15px] leading-7 text-zinc-700 dark:text-zinc-300">
                                  {item.impactSummary}
                                </p>
                              </a>
                            </ProfileRow>
                          ))}
                        </div>
                      </ProfileSection>
                    )}

                    {careerProgressions.length > 0 && (
                      <ProfileSection title="Career">
                        <div className="space-y-9">
                          {careerProgressions.map((item) => (
                            <ProfileRow
                              key={item.id}
                              date={yearRange(item.startDate, item.endDate)}
                            >
                              <h3 className="font-sans text-base font-semibold text-zinc-950 dark:text-white">
                                {item.title}
                              </h3>
                              <p className="mt-0.5 font-mono text-sm text-zinc-500">
                                {item.teamName ?? "Codetopia Community"}
                              </p>
                              {item.description && (
                                <p className="mt-2 whitespace-pre-wrap font-mono text-[15px] leading-7 text-zinc-700 dark:text-zinc-300">
                                  {item.description}
                                </p>
                              )}
                            </ProfileRow>
                          ))}
                        </div>
                      </ProfileSection>
                    )}
                  </>
                )}

                {/* All of their work, from GitHub and their teams, on one
                    calendar; a day opens to what was done. */}
                {openView === "contributions" && (
                  <ContributionGraph
                    username={profile.username}
                    joinedAt={profile.joinedAt}
                    isPublicView
                    appearance={theme}
                  />
                )}

                {openView === "badges" && <PublicProfileBadges username={profile.username} />}
              </div>
            </article>
          </main>
        </div>

        <PublicProfileFooter />
      </div>
    </div>
  );
}

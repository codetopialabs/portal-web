"use client";

import { ArrowRight, ChevronRight, HelpCircle, Home, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useLogoutMutation } from "@/hooks/useAuthMutations";
import { getAvatarUrl } from "@/lib/utils";
import { useUserStore } from "@/store/user.store";

/* ─────────────────────────────────────────────────────────────────────────────
   System Banner — shared color schema for all sub-navbar notifications.

   Variants:
     warning  → amber solid   — action required, deadline approaching
     alert    → red solid     — account flagged, destructive issue
     info     → zinc solid    — neutral announcement, FYI

   All banners follow the same layout and font rules as AccountFlaggedBanner
   and ReflectionPrompt so the navbar stack looks unified.
───────────────────────────────────────────────────────────────────────────── */

const BANNER_STYLES = {
  warning: {
    wrap: "border-b border-amber-600 bg-amber-500",
    icon: "text-white",
    text: "text-white",
    label: "font-bold text-white",
    cta: "border border-white bg-white text-amber-700 hover:bg-amber-50",
  },
  alert: {
    wrap: "border-b border-red-700 bg-red-600",
    icon: "text-white",
    text: "text-red-100",
    label: "font-bold text-white",
    cta: "border border-white bg-white text-red-700 hover:bg-red-50",
  },
  info: {
    wrap: "border-b border-zinc-600 bg-zinc-800",
    icon: "text-zinc-300",
    text: "text-zinc-300",
    label: "font-bold text-white",
    cta: "border border-zinc-400 bg-zinc-700 text-white hover:bg-zinc-600",
  },
} as const;

type BannerVariant = keyof typeof BANNER_STYLES;

function SystemBanner({
  variant,
  icon: Icon,
  label,
  body,
  ctaLabel,
  ctaHref,
  moreCount,
}: {
  variant: BannerVariant;
  icon: React.ElementType;
  label: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
  moreCount?: number;
}) {
  const s = BANNER_STYLES[variant];
  return (
    <div className={`flex items-center gap-3 px-4 py-2.5 sm:px-6 ${s.wrap}`}>
      <Icon className={`h-4 w-4 shrink-0 ${s.icon}`} />
      <p className={`min-w-0 flex-1 font-mono text-xs ${s.text}`}>
        <span className={s.label}>{label}</span>
        {body && <span className="font-normal"> {body}</span>}
      </p>
      <div className="flex shrink-0 items-center gap-2">
        {ctaLabel && ctaHref && (
          <Link
            href={ctaHref}
            className={`hidden shrink-0 items-center gap-1.5 px-3 py-1 font-mono text-xs font-bold transition-colors sm:inline-flex ${s.cta}`}
          >
            {ctaLabel}
            <ArrowRight className="h-3 w-3" />
          </Link>
        )}
        {moreCount !== undefined && moreCount > 0 && (
          <Link
            href="/notifications"
            className="hidden shrink-0 items-center gap-1 px-3 py-1 font-mono text-xs font-bold text-white/90 transition-colors hover:text-white sm:inline-flex border border-white/20 hover:bg-white/10"
          >
            +{moreCount} more
          </Link>
        )}
      </div>
    </div>
  );
}

/* ─── Breadcrumbs ─────────────────────────────────────────────────────────── */

const routeLabels: Record<string, string> = {
  "": "Dashboard",
  community: "Community",
  programs: "Programs",
  mentorship: "Mentorship",
  resources: "Resources",
  activity: "Activity",
  settings: "Settings",
  profile: "Profile",
  security: "Security",
  apps: "Connected Apps",
};

function resolveLabel(seg: string): string {
  return routeLabels[seg] ?? seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return (
      <div className="flex items-center gap-1.5">
        <Home className="w-3 h-3 text-zinc-400" />
        <span className="font-mono text-xs font-semibold text-zinc-900">Dashboard</span>
      </div>
    );
  }

  const crumbs = segments.map((seg, idx) => {
    const href = `/${segments.slice(0, idx + 1).join("/")}`;
    const label = resolveLabel(seg);
    const isLast = idx === segments.length - 1;
    return { href, label, isLast };
  });

  return (
    <div className="flex items-center gap-1.5">
      <Link href="/" className="text-zinc-400 hover:text-zinc-900 transition-colors">
        <Home className="w-3 h-3" />
      </Link>
      {crumbs.map((crumb) => (
        <span key={crumb.href} className="flex items-center gap-1.5">
          <ChevronRight className="w-3 h-3 text-zinc-300" />
          {crumb.isLast ? (
            <span className="font-mono text-xs font-semibold text-zinc-900">{crumb.label}</span>
          ) : (
            <Link
              href={crumb.href}
              className="font-mono text-xs font-medium text-zinc-400 hover:text-zinc-900 transition-colors"
            >
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </div>
  );
}

/* ─── Profile dropdown ────────────────────────────────────────────────────── */

function ProfileDropdown() {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const logout = useLogoutMutation();
  const profile = useUserStore((s) => s.profile);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const name = profile?.fullName ?? "—";
  const email = profile?.email ?? "—";
  const avatarUrl = profile?.profilePictureUrl;

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex items-center group">
        <div
          className={`w-8 h-8 rounded-none overflow-hidden transition-all border bg-white flex items-center justify-center p-0.5 ${open ? "border-zinc-900" : "border-zinc-200 group-hover:border-zinc-400"}`}
        >
          {/* biome-ignore lint/performance/noImgElement: user avatar */}
          <img
            src={getAvatarUrl(avatarUrl, name)}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-zinc-200 shadow-lg z-50">
          <div className="px-4 py-3 border-b border-zinc-100">
            <p className="font-mono font-bold text-sm text-zinc-900 truncate">{name}</p>
            <p className="font-mono text-xs text-zinc-400 truncate mt-0.5">{email}</p>
          </div>
          <div className="py-1">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                logout.mutate();
              }}
              disabled={logout.isPending}
              className="w-full flex items-center gap-3 px-4 py-2.5 font-mono text-sm text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              {logout.isPending ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Navbar ──────────────────────────────────────────────────────────────── */

export function DashboardNavbar() {
  return (
    <header className="sticky top-0 z-40 h-16 border-b border-zinc-200 bg-white/80 backdrop-blur-xl flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="text-zinc-500 hover:text-zinc-900 transition-colors" />
        <Breadcrumbs />
      </div>
      <div className="flex items-center gap-2 sm:gap-6">
        <Link
          href="/docs"
          className="hidden sm:flex p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-all"
          title="Documentation"
        >
          <HelpCircle className="w-4 h-4" />
        </Link>
        <div className="h-6 w-px bg-zinc-200 hidden sm:block" />
        <ProfileDropdown />
      </div>
    </header>
  );
}

/* ─── Export SystemBanner for use by other banner components ──────────────── */
export { SystemBanner };
export type { BannerVariant };

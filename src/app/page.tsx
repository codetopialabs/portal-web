"use client";

import {
  ArrowRight,
  BookOpen,
  Calendar,
  ExternalLink,
  Smartphone,
  Users,
  Activity,
  BarChart2,
  Plug,
  ShieldCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardShell } from "@/components/dashboard/Shell";
import { useAuthStore } from "@/store/auth.store";
import { useUserStore } from "@/store/user.store";
import { SessionService } from "@/services/auth.service";
import { Badge } from "@/components/ui/badge";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Avatar({ url, name }: { url: string | null; name: string }) {
  if (url) {
    // biome-ignore lint/performance/noImgElement: user avatar
    return <img src={url} alt={name} className="w-full h-full object-cover" />;
  }
  return (
    <span className="font-mono font-bold text-2xl text-zinc-400 uppercase select-none">
      {name.charAt(0)}
    </span>
  );
}

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

// ─── Coming Soon card ─────────────────────────────────────────────────────────

function ComingSoonCard({
  icon: Icon,
  name,
  description,
}: {
  icon: React.ElementType;
  name: string;
  description: string;
}) {
  return (
    <div className="bg-white border border-zinc-200 p-6 flex flex-col items-start gap-3">
      <Icon className="w-5 h-5 text-zinc-400" />
      <div className="space-y-1">
        <p className="font-sans font-black uppercase tracking-widest text-sm text-zinc-900">
          {name}
        </p>
        <p className="font-mono text-xs text-zinc-400">{description}</p>
      </div>
      <Badge variant="outline">Coming Soon</Badge>
    </div>
  );
}

// ─── Dashboard content ────────────────────────────────────────────────────────

function DashboardContent() {
  const profile = useUserStore((s) => s.profile)!;

  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ["sessions"],
    queryFn: () => SessionService.getSessions(),
  });

  // Most recent session = first in list (backend returns newest first)
  const lastSession = sessions && sessions.length > 0 ? sessions[0] : null;

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-8">
      {/* ── Top Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 border border-zinc-200 bg-zinc-50 flex items-center justify-center">
            <Avatar url={profile.profilePictureUrl} name={profile.fullName} />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-sans font-black text-2xl text-zinc-900 leading-none">
                {profile.fullName}
              </h1>
              {profile.roles.map((role) => (
                <span
                  key={role}
                  className="font-mono text-[10px] uppercase tracking-widest border border-zinc-200 bg-zinc-50 text-zinc-500 px-2 py-0.5"
                >
                  {role.replace(/_/g, " ")}
                </span>
              ))}
            </div>
            <p className="font-mono text-sm text-zinc-500 mt-1.5">
              #{profile.communityId?.substring(0, 10).toUpperCase()}
            </p>
          </div>
        </div>
        <Link
          href={`/members/${profile.username}/public-profile`}
          className="inline-flex items-center gap-1.5 font-mono text-sm text-zinc-500 hover:text-zinc-900 transition-colors shrink-0"
        >
          View community profile <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-12 items-start">
        {/* ── Left Column (col-span-2) ──────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-12">

          {/* Active Mentorship — Coming Soon */}
          <section className="space-y-4">
            <h2 className="font-sans font-black uppercase text-sm tracking-widest text-zinc-900">
              Active Mentorship
            </h2>
            <ComingSoonCard
              icon={Users}
              name="Active Mentorship"
              description="Your active mentorship sessions will appear here."
            />
          </section>

          {/* Active Training — Coming Soon */}
          <section className="space-y-4">
            <h2 className="font-sans font-black uppercase text-sm tracking-widest text-zinc-900">
              Active Training
            </h2>
            <ComingSoonCard
              icon={BookOpen}
              name="Active Training"
              description="Your active training programs and progress will appear here."
            />
          </section>

          {/* Upcoming Events — Coming Soon */}
          <section className="space-y-4">
            <h2 className="font-sans font-black uppercase text-sm tracking-widest text-zinc-900">
              Upcoming Events
            </h2>
            <ComingSoonCard
              icon={Calendar}
              name="Upcoming Events"
              description="Community events you're registered for will appear here."
            />
          </section>

        </div>

        {/* ── Right Column (col-span-1) ─────────────────────────────────────── */}
        <div className="space-y-12">

          {/* Your Stats — Coming Soon */}
          <section className="space-y-4">
            <h2 className="font-sans font-black uppercase text-sm tracking-widest text-zinc-900">
              Your Stats
            </h2>
            <ComingSoonCard
              icon={BarChart2}
              name="Your Stats"
              description="Events attended, programs completed, sessions done, and community rank."
            />
          </section>

          {/* Security */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-sans font-black uppercase text-sm tracking-widest text-zinc-900">
                Security
              </h2>
              <Link
                href="/settings/security"
                className="font-mono text-xs text-zinc-400 hover:text-zinc-900 flex items-center gap-1 group"
              >
                Manage{" "}
                <ExternalLink className="w-3 h-3 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
            <div className="bg-white border border-zinc-200 divide-y divide-zinc-100">
              {sessionsLoading ? (
                <div className="p-4 flex items-center gap-2 text-zinc-400">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-zinc-300 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              ) : lastSession ? (
                <>
                  <div className="p-4 flex items-start gap-3">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <p className="font-sans text-[14px] text-zinc-700">
                      Last login from{" "}
                      <span className="font-semibold">
                        {lastSession.deviceName || "Unknown device"}
                      </span>
                    </p>
                  </div>
                  <div className="p-4 flex items-center justify-between bg-zinc-50">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Smartphone className="w-3.5 h-3.5 shrink-0" />
                      <p className="font-mono text-[11px]">
                        {formatDateTime(lastSession.createdAt)}
                      </p>
                    </div>
                    <Link
                      href="/settings/security"
                      className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 hover:text-zinc-900 flex items-center gap-1 group shrink-0"
                    >
                      Activity{" "}
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </>
              ) : (
                <div className="p-4 flex items-center gap-2 text-zinc-400">
                  <Smartphone className="w-3.5 h-3.5 shrink-0" />
                  <p className="font-mono text-[11px]">No session data available</p>
                </div>
              )}
            </div>
          </section>

          {/* Connected Apps — Coming Soon */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-sans font-black uppercase text-sm tracking-widest text-zinc-900">
                Connected Apps
              </h2>
              <Link
                href="/settings/apps"
                className="font-mono text-xs text-zinc-400 hover:text-zinc-900 flex items-center gap-1 group"
              >
                Manage{" "}
                <ExternalLink className="w-3 h-3 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
            <ComingSoonCard
              icon={Plug}
              name="Connected Apps"
              description="OAuth applications connected to your account will appear here."
            />
          </section>

        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const session = useAuthStore((s) => s.session);
  const isAuthLoading = useAuthStore((s) => s.isLoading);
  const profile = useUserStore((s) => s.profile);
  const isUserLoading = useUserStore((s) => s.isLoading);
  const isOnboarded = useUserStore((s) => s.isOnboarded);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthLoading && !session) router.replace("/login");
  }, [hydrated, isAuthLoading, session, router]);

  useEffect(() => {
    if (!hydrated) return;
    if (!isUserLoading && session && profile && !isOnboarded)
      router.replace("/onboarding");
  }, [hydrated, isUserLoading, session, profile, isOnboarded, router]);

  const isLoading = isAuthLoading || isUserLoading;

  if (!hydrated || isLoading || !profile) {
    return (
      <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center">
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-zinc-900 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <DashboardShell>
      <DashboardContent />
    </DashboardShell>
  );
}

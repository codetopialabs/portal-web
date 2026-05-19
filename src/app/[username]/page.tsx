"use client";

import {
  ArrowLeft,
  Calendar,
  MapPin,
  Star,
  Clock,
  ExternalLink,
  Globe,
  MessageSquare,
  Activity
} from "lucide-react";
import { FaGithub, FaLinkedin, FaXTwitter } from "react-icons/fa6";
import Link from "next/link";
import { useParams } from "next/navigation";
import React from "react";
import { UserService, type CommunityMember } from "@/services/user.service";
import { useAuthStore } from "@/store/auth.store";
import { useUserStore } from "@/store/user.store";
import { NotFound } from "@/components/profile/NotFound";
import { ProfileSkeleton } from "@/components/profile/ProfileSkeleton";
import { roleBadgeColors, formatJoinedAt, formatRoleLabel } from "@/components/profile/utils";

export default function MemberProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = React.useState<CommunityMember | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [hydrated, setHydrated] = React.useState(false);

  const session = useAuthStore((s) => s.session);
  const currentUser = useUserStore((s) => s.profile);

  React.useEffect(() => {
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    let active = true;
    async function loadProfile() {
      setLoading(true);
      setError(null);
      try {
        const data = await UserService.getMemberByUsername(username);
        if (active) setProfile(data);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Profile not found");
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadProfile();
    return () => { active = false; };
  }, [username]);

  if (!hydrated || loading) return <ProfileSkeleton />;
  if (!profile || error) return <NotFound />;

  return (
    <div className="min-h-screen bg-[#f9fafb] flex flex-col font-sans">
      {/* Public Header */}
      <header className="sticky top-0 z-50 bg-zinc-950 border-b border-zinc-800">
        <div className="max-w-6xl mx-auto h-16 px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center group">
            {/* biome-ignore lint/performance/noImgElement: community logo */}
            <img 
              src="/logos/community-logo-black.png" 
              alt="Codetopia" 
              className="h-9 w-auto invert brightness-0 invert transition-transform group-hover:scale-105" 
            />
          </Link>

          <div className="flex items-center gap-6">
            {!session ? (
              <div className="flex items-center gap-6">
                <Link 
                  href="/login" 
                  className="font-mono text-[11px] uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
                >
                  Sign in
                </Link>
                <Link 
                  href="/register" 
                  className="font-mono text-[10px] uppercase tracking-[0.2em] bg-white text-black px-5 py-2.5 hover:bg-zinc-200 transition-all font-black"
                >
                  Join Community
                </Link>
              </div>
            ) : (
              <Link 
                href="/community" 
                className="font-mono text-[11px] uppercase tracking-widest text-zinc-400 hover:text-white transition-colors flex items-center gap-2 group"
              >
                <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Portal Dashboard
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {session && (
          <Link
            href="/community"
            className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors group"
          >
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Back to Collective
          </Link>
        )}

        {/* ── Profile Architecture ────────────────────────────────────────── */}
        <div className="relative">
          {/* Cover Strategy */}
          <div className="h-48 sm:h-72 w-full bg-zinc-100 overflow-hidden border border-zinc-200">
            {profile.coverImageUrl ? (
              // biome-ignore lint/performance/noImgElement: profile cover
              <img src={profile.coverImageUrl} alt="" className="w-full h-full object-cover saturate-0 hover:saturate-100 transition-all duration-700" />
            ) : (
              <div className="w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px]" />
            )}
          </div>

          {/* Identity Block */}
          <div className="max-w-5xl mx-auto px-6 sm:px-10">
            <div className="relative -mt-16 sm:-mt-24 flex flex-col md:flex-row items-end justify-between gap-6 pb-10 border-b border-zinc-200">
              <div className="flex flex-col md:flex-row items-end gap-6 w-full">
                <div className="w-32 h-32 sm:w-44 sm:h-44 bg-white p-1 border border-zinc-200 shrink-0">
                  <div className="w-full h-full bg-zinc-50 flex items-center justify-center overflow-hidden">
                    {profile.profilePictureUrl ? (
                      // biome-ignore lint/performance/noImgElement: profile avatar
                      <img src={profile.profilePictureUrl} alt={profile.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-mono text-4xl font-black text-zinc-200">
                        {profile.fullName.charAt(0)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex-1 min-w-0 pb-2">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h1 className="font-sans font-black text-3xl sm:text-4xl text-zinc-900 tracking-tighter uppercase">{profile.fullName}</h1>
                    {(() => {
                      const primaryRole = profile.communityRoles?.[0] ? formatRoleLabel(profile.communityRoles[0]) : "Member";
                      return (
                        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] bg-zinc-900 text-white px-2 py-1">
                          {primaryRole}
                        </span>
                      );
                    })()}
                  </div>
                </div>

                {/* Social Integration */}
                <div className="flex items-center gap-1.5 pb-2">
                  {profile.githubHandle && (
                    <a href={`https://github.com/${profile.githubHandle}`} target="_blank" rel="noreferrer"
                      className="w-10 h-10 border border-zinc-200 flex items-center justify-center text-zinc-400 hover:bg-black hover:text-white hover:border-black transition-all">
                      <FaGithub className="w-4 h-4" />
                    </a>
                  )}
                  {profile.linkedinUrl && (
                    <a href={profile.linkedinUrl} target="_blank" rel="noreferrer"
                      className="w-10 h-10 border border-zinc-200 flex items-center justify-center text-zinc-400 hover:bg-black hover:text-white hover:border-black transition-all">
                      <FaLinkedin className="w-4 h-4" />
                    </a>
                  )}
                  {profile.websiteUrl && (
                    <a href={profile.websiteUrl} target="_blank" rel="noreferrer"
                      className="w-10 h-10 border border-zinc-200 flex items-center justify-center text-zinc-400 hover:bg-black hover:text-white hover:border-black transition-all">
                      <Globe className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Core Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-x border-b border-zinc-200 bg-white">
              <div className="p-6 border-r border-zinc-100 flex flex-col gap-1">
                <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">Position</span>
                <span className="font-sans font-bold text-sm text-zinc-900 truncate">{profile.currentRole || "ENGINEER"}</span>
              </div>
              <div className="p-6 border-r border-zinc-100 flex flex-col gap-1">
                <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">Deployment</span>
                <span className="font-sans font-bold text-sm text-zinc-900 truncate">{profile.location || "REMOTE"}</span>
              </div>
              <div className="p-6 border-r border-zinc-100 flex flex-col gap-1">
                <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">Class</span>
                <span className="font-sans font-bold text-sm text-zinc-900 truncate">{profile.experienceLevel || "PROFESSIONAL"}</span>
              </div>
              <div className="p-6 flex flex-col gap-1">
                <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">Onboarded</span>
                <span className="font-sans font-bold text-sm text-zinc-900 truncate">{formatJoinedAt(profile.joinedAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Intelligence Layer ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-8">
          
          {/* Main Dossier */}
          <div className="lg:col-span-8 space-y-12">
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <h2 className="font-sans font-black uppercase text-sm tracking-[0.3em] text-zinc-900">Personnel Bio</h2>
                <div className="h-px bg-zinc-200 flex-1" />
              </div>
              <div className="bg-white border border-zinc-200 p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-zinc-50 -mr-12 -mt-12 rotate-45 border-l border-zinc-200" />
                <p className="font-mono text-sm text-zinc-600 leading-relaxed whitespace-pre-wrap relative z-10">
                  {profile.bio || "ACCESS DENIED: Personnel bio has not been initialized."}
                </p>
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <h2 className="font-sans font-black uppercase text-sm tracking-[0.3em] text-zinc-900">Technical Stack</h2>
                <div className="h-px bg-zinc-200 flex-1" />
              </div>
              <div className="flex flex-wrap gap-3">
                {profile.skills && profile.skills.length > 0 ? (
                  profile.skills.map((skill) => (
                    <div key={skill} className="font-mono text-[11px] uppercase tracking-widest border border-zinc-200 bg-white px-4 py-2 hover:border-zinc-900 transition-colors">
                      {skill}
                    </div>
                  ))
                ) : (
                  <div className="font-mono text-xs text-zinc-400 italic">No technical assets declared.</div>
                )}
              </div>
            </section>

            {/* Contribution Log */}
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <h2 className="font-sans font-black uppercase text-sm tracking-[0.3em] text-zinc-900">Activity Ledger</h2>
                <div className="h-px bg-zinc-200 flex-1" />
              </div>
              <div className="border border-zinc-200 bg-zinc-50 py-16 flex flex-col items-center justify-center text-center px-6">
                <div className="w-14 h-14 border border-zinc-200 bg-white flex items-center justify-center rotate-3 mb-6">
                  <Clock className="w-6 h-6 text-zinc-300" />
                </div>
                <h3 className="font-mono font-bold text-xs uppercase tracking-widest text-zinc-900 mb-2">Syncing Data...</h3>
                <p className="font-mono text-[11px] text-zinc-500 max-w-xs leading-relaxed uppercase tracking-tighter">
                  Real-time contribution logging and event attendance tracking is being optimized for this profile.
                </p>
              </div>
            </section>
          </div>

          {/* Sidebar Metrics */}
          <div className="lg:col-span-4 space-y-12">
            <section className="space-y-6">
              <h2 className="font-sans font-black uppercase text-sm tracking-[0.3em] text-zinc-900 text-center lg:text-left">Community Standing</h2>
              <div className="grid grid-cols-1 gap-4">
                <div className="border border-zinc-200 bg-zinc-950 p-6 flex items-center justify-between group">
                  <div className="space-y-1">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">Community Points</p>
                    <p className="font-sans font-black text-3xl text-white">0</p>
                  </div>
                  <Star className="w-8 h-8 text-zinc-800 group-hover:text-amber-500/50 transition-colors" />
                </div>
                <div className="border border-zinc-200 bg-white p-6 flex items-center justify-between group">
                  <div className="space-y-1">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">Contribution Rank</p>
                    <p className="font-sans font-black text-3xl text-zinc-900">0</p>
                  </div>
                  <Activity className="w-8 h-8 text-zinc-100 group-hover:text-zinc-900/10 transition-colors" />
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="font-sans font-black uppercase text-sm tracking-[0.3em] text-zinc-900 text-center lg:text-left">Authorized Roles</h2>
              <div className="space-y-2">
                {profile.communityRoles && profile.communityRoles.length > 0 ? (
                  profile.communityRoles.map((r) => (
                    <div key={r} className="flex items-center justify-between p-3 border border-zinc-100 bg-white font-mono text-[11px] uppercase tracking-widest text-zinc-600">
                      <span>{formatRoleLabel(r)}</span>
                      <div className="w-1.5 h-1.5 bg-zinc-900" />
                    </div>
                  ))
                ) : (
                  <div className="p-3 border border-zinc-100 bg-white font-mono text-[11px] uppercase tracking-widest text-zinc-400 italic text-center">
                    GUEST MEMBER
                  </div>
                )}
              </div>
            </section>

            {/* Quick Actions */}
            {session && currentUser?.username !== username && (
              <button className="w-full bg-zinc-900 text-white font-mono text-[11px] uppercase tracking-[0.3em] py-4 hover:bg-zinc-800 transition-all flex items-center justify-center gap-3 group">
                Establish Contact <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>
        </div>
      </main>

      {/* ── Unauthenticated Terminal ────────────────────────────────────────── */}
      {!session && (
        <div className="relative py-32 mt-20 overflow-hidden bg-zinc-950 border-t border-zinc-900">
          {/* Technical Grid Overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
               style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
          
          <div className="max-w-4xl mx-auto px-4 text-center space-y-12 relative z-10">
            <div className="inline-flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.5em] text-zinc-500 border border-zinc-800 px-6 py-2 rounded-full">
              <span className="w-1.5 h-1.5 bg-zinc-700 animate-pulse" /> Unauthorized Access Detected
            </div>
            
            <div className="space-y-6">
              <h2 className="font-sans font-black text-4xl sm:text-6xl text-white tracking-tighter uppercase leading-[0.9]">
                Initiate <span className="text-zinc-600">Onboarding</span> <br /> Process Today.
              </h2>
              <p className="font-mono text-xs text-zinc-500 max-w-lg mx-auto leading-relaxed uppercase tracking-tight">
                Connect with {profile.fullName.split(' ')[0]} and gain access to the Collective's internal intelligence, technical forums, and resource repositories.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/register" className="w-full sm:w-auto font-mono text-[11px] uppercase tracking-[0.3em] bg-white text-black px-14 py-5 hover:bg-zinc-200 transition-all font-black text-center">
                Join Collective
              </Link>
              <Link href="/login" className="w-full sm:w-auto font-mono text-[11px] uppercase tracking-[0.3em] text-white border border-zinc-800 bg-transparent px-14 py-5 hover:bg-zinc-900 transition-all font-black text-center">
                Identity Sign-In
              </Link>
            </div>
          </div>
          
          {/* Sub-Technical Footer */}
          <div className="absolute bottom-6 left-0 right-0 px-10 flex justify-between items-center font-mono text-[8px] uppercase tracking-widest text-zinc-800 pointer-events-none">
            <span>SECURE_PROTOCOL_V3.0</span>
            <span>CODETOPIA // IDENTITY_CORE</span>
            <span>COORD_LAT_0.023_LON_32.581</span>
          </div>
        </div>
      )}
    </div>
  );
}

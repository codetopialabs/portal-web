"use client";

import { ArrowRight, MapPin, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { FaGithub, FaLinkedin } from "react-icons/fa6";
import { formatRoleLabel } from "@/components/profile/utils";
import { Input } from "@/components/ui/input";
import { getAvatarUrl, getCoverUrl, sanitizeHandle } from "@/lib/utils";
import type { CommunityMember } from "@/services/user.service";
import { normalizeUrl } from "@/utils/url";
import { MemberCard } from "./member-card";
import {
  EMPTY_FILTERS,
  filterMembers,
  formatJoinedAt,
  getMemberFilterOptions,
  type MemberFilters,
} from "./member-directory-utils";
import { MemberFilterPopover } from "./member-filter-popover";

const INITIAL_VISIBLE_COUNT = 6;
const LOAD_MORE_COUNT = 6;

interface MemberDirectoryProps {
  members: CommunityMember[];
  isLoading: boolean;
  error: string | null;
  initialRoleFilter?: string;
  onRoleFilterChange: (role: string) => void;
}

export function MemberDirectory({
  members,
  isLoading,
  error,
  initialRoleFilter = "all",
  onRoleFilterChange,
}: MemberDirectoryProps) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<MemberFilters>({
    ...EMPTY_FILTERS,
    role: initialRoleFilter || "all",
  });
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const feedKey = useMemo(
    () => `${search}|${filters.role}|${filters.skill}|${filters.experience}`,
    [filters.experience, filters.role, filters.skill, search]
  );
  const lastFeedKeyRef = useRef(feedKey);

  const options = useMemo(() => getMemberFilterOptions(members), [members]);
  const filteredMembers = useMemo(
    () => filterMembers(members, search, filters),
    [filters, members, search]
  );
  const visibleMembers = useMemo(
    () => filteredMembers.slice(0, visibleCount),
    [filteredMembers, visibleCount]
  );
  const featuredMembers = useMemo(
    () =>
      [...members]
        .sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime())
        .slice(0, 1),
    [members]
  );

  useEffect(() => {
    if (lastFeedKeyRef.current === feedKey) return;
    lastFeedKeyRef.current = feedKey;
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  }, [feedKey]);

  useEffect(() => {
    if (isLoading || visibleMembers.length >= filteredMembers.length) return;

    const sentinel = loadMoreRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        setVisibleCount((current) => Math.min(current + LOAD_MORE_COUNT, filteredMembers.length));
      },
      { rootMargin: "300px 0px" }
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [filteredMembers.length, isLoading, visibleMembers.length]);

  function updateFilters(nextFilters: MemberFilters) {
    setFilters(nextFilters);
    onRoleFilterChange(nextFilters.role);
  }

  function resetFilters() {
    setFilters(EMPTY_FILTERS);
    onRoleFilterChange("all");
  }

  return (
    <div className="space-y-6">
      {/* Featured member — hero card */}
      {!isLoading && featuredMembers.length > 0 ? (
        <FeaturedMemberCard member={featuredMembers[0]} />
      ) : null}

      {/* Search & filter toolbar */}
      <div className="border border-zinc-200 bg-white">
        <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
            Directory
          </p>
          {!isLoading && (
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-400">
              {filteredMembers.length} {filteredMembers.length === 1 ? "result" : "results"}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-3 p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
            <Input
              placeholder="Search by name, role, or skill..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-10 rounded-none border-zinc-200 bg-zinc-50 pl-9 font-mono text-sm transition-all focus-visible:border-zinc-900 focus-visible:bg-white focus-visible:ring-0"
            />
          </div>
          <MemberFilterPopover
            filters={filters}
            options={options}
            onChange={updateFilters}
            onReset={resetFilters}
          />
        </div>
        {/* Active filter chips */}
        {(filters.role !== "all" || filters.skill !== "all" || filters.experience !== "all") && (
          <div className="flex flex-wrap items-center gap-2 border-t border-zinc-100 px-4 py-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-400">
              Active:
            </span>
            {filters.role !== "all" && (
              <span className="border border-zinc-200 bg-zinc-50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-600">
                Role: {filters.role}
              </span>
            )}
            {filters.skill !== "all" && (
              <span className="border border-zinc-200 bg-zinc-50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-600">
                Skill: {filters.skill}
              </span>
            )}
            {filters.experience !== "all" && (
              <span className="border border-zinc-200 bg-zinc-50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-600">
                Level: {filters.experience}
              </span>
            )}
            <button
              type="button"
              onClick={resetFilters}
              className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 underline underline-offset-2 transition-colors hover:text-zinc-700"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="border border-zinc-200 bg-white px-4 py-3">
          <p className="font-mono text-sm text-zinc-500">{error}</p>
        </div>
      )}

      {/* Member grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <MemberCardSkeletons />
        ) : (
          visibleMembers.map((member) => <MemberCard key={member.id} member={member} />)
        )}

        {!isLoading && filteredMembers.length === 0 && (
          <div className="border border-zinc-200 bg-white py-20 text-center sm:col-span-2 lg:col-span-3">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center border border-zinc-200 bg-zinc-50">
              <Search className="h-5 w-5 text-zinc-300" />
            </div>
            <p className="font-mono text-sm font-bold text-zinc-900">
              No members match your search
            </p>
            <p className="mt-1 font-mono text-sm text-zinc-500">
              Try adjusting your filters or search terms
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-4 inline-flex items-center gap-2 border border-zinc-200 bg-white px-4 py-2 font-mono text-[11px] font-black uppercase tracking-[0.16em] text-zinc-700 transition-colors hover:border-zinc-900 hover:text-zinc-950"
            >
              Clear filters
            </button>
          </div>
        )}

        {!isLoading && filteredMembers.length > visibleMembers.length && (
          <div
            ref={loadMoreRef}
            className="flex items-center justify-between border border-zinc-200 bg-white px-4 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-400 sm:col-span-2 lg:col-span-3"
          >
            <span>
              Showing {visibleMembers.length} of {filteredMembers.length}
            </span>
            <span>Scroll for more</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Featured member hero card                                          */
/* ------------------------------------------------------------------ */

function FeaturedMemberCard({ member }: { member: CommunityMember }) {
  const primaryRole = member.primaryRole
    ? formatRoleLabel(member.primaryRole)
    : member.communityRoles?.[0]
      ? formatRoleLabel(member.communityRoles[0])
      : "Member";
  const visibleSkills = member.skills.slice(0, 5);

  return (
    <section className="overflow-hidden border border-zinc-200 bg-white">
      <div className="relative h-32 sm:h-40 bg-zinc-100 border-b border-zinc-200 overflow-hidden">
        {/* biome-ignore lint/performance/noImgElement: user-provided image */}
        <img
          src={getCoverUrl(member.coverImageUrl, member.fullName)}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-60 mix-blend-multiply"
        />

        <div className="absolute top-4 left-4 sm:top-5 sm:left-5 flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-[0.2em]">
          <span className="inline-flex items-center gap-1.5 border border-zinc-900 bg-zinc-900 text-white px-2.5 py-1">
            <Sparkles className="h-3 w-3 text-amber-300" />
            Featured member
          </span>
          <span className="inline-flex items-center gap-1.5 border border-zinc-200 bg-white text-zinc-600 px-2.5 py-1">
            — Recently joined
          </span>
        </div>
      </div>

      <div className="relative p-4 pt-0 sm:p-5 sm:pt-0">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start lg:justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <Link
                href={`/@${member.username}`}
                className="relative -mt-12 sm:-mt-16 h-24 w-24 shrink-0 border-[3px] border-white bg-white p-0.5 overflow-hidden shadow-sm sm:h-28 sm:w-28"
              >
                {/* biome-ignore lint/performance/noImgElement: user avatar */}
                <img
                  src={getAvatarUrl(member.profilePictureUrl, member.fullName)}
                  alt={member.fullName}
                  className="h-full w-full object-cover"
                />
              </Link>

              <div className="min-w-0 pb-1 flex flex-col sm:flex-row sm:items-center sm:justify-between w-full">
                <div className="min-w-0">
                  <h2 className="truncate font-sans text-xl font-black text-zinc-950 sm:text-2xl">
                    {member.fullName}
                  </h2>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <p className="font-sans text-sm text-zinc-500">
                      {member.currentRole || member.experienceLevel || "Community member"}
                    </p>
                    <span className="border border-zinc-200 bg-zinc-50 px-2 py-0.5 font-mono text-[10px] font-black uppercase tracking-[0.14em] text-zinc-600">
                      {primaryRole}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/@${member.username}`}
                  className="mt-3 sm:mt-0 inline-flex h-9 w-fit shrink-0 items-center gap-2 border border-zinc-900 bg-zinc-900 px-3 font-mono text-[10px] font-black uppercase tracking-[0.16em] text-white transition-colors hover:bg-zinc-800 hover:text-white"
                >
                  View profile
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {member.bio && (
              <p className="mt-4 line-clamp-2 max-w-2xl font-mono text-[13px] leading-6 text-zinc-500">
                {member.bio}
              </p>
            )}

            <div className="mt-4 flex flex-col gap-3 border-t border-zinc-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-1.5">
                {visibleSkills.length > 0 ? (
                  visibleSkills.map((skill) => (
                    <span
                      key={skill}
                      className="border border-zinc-100 bg-zinc-50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-500"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="font-mono text-xs text-zinc-400">No skills added yet.</span>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {member.githubHandle && (
                  <a
                    href={`https://github.com/${sanitizeHandle(member.githubHandle)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-7 w-7 items-center justify-center border border-zinc-200 text-zinc-400 transition-colors hover:border-zinc-900 hover:text-zinc-900"
                    title="GitHub"
                  >
                    <FaGithub className="h-3 w-3" />
                  </a>
                )}
                {member.linkedinUrl && (
                  <a
                    href={normalizeUrl(member.linkedinUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-7 w-7 items-center justify-center border border-zinc-200 text-zinc-400 transition-colors hover:border-zinc-900 hover:text-zinc-900"
                    title="LinkedIn"
                  >
                    <FaLinkedin className="h-3 w-3" />
                  </a>
                )}
                <div className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-400">
                  <MapPin className="h-3 w-3 text-zinc-300" />
                  {member.location || `Joined ${formatJoinedAt(member.joinedAt)}`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Loading skeletons                                                   */
/* ------------------------------------------------------------------ */

function MemberCardSkeletons() {
  const skeletonIds = [
    "skeleton-1",
    "skeleton-2",
    "skeleton-3",
    "skeleton-4",
    "skeleton-5",
    "skeleton-6",
  ];

  return skeletonIds.map((skeletonId) => (
    <div key={skeletonId} className="flex animate-pulse gap-3 border border-zinc-200 bg-white p-4">
      <div className="h-10 w-10 shrink-0 bg-zinc-100" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="h-4 w-2/3 bg-zinc-100" />
          <div className="h-3 w-3 bg-zinc-100" />
        </div>
        <div className="h-3 w-1/2 bg-zinc-100" />
        <div className="flex items-center gap-2">
          <div className="h-4 w-14 bg-zinc-100" />
          <div className="h-3 w-20 bg-zinc-100" />
        </div>
        <div className="flex gap-1.5 pt-1">
          <div className="h-5 w-16 bg-zinc-100" />
          <div className="h-5 w-20 bg-zinc-100" />
        </div>
      </div>
    </div>
  ));
}

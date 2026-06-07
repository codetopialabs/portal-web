"use client";

import { MapPin, Pencil, Smile } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePermission } from "@/hooks/usePermission";
import { cn, getAvatarUrl } from "@/lib/utils";
import type { CommunityMember } from "@/services/user.service";

const FUN_SKILLS = ["Staying curious", "Breaking things", "Shipping ideas", "Problem solver"];

function seededPick<T>(arr: T[], seed: string): T {
  const n = seed.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return arr[n % arr.length];
}

const ROLE_BADGE_CLASSES: Record<string, string> = {
  Mentor: "border-orange-200 bg-orange-50 text-orange-600",
  Member: "border-zinc-200 bg-zinc-50 text-zinc-400",
  Volunteer: "border-emerald-200 bg-emerald-50 text-emerald-600",
  "Core Team": "border-zinc-900 bg-zinc-900 text-white",
  Admin: "border-zinc-900 bg-zinc-900 text-white",
  "Super Admin": "border-zinc-900 bg-zinc-900 text-white",
};

interface MemberCardProps {
  member: CommunityMember;
  compact?: boolean;
}

export function MemberCard({ member, compact = false }: MemberCardProps) {
  const router = useRouter();
  const canEditMembers = usePermission("users.edit");

  const primaryRole = member.primaryRole || member.communityRoles?.[0] || "Member";

  const profileHref = `/@${member.username}`;

  const occupation = member.currentRole?.trim() || `${primaryRole} at Codetopia Community`;

  const location = member.location?.trim() || "Somewhere on Earth";

  const sortedSkills = [...(member.skills ?? [])].sort((a, b) => a.length - b.length);
  const visibleSkills = sortedSkills.slice(0, 2);
  const hiddenCount = sortedSkills.length - visibleSkills.length;
  const funSkill = seededPick(FUN_SKILLS, member.username);

  function handleCardClick(e: React.MouseEvent) {
    const target = e.target as HTMLElement;
    if (target.closest("a, button, [role='button']")) return;
    router.push(profileHref);
  }

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: dynamic click navigation
    <article
      onClick={handleCardClick}
      className="group relative flex cursor-pointer gap-3 border border-zinc-200 bg-white p-4 transition-all hover:border-zinc-400 hover:shadow-sm"
    >
      {/* Avatar */}
      <div className="h-10 w-10 shrink-0 overflow-hidden border border-zinc-200 bg-white p-0.5">
        {/* biome-ignore lint/performance/noImgElement: user-provided avatar URL */}
        <img
          src={getAvatarUrl(member.profilePictureUrl, member.fullName)}
          alt={member.fullName}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Right column — everything aligned under the name */}
      <div className="min-w-0 flex-1">
        {/* Name row */}
        <div className="flex items-start justify-between gap-2">
          <p className="truncate font-sans text-[14px] font-bold leading-tight text-zinc-900 group-hover:underline group-hover:underline-offset-4">
            {member.fullName}
          </p>
          {canEditMembers && !compact && (
            <Link
              href={`/admin/members/${member.username}/edit`}
              title={`Edit ${member.fullName}`}
              aria-label={`Edit ${member.fullName}`}
              className="inline-flex h-6 w-6 shrink-0 items-center justify-center border border-zinc-200 text-zinc-400 opacity-0 transition-all hover:border-zinc-900 hover:bg-zinc-900 hover:text-white group-hover:opacity-100"
            >
              <Pencil className="h-2.5 w-2.5" />
            </Link>
          )}
        </div>

        {/* Username + role badge */}
        <div className="mt-0.5 flex items-center gap-1.5">
          <span className="font-mono text-[11px] text-zinc-400">@{member.username}</span>
          <span
            className={cn(
              "shrink-0 border px-1.5 py-0.5 font-mono text-[9px] uppercase leading-none tracking-wider",
              ROLE_BADGE_CLASSES[primaryRole] ?? "border-zinc-200 bg-zinc-50 text-zinc-500"
            )}
          >
            {primaryRole}
          </span>
        </div>

        {/* Occupation */}
        <p className="mt-1.5 truncate font-sans text-[12px] leading-tight text-zinc-500">
          {occupation}
        </p>

        {/* Location */}
        <div className="mt-1 flex items-center gap-1 text-zinc-400">
          <MapPin className="h-3 w-3 shrink-0" />
          <p className="truncate font-mono text-[11px] leading-tight">{location}</p>
        </div>

        {/* Skills */}
        {!compact && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {visibleSkills.length > 0 ? (
              <>
                {visibleSkills.map((skill) => (
                  <span
                    key={skill}
                    className="max-w-[9rem] truncate border border-zinc-100 bg-zinc-50 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-500"
                  >
                    {skill}
                  </span>
                ))}
                {hiddenCount > 0 && (
                  <span className="font-mono text-[10px] text-zinc-400">+{hiddenCount}</span>
                )}
              </>
            ) : (
              <span className="flex items-center gap-1 font-mono text-[10px] italic text-zinc-300">
                <Smile className="h-3 w-3" />
                {funSkill}
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

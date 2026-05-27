"use client";

import { ExternalLink, MapPin, Pencil } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatRoleLabel } from "@/components/profile/utils";
import { usePermission } from "@/hooks/usePermission";
import { cn, getAvatarUrl } from "@/lib/utils";
import type { CommunityMember } from "@/services/user.service";
import { formatJoinedAt } from "./member-directory-utils";

const ROLE_BADGE_CLASSES: Record<string, string> = {
  Mentor: "border-orange-200 bg-orange-50/50 text-orange-600",
  Member: "border-zinc-200 bg-zinc-50/50 text-zinc-400",
  Volunteer: "border-emerald-200 bg-emerald-50/50 text-emerald-600",
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
  const primaryRole = member.primaryRole
    ? formatRoleLabel(member.primaryRole)
    : member.communityRoles?.[0]
      ? formatRoleLabel(member.communityRoles[0])
      : "Member";

  const profileHref = `/@${member.username}`;

  function handleCardClick(e: React.MouseEvent) {
    // Don't navigate if the user clicked an interactive child (links, buttons)
    const target = e.target as HTMLElement;
    if (target.closest("a, button, [role='button']")) return;
    router.push(profileHref);
  }

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: handled click navigation dynamically
    <article
      onClick={handleCardClick}
      className="group relative flex cursor-pointer gap-3 border border-zinc-200 bg-white p-4 transition-all hover:border-zinc-400 hover:shadow-sm"
    >
      {/* Avatar */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden border border-zinc-200 bg-white p-0.5">
        {/* biome-ignore lint/performance/noImgElement: remote member avatars are user-provided URLs. */}
        <img
          src={getAvatarUrl(member.profilePictureUrl, member.fullName)}
          alt={member.fullName}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Details */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Name row */}
        <div className="flex items-center justify-between gap-2">
          <p className="truncate font-sans text-[14px] font-bold leading-tight text-zinc-900 group-hover:underline group-hover:underline-offset-4">
            {member.fullName}
          </p>
          <div className="flex items-center gap-1.5 shrink-0">
            {canEditMembers && !compact && (
              <Link
                href={`/admin/members/${member.id}/edit`}
                title={`Edit ${member.fullName}`}
                aria-label={`Edit ${member.fullName}`}
                className="inline-flex h-6 w-6 items-center justify-center border border-zinc-200 text-zinc-400 opacity-0 transition-all hover:border-zinc-900 hover:bg-zinc-900 hover:text-white group-hover:opacity-100"
              >
                <Pencil className="h-2.5 w-2.5" />
              </Link>
            )}
            <ExternalLink className="h-3 w-3 text-zinc-300 transition-colors group-hover:text-zinc-500" />
          </div>
        </div>

        {/* Role & subtitle */}
        <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
          <p className="truncate font-sans text-[12px] leading-tight text-zinc-500">
            {member.currentRole || member.experienceLevel || "Community member"}
          </p>
          <span
            className={cn(
              "border px-1.5 py-0.5 font-mono text-[9px] uppercase leading-none tracking-wider",
              ROLE_BADGE_CLASSES[primaryRole] ?? "border-zinc-200 bg-zinc-50 text-zinc-500"
            )}
          >
            {primaryRole}
          </span>
        </div>

        {/* Location */}
        <div className="mt-1 flex items-center gap-1 text-zinc-400">
          <MapPin className="h-3 w-3 shrink-0" />
          <p className="truncate font-sans text-[11px] leading-tight">
            {member.location || `Joined ${formatJoinedAt(member.joinedAt)}`}
          </p>
        </div>

        {/* Skills */}
        {!compact && member.skills.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {member.skills.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="border border-zinc-100 bg-zinc-50 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-500"
              >
                {skill}
              </span>
            ))}
            {member.skills.length > 3 && (
              <span className="px-1 py-0.5 font-mono text-[10px] text-zinc-400">
                +{member.skills.length - 3}
              </span>
            )}
          </div>
        )}

      </div>
    </article>
  );
}

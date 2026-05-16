import { ExternalLink, MapPin } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { CommunityMember } from "@/services/user.service";
import { formatJoinedAt, getInitials } from "./member-directory-utils";
import { formatRoleLabel } from "@/components/profile/utils";

const ROLE_BADGE_CLASSES: Record<string, string> = {
  Mentor: "border-orange-200 bg-orange-50/50 text-orange-500",
  Member: "border-zinc-200 bg-zinc-50/50 text-zinc-400",
  Volunteer: "border-emerald-200 bg-emerald-50/50 text-emerald-500",
  "Core Team": "border-zinc-900 bg-zinc-900 text-white",
  Admin: "border-zinc-900 bg-zinc-900 text-white",
  "Super Admin": "border-zinc-900 bg-zinc-900 text-white",
};

interface MemberCardProps {
  member: CommunityMember;
}

export function MemberCard({ member }: MemberCardProps) {
  return (
    <Link
      href={`/members/${member.username}/public-profile`}
      className="group flex cursor-pointer flex-col gap-3 border border-zinc-200 bg-white p-4 transition-all hover:border-zinc-400"
    >
      <div className="flex items-start gap-3">
        <MemberAvatar member={member} />

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate font-bold font-sans text-[15px] text-zinc-900 leading-tight">
              {member.fullName}
            </p>
            <ExternalLink className="h-3.5 w-3.5 shrink-0 text-zinc-300 transition-colors group-hover:text-zinc-500" />
          </div>

          <div className="mt-0.5 flex flex-wrap items-center gap-2">
            <p className="font-sans text-[13px] text-zinc-500 leading-tight">
              {member.currentRole || member.experienceLevel || "Community member"}
            </p>
            {(() => {
              const primaryRole = member.communityRoles?.[0] ? formatRoleLabel(member.communityRoles[0]) : "Member";
              return (
                <span
                  className={cn(
                    "border px-1.5 py-0.5 font-mono text-[9px] uppercase leading-none tracking-wider",
                    ROLE_BADGE_CLASSES[primaryRole] ?? "border-zinc-200 bg-zinc-50 text-zinc-500"
                  )}
                >
                  {primaryRole}
                </span>
              );
            })()}
          </div>

          <div className="mt-1 flex items-center gap-1">
            <MapPin className="h-3 w-3 shrink-0 text-zinc-300" />
            <p className="font-sans text-[12px] text-zinc-400 leading-tight">
              {member.location || `Joined ${formatJoinedAt(member.joinedAt)}`}
            </p>
          </div>
        </div>
      </div>

      {member.skills.length > 0 && (
        <div className="ml-[52px] flex flex-wrap gap-1.5">
          {member.skills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="bg-zinc-50 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500 uppercase tracking-wider"
            >
              {skill}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}

function MemberAvatar({ member }: MemberCardProps) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-50">
      {member.profilePictureUrl ? (
        // biome-ignore lint/performance/noImgElement: remote member avatars are user-provided URLs.
        <img
          src={member.profilePictureUrl}
          alt={member.fullName}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="font-bold font-mono text-sm text-zinc-400 uppercase">
          {getInitials(member.fullName)}
        </span>
      )}
    </div>
  );
}

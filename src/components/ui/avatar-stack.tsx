import Image from "next/image";
import { getAvatarUrl } from "@/lib/utils";

interface AvatarStackMember {
  id: string;
  fullName: string;
  profilePictureUrl: string | null;
}

// Matches the review-assignees avatar stack pattern: square avatars (this
// app's brand is deliberately sharp-cornered, not circular), overlapping
// via negative margin, with a "+N" tile once a roster runs past `max`.
export function AvatarStack({
  members,
  totalCount,
  max = 3,
  size = 24,
}: {
  members: AvatarStackMember[];
  totalCount: number;
  max?: number;
  size?: number;
}) {
  const shown = members.slice(0, max);
  const overflow = totalCount - shown.length;
  const overlap = Math.round(size * 0.3);

  return (
    <div className="flex items-center">
      {shown.map((member, i) => (
        <Image
          key={member.id}
          src={getAvatarUrl(member.profilePictureUrl, member.fullName)}
          alt={member.fullName}
          title={member.fullName}
          width={size}
          height={size}
          className="border border-white object-cover shrink-0"
          style={{ marginLeft: i > 0 ? -overlap : 0, zIndex: shown.length - i }}
        />
      ))}
      {overflow > 0 && (
        <span
          className="flex items-center justify-center bg-zinc-800 border border-white font-mono text-[9px] font-bold text-white shrink-0"
          style={{ width: size, height: size, marginLeft: -overlap }}
        >
          +{overflow}
        </span>
      )}
    </div>
  );
}

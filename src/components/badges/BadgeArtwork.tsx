import { Award } from "lucide-react";
import Image from "next/image";
import type { Badge } from "@/types/badges.types";

export function BadgeArtwork({
  badge,
  className = "h-16 w-16",
  circular = false,
  glow = false,
}: {
  badge: Badge;
  className?: string;
  circular?: boolean;
  glow?: boolean;
}) {
  const shape = circular ? "rounded-full border-2 border-zinc-200" : "";
  const glowStyle = glow ? "shadow-[0_0_20px_rgba(251,191,36,0.15)] border-amber-200/50" : "";

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden bg-zinc-50 transition-shadow duration-300 ${shape} ${glowStyle} ${className}`}
    >
      {badge.imageUrl ? (
        <Image
          src={badge.imageUrl}
          alt={`${badge.name} badge`}
          fill
          className="object-contain p-1"
        />
      ) : (
        <Award className="h-1/3 w-1/3 text-zinc-300" />
      )}
    </div>
  );
}

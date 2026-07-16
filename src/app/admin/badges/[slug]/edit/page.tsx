"use client";

import { useParams } from "next/navigation";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { BadgeForm } from "@/components/badges/BadgeForm";
import { useBadge } from "@/hooks/useBadges";

function EditBadgeContent() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading } = useBadge(slug);
  if (isLoading || !data)
    return <div className="h-[540px] animate-pulse border border-zinc-200 bg-zinc-50" />;
  return <BadgeForm badge={data} />;
}

export default function EditBadgePage() {
  return (
    <RouteGuard permission="badges.edit">
      <EditBadgeContent />
    </RouteGuard>
  );
}

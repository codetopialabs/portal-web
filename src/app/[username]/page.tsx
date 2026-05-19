"use client";

import { notFound, useParams } from "next/navigation";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { PublicProfileContent } from "@/components/profile/PublicProfileContent";

export default function MemberProfilePage() {
  const { username } = useParams<{ username: string }>();

  if (username) {
    const decoded = decodeURIComponent(username);
    if (!decoded.startsWith("@")) {
      notFound();
    }
  }

  return (
    <RouteGuard permission="profile.view">
      <PublicProfileContent />
    </RouteGuard>
  );
}

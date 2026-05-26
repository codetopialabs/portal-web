"use client";

import { notFound, useParams } from "next/navigation";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { PublicProfileContent } from "@/components/profile/PublicProfileContent";

export default function MemberProfilePage() {
  return (
    <RouteGuard permission="profile.view">
      <PublicProfileContent />
    </RouteGuard>
  );
}

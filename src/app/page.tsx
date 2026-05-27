"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { PortalLoading } from "@/components/dashboard/PortalLoading";
import { SessionLoadError } from "@/components/dashboard/SessionLoadError";
import { DashboardShell } from "@/components/dashboard/Shell";
import { useAuthStore } from "@/store/auth.store";
import { useUserStore } from "@/store/user.store";

export default function DashboardPage() {
  const router = useRouter();
  const session = useAuthStore((s) => s.session);
  const isAuthLoading = useAuthStore((s) => s.isLoading);
  const clearSession = useAuthStore((s) => s.clearSession);
  const profile = useUserStore((s) => s.profile);
  const isUserLoading = useUserStore((s) => s.isLoading);
  const userError = useUserStore((s) => s.error);
  const isOnboarded = useUserStore((s) => s.isOnboarded);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthLoading && !session) router.replace("/login");
  }, [hydrated, isAuthLoading, session, router]);

  useEffect(() => {
    if (!hydrated) return;
    if (!isUserLoading && session && profile && !isOnboarded) {
      router.replace("/onboarding");
    }
  }, [hydrated, isUserLoading, session, profile, isOnboarded, router]);

  const isLoading = isAuthLoading || isUserLoading;

  if (hydrated && session && !isLoading && !profile && userError) {
    return (
      <SessionLoadError
        message={userError}
        onReset={() => {
          clearSession();
          router.replace("/login");
        }}
      />
    );
  }

  if (!hydrated || isLoading || !profile) {
    return <PortalLoading />;
  }

  return (
    <DashboardShell>
      <DashboardContent />
    </DashboardShell>
  );
}

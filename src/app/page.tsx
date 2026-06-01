"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { PortalLoading } from "@/components/dashboard/PortalLoading";
import { SessionLoadError } from "@/components/dashboard/SessionLoadError";
import { DashboardShell } from "@/components/dashboard/Shell";
import { useAuthStore } from "@/store/auth.store";
import { useUserStore } from "@/store/user.store";

// If the app is still loading after this many ms, show the re-login screen.
// Covers the case where token refresh or /me hangs indefinitely.
const LOADING_TIMEOUT_MS = 15_000;

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
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setHydrated(true);
  }, []);

  // Start a timeout the moment we know there's a session but no profile yet.
  // If loading resolves (profile arrives or error is set) we clear it.
  useEffect(() => {
    if (!hydrated) return;

    const isLoading = isAuthLoading || isUserLoading;

    if (session && isLoading && !profile && !timeoutRef.current) {
      timeoutRef.current = setTimeout(() => {
        setLoadingTimedOut(true);
      }, LOADING_TIMEOUT_MS);
    }

    if (!isLoading || profile) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setLoadingTimedOut(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [hydrated, session, isAuthLoading, isUserLoading, profile]);

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

  const handleReset = () => {
    clearSession();
    router.replace("/login");
  };

  // Show re-login screen if: fetch failed with an error, OR loading timed out.
  if (hydrated && session && !isLoading && !profile && userError) {
    return <SessionLoadError message={userError} onReset={handleReset} />;
  }

  if (hydrated && loadingTimedOut) {
    return (
      <SessionLoadError
        message="Your session is taking too long to load. This can happen when your connection is slow or the server is temporarily unavailable. Please sign in again."
        onReset={handleReset}
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

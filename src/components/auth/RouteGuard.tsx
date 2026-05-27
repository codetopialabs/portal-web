"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { PortalLoading } from "@/components/dashboard/PortalLoading";
import { getRoutePermission, resolvePermission } from "@/lib/permissions";
import { useAuthStore } from "@/store/auth.store";
import { useUserStore } from "@/store/user.store";
import { PermissionDenied } from "./PermissionDenied";

interface RouteGuardProps {
  children: React.ReactNode;
  /**
   * Override the permission check for this specific guard instance.
   * If not provided, the guard looks up the current pathname in ROUTE_PERMISSIONS.
   */
  permission?: string | "authenticated";
}

/**
 * RouteGuard wraps a page and enforces permission checks.
 *
 * - If unauthenticated, redirects to /login
 * - If authenticated but missing permission, shows PermissionDenied UI
 * - If permission is "authenticated", any verified, onboarded member passes
 */
export function RouteGuard({ children, permission }: RouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const session = useAuthStore((s) => s.session);
  const isAuthLoading = useAuthStore((s) => s.isLoading);
  const clearSession = useAuthStore((s) => s.clearSession);
  const profile = useUserStore((s) => s.profile);
  const isUserLoading = useUserStore((s) => s.isLoading);
  const userError = useUserStore((s) => s.error);
  const requiredPermission = permission ?? getRoutePermission(pathname) ?? "authenticated";

  useEffect(() => {
    if (!isAuthLoading && !session) {
      router.replace("/login");
    }
  }, [isAuthLoading, session, router]);

  useEffect(() => {
    if (!isUserLoading && session && !profile && userError) {
      clearSession();
      router.replace("/login");
    }
  }, [isUserLoading, session, profile, userError, clearSession, router]);

  const isLoading = isAuthLoading || isUserLoading;
  if (isLoading || !session || !profile) {
    return <PortalLoading />;
  }

  if (
    requiredPermission !== "authenticated" &&
    !resolvePermission(requiredPermission, profile.permissions ?? [])
  ) {
    return <PermissionDenied permission={requiredPermission} />;
  }

  return <>{children}</>;
}

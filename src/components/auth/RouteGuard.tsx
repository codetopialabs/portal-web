"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useUserStore } from "@/store/user.store";
import { resolvePermission, getRoutePermission } from "@/lib/permissions";
import { PermissionDenied } from "./PermissionDenied";
import { useState } from "react";

interface RouteGuardProps {
    children: React.ReactNode;
    /**
     * Override the permission check for this specific guard instance.
     * If not provided, the guard looks up the current pathname in ROUTE_PERMISSIONS.
     */
    permission?: string | "authenticated";
}

/**
 * RouteGuard — wraps a page and enforces permission checks.
 *
 * - If unauthenticated → redirects to /login
 * - If authenticated but missing permission → shows PermissionDenied UI
 * - If permission is "authenticated" → any verified, onboarded member passes
 */
export function RouteGuard({ children, permission }: RouteGuardProps) {
    const router = useRouter();
    const pathname = usePathname();
    const session = useAuthStore((s) => s.session);
    const isAuthLoading = useAuthStore((s) => s.isLoading);
    const profile = useUserStore((s) => s.profile);
    const isUserLoading = useUserStore((s) => s.isLoading);
    const [accessDenied, setAccessDenied] = useState<string | null>(null);

    useEffect(() => {
        if (isAuthLoading || isUserLoading) return;

        // Not authenticated → go to login
        if (!session) {
            router.replace("/login");
            return;
        }

        // Determine which permission to check
        const requiredPermission =
            permission ?? getRoutePermission(pathname) ?? "authenticated";

        // "authenticated" — any logged-in member passes
        if (requiredPermission === "authenticated") {
            setAccessDenied(null);
            return;
        }

        // Need profile to check permissions
        if (!profile) return;

        const userPermissions = profile.permissions ?? [];
        const hasAccess = resolvePermission(requiredPermission, userPermissions);

        if (!hasAccess) {
            setAccessDenied(requiredPermission);
        } else {
            setAccessDenied(null);
        }
    }, [
        isAuthLoading,
        isUserLoading,
        session,
        profile,
        pathname,
        permission,
        router,
    ]);

    // Show nothing while loading or redirecting
    const isLoading = isAuthLoading || isUserLoading;
    if (isLoading || !session || !profile) {
        return null;
    }

    if (accessDenied) {
        return <PermissionDenied permission={accessDenied} />;
    }

    return <>{children}</>;
}

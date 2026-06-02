"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { ME_QUERY_KEY } from "@/hooks/useMe";
import { UserService } from "@/services/user.service";
import { useAuthStore } from "@/store/auth.store";
import { useUserStore } from "@/store/user.store";

/**
 * Bootstraps the user profile on mount when a session exists, and keeps it
 * live for the entire session via useQuery.
 *
 * Using useQuery (not fetchQuery) means React Query maintains an active
 * subscription to ["me"]. When any mutation calls
 * queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY }), React Query
 * immediately refetches and the queryFn syncs the result back into the
 * Zustand store — so role changes, permission updates, and profile edits
 * propagate to every component without a page reload.
 *
 * Also keeps useUserStore.isLoading and useUserStore.error in sync so that
 * page.tsx can correctly show PortalLoading / SessionLoadError.
 */
export function UserInitializer() {
  const session = useAuthStore((s) => s.session);

  // Active subscription — this is what makes invalidateQueries actually
  // trigger a refetch. Without a subscriber, invalidation just marks the
  // cache stale but never fetches.
  const { data, isLoading, error } = useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: async () => {
      const profile = await UserService.getMe();
      return profile;
    },
    enabled: !!session,
    staleTime: 60_000,
    retry: 0,
  });

  // Keep the Zustand store in sync so all existing consumers (usePermission,
  // DashboardSidebar, DashboardContent, etc.) see fresh data immediately.
  useEffect(() => {
    if (data) {
      useUserStore.setState({
        profile: data,
        isOnboarded: data.isOnboarded,
        isLoading: false,
        error: null,
      });
    }
  }, [data]);

  useEffect(() => {
    if (!session) return;
    useUserStore.setState({ isLoading });
  }, [isLoading, session]);

  useEffect(() => {
    if (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to load your session. Please sign in again.";
      useUserStore.setState({ isLoading: false, error: message });
    }
  }, [error]);

  return null;
}

"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ME_QUERY_KEY } from "@/hooks/useMe";
import { useAuthStore } from "@/store/auth.store";
import { useUserStore } from "@/store/user.store";
import { UserService } from "@/services/user.service";

/**
 * Bootstraps the user profile on mount when a session exists.
 *
 * Primes the React Query cache for the ["me"] key so that useMe() and any
 * component reading from useUserStore both have data immediately.
 *
 * Critically, this also keeps useUserStore.isLoading and useUserStore.error
 * in sync so that page.tsx can correctly show PortalLoading while the fetch
 * is in flight and SessionLoadError if it fails.
 */
export function UserInitializer() {
  const session = useAuthStore((s) => s.session);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!session?.accessToken) return;

    // Only fetch if the cache is empty (e.g. first load or after logout).
    const cached = queryClient.getQueryData(ME_QUERY_KEY);
    if (cached) return;

    // Signal loading so page.tsx keeps showing PortalLoading.
    useUserStore.setState({ isLoading: true, error: null });

    queryClient
      .fetchQuery({
        queryKey: ME_QUERY_KEY,
        queryFn: async () => {
          const data = await UserService.getMe();
          useUserStore.setState({
            profile: data,
            isOnboarded: data.isOnboarded,
            isLoading: false,
            error: null,
          });
          return data;
        },
        staleTime: 60_000,
      })
      .catch((err: unknown) => {
        // Write the error into the store so page.tsx can show SessionLoadError.
        const message =
          err instanceof Error ? err.message : "Failed to load your session. Please sign in again.";
        useUserStore.setState({ isLoading: false, error: message });
      });
  }, [session, queryClient]);

  return null;
}

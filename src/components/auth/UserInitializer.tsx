"use client";

import { useEffect } from "react";
import { ME_QUERY_KEY } from "@/hooks/useMe";
import { useAuthStore } from "@/store/auth.store";
import { useUserStore } from "@/store/user.store";
import { UserService } from "@/services/user.service";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Bootstraps the user profile on mount when a session exists.
 *
 * Primes the React Query cache for the ["me"] key so that useMe() and any
 * component reading from useUserStore both have data immediately. All
 * subsequent reads go through React Query — this component only runs once
 * per session to seed the initial data.
 */
export function UserInitializer() {
  const session = useAuthStore((s) => s.session);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!session?.accessToken) return;

    // Only fetch if the cache is empty (e.g. first load or after logout).
    const cached = queryClient.getQueryData(ME_QUERY_KEY);
    if (cached) return;

    queryClient.fetchQuery({
      queryKey: ME_QUERY_KEY,
      queryFn: async () => {
        const data = await UserService.getMe();
        useUserStore.setState({
          profile: data,
          isOnboarded: data.isOnboarded,
          isLoading: false,
        });
        return data;
      },
      staleTime: 60_000,
    });
  }, [session, queryClient]);

  return null;
}

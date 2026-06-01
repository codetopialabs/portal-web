"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type UpdateMeRequest, UserService } from "@/services/user.service";
import { useAuthStore } from "@/store/auth.store";
import { useUserStore } from "@/store/user.store";

export const ME_QUERY_KEY = ["me"] as const;

/**
 * Fetches and caches the current user's profile via React Query.
 *
 * This is the single source of truth for the logged-in user's profile and
 * permissions. Using React Query means any mutation that affects the current
 * user (role changes, profile edits, admin actions) can call
 * queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY }) to force a
 * fresh fetch — no more stale permissions or profile data.
 *
 * The Zustand user store is kept in sync via the onSuccess callback so that
 * existing components reading from useUserStore continue to work unchanged.
 */
export function useMe() {
    const session = useAuthStore((s) => s.session);
    const { profile, isLoading } = useUserStore();

    const query = useQuery({
        queryKey: ME_QUERY_KEY,
        queryFn: async () => {
            const data = await UserService.getMe();
            // Keep the Zustand store in sync so existing consumers don't break.
            useUserStore.setState({ profile: data, isOnboarded: data.isOnboarded, isLoading: false });
            return data;
        },
        enabled: !!session?.accessToken,
        // Treat data as fresh for 60 s — avoids redundant fetches on tab focus
        // while still picking up changes quickly after mutations.
        staleTime: 60_000,
        // Keep the previous data visible while a background refetch is in flight.
        placeholderData: (prev) => prev,
    });

    return {
        profile: query.data ?? profile,
        isLoading: query.isLoading && isLoading,
        error: query.error,
        refetch: query.refetch,
    };
}

/**
 * Mutation wrapper for PATCH /auth/me/ that invalidates the me query and
 * the community members list on success.
 */
export function useUpdateMe() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateMeRequest) => UserService.updateMe(data),
        onSuccess: (updatedProfile) => {
            // Update the query cache directly — no round-trip needed.
            queryClient.setQueryData(ME_QUERY_KEY, updatedProfile);
            // Keep Zustand in sync.
            useUserStore.setState({ profile: updatedProfile, isOnboarded: updatedProfile.isOnboarded });
            // Community members list may show stale data for this user.
            queryClient.invalidateQueries({ queryKey: ["community-members"] });
        },
    });
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { ConfigService, DEFAULT_FEATURES, type FeatureFlags } from "@/services/config.service";

export const CONFIG_QUERY_KEY = ["config"] as const;

/**
 * Feature flags from GET /config/. Cached for the session: a flag only
 * changes when the backend is redeployed with a new value, so there is no
 * point polling. Until the request resolves, and if it fails, every flag
 * reads as off so the UI renders exactly as it does today.
 */
export function useFeatures(): { features: FeatureFlags; isLoading: boolean } {
  const { data, isLoading } = useQuery({
    queryKey: CONFIG_QUERY_KEY,
    queryFn: () => ConfigService.get(),
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    retry: 1,
  });
  return { features: data?.features ?? DEFAULT_FEATURES, isLoading };
}

/**
 * Usage:
 *   const teamsV2 = useFeature("teamsV2");
 *   if (!teamsV2) return <LegacyProfileForm />;
 */
export function useFeature(flag: keyof FeatureFlags): boolean {
  return useFeatures().features[flag];
}

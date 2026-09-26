import axiosInstance from "@/lib/axios";
import type { ApiResponse } from "@/types/api.types";

// Public runtime configuration from the backend. Feature flags live here so
// they can be switched on the server without a frontend rebuild. The endpoint
// is unauthenticated and carries nothing secret or per-user.

export interface FeatureFlags {
  /** The six-team structure: team leads, member levels, team health. */
  teamsV2: boolean;
}

export interface PublicConfig {
  features: FeatureFlags;
}

/** What the UI assumes until the config has loaded or if it fails: every
 * flag off, which is the current behaviour. */
export const DEFAULT_FEATURES: FeatureFlags = {
  teamsV2: false,
};

export const ConfigService = {
  async get(): Promise<PublicConfig> {
    const res = await axiosInstance.get<ApiResponse<PublicConfig>>("/config/", {
      silentError: true,
    });
    return res.data.data;
  },
};

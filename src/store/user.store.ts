import { create } from "zustand";
import { type UpdateMeRequest, type UserProfile, UserService } from "@/services/user.service";

interface UserState {
  profile: UserProfile | null;
  isOnboarded: boolean;
  isLoading: boolean;
  error: string | null;
  fetchMe: () => Promise<void>;
  updateMe: (data: UpdateMeRequest) => Promise<void>;
  setOnboarded: () => void;
  reset: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  isOnboarded: false,
  isLoading: false,
  error: null,

  fetchMe: async () => {
    set({ isLoading: true, error: null });
    try {
      const profile = await UserService.getMe();
      set({ profile, isOnboarded: profile.isOnboarded, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch user";
      set({ error: message, isOnboarded: false, isLoading: false });
    }
  },

  updateMe: async (data: UpdateMeRequest) => {
    const profile = await UserService.updateMe(data);
    set({ profile });

    // Invalidate the React Query me cache and community members list so any
    // component using useMe() or useCommunityMembers() picks up the change.
    // We import lazily to avoid a circular dependency at module load time.
    try {
      const { getQueryClient } = await import("@/lib/queryClient");
      const qc = getQueryClient();
      qc.setQueryData(["me"], profile);
      qc.invalidateQueries({ queryKey: ["community-members"] });
    } catch {
      // Query client not available (e.g. SSR or test env) — store update is enough.
    }
  },

  setOnboarded: () => {
    set({ isOnboarded: true });
    // biome-ignore lint/suspicious/noDocumentCookie: legacy cookie storage for onboarding flag
    document.cookie = "isOnboarded=true; path=/; max-age=2592000; SameSite=Lax";
  },

  reset: () => {
    set({ profile: null, isOnboarded: false, isLoading: false, error: null });
    // biome-ignore lint/suspicious/noDocumentCookie: legacy cookie storage for onboarding flag
    document.cookie = "isOnboarded=; path=/; max-age=0";
  },
}));

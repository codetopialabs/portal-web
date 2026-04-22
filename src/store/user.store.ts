import { create } from "zustand";
import {
  type UserProfile,
  type UpdateMeRequest,
  UserService,
} from "@/services/user.service";

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
      set({ profile, isOnboarded: profile.is_onboarded, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch user";
      set({ error: message, isOnboarded: false, isLoading: false });
    }
  },

  updateMe: async (data: UpdateMeRequest) => {
    try {
      const profile = await UserService.updateMe(data);
      set({ profile });
    } catch (err) {
      throw err;
    }
  },

  setOnboarded: () => {
    set({ isOnboarded: true });
    document.cookie = "isOnboarded=true; path=/; max-age=2592000; SameSite=Lax";
  },

  reset: () => {
    set({ profile: null, isOnboarded: false, isLoading: false, error: null });
    document.cookie = "isOnboarded=; path=/; max-age=0";
  },
}));

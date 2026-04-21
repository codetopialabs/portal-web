import { create } from "zustand";
import type { TokenResponse } from "@/services/auth.service";

interface Session {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

interface AuthState {
  session: Session | null;
  isLoading: boolean;
  setSession: (tokens: TokenResponse) => void;
  clearSession: () => void;
  initializeFromCookies: () => void;
}

function setCookie(name: string, value: string, maxAge: number) {
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0`;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  isLoading: true,

  setSession: (tokens: TokenResponse) => {
    setCookie("accessToken", tokens.accessToken, tokens.expiresIn);
    setCookie("refreshToken", tokens.refreshToken, 2592000);
    set({ session: tokens });
  },

  clearSession: () => {
    deleteCookie("accessToken");
    deleteCookie("refreshToken");
    set({ session: null });
  },

  initializeFromCookies: () => {
    const cookies = document.cookie.split(";").reduce<Record<string, string>>((acc, cookie) => {
      const [key, value] = cookie.trim().split("=");
      if (key && value) acc[key] = value;
      return acc;
    }, {});

    const accessToken = cookies.accessToken;
    const refreshToken = cookies.refreshToken;

    if (accessToken && refreshToken) {
      set({
        session: {
          accessToken,
          refreshToken,
          tokenType: "Bearer",
          expiresIn: 0,
        },
        isLoading: false,
      });
    } else {
      set({ session: null, isLoading: false });
    }
  },
}));

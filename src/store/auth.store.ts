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
  // biome-ignore lint/suspicious/noDocumentCookie: legacy cookie storage for auth tokens
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function deleteCookie(name: string) {
  // biome-ignore lint/suspicious/noDocumentCookie: legacy cookie storage for auth tokens
  document.cookie = `${name}=; path=/; max-age=0`;
}

function getCookie(name: string): string | null {
  const match = document.cookie.split("; ").find((r) => r.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  isLoading: true,

  setSession: (tokens: TokenResponse) => {
    setCookie("accessToken", tokens.accessToken, tokens.expiresIn);
    setCookie("refreshToken", tokens.refreshToken, 60 * 60 * 24 * 7);
    setCookie("isOnboarded", String(tokens.isOnboarded), 60 * 60 * 24 * 30);
    set({ session: tokens });
  },

  clearSession: () => {
    deleteCookie("accessToken");
    deleteCookie("refreshToken");
    deleteCookie("isOnboarded");
    set({ session: null });
  },

  initializeFromCookies: () => {
    const accessToken = getCookie("accessToken");
    const refreshToken = getCookie("refreshToken");

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
    } else if (!accessToken && refreshToken) {
      set({
        session: {
          accessToken: "",
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

"use client";

import { useEffect, useState } from "react";
import { SessionLoadError } from "./SessionLoadError";


const TIMEOUT_MS = 30000;

export function PortalLoading() {
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setTimedOut(true), TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);

  if (timedOut) {
    return (
      <SessionLoadError
        message="Your session could not be restored. This can happen after a long period of inactivity or a network issue. Please sign in again to continue."
        onReset={() => {
          // Clear all auth cookies
          for (const name of ["accessToken", "refreshToken", "isOnboarded"]) {
            document.cookie = `${name}=; path=/; max-age=0`;
          }
          // Clear Zustand stores
          import("@/store/auth.store").then(({ useAuthStore }) => useAuthStore.getState().clearSession()).catch(() => { });
          import("@/store/user.store").then(({ useUserStore }) => useUserStore.getState().reset()).catch(() => { });
          window.location.href = "/login?reason=session_expired";
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex items-end gap-2" role="status" aria-label="Loading portal">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-3 w-3 bg-zinc-900 animate-bounce"
            style={{ animationDelay: `${i * 0.12}s` }}
          />
        ))}
      </div>
    </div>
  );
}

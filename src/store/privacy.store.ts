import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PrivacyStore {
  /**
   * Global override for masked values (IPs, emails). Off by default so a
   * screen share, a screenshot, or someone walking past never exposes them
   * until the member deliberately asks to see them.
   */
  revealSensitive: boolean;
  setRevealSensitive: (revealSensitive: boolean) => void;
  toggleRevealSensitive: () => void;
}

export const usePrivacyStore = create<PrivacyStore>()(
  persist(
    (set) => ({
      revealSensitive: false,
      setRevealSensitive: (revealSensitive) => set({ revealSensitive }),
      toggleRevealSensitive: () => set((s) => ({ revealSensitive: !s.revealSensitive })),
    }),
    { name: "privacy" }
  )
);

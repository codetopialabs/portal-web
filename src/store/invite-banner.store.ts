import { create } from "zustand";

interface InviteBannerStore {
  dismissed: boolean;
  dismiss: () => void;
  reset: () => void;
}

export const useInviteBannerStore = create<InviteBannerStore>((set) => ({
  dismissed: false,
  dismiss: () => set({ dismissed: true }),
  reset: () => set({ dismissed: false }),
}));

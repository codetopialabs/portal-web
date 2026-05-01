import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface OnboardingData {
  step: number;
  // Terms
  termsAccepted: boolean;
  // Conduct
  conductAgreed: boolean;
  // Community
  communityFollowed: Record<string, boolean>;
  // Background
  discipline: string | null;
  otherDiscipline: string;
  experienceLevel: string | null;
  memberStatus: string | null;
  otherStatus: string;
  currentRole: string;
  // Goals
  primaryGoal: string;
  communityGoals: string[];
  referralSource: string | null;
  otherReferral: string;
  // Profile
  fullName: string;
  username: string;
  dateOfBirth: string;
  discordUsername: string;
  bio: string;
  githubHandle: string;
  linkedinUrl: string;
  twitterHandle: string;
  websiteUrl: string;
  skills: string[];
  avatarUrl: string | null;
}

interface OnboardingStore extends OnboardingData {
  setStep: (step: number) => void;
  merge: (data: Partial<OnboardingData>) => void;
  reset: () => void;
}

const INITIAL: OnboardingData = {
  step: 0,
  termsAccepted: false,
  conductAgreed: false,
  communityFollowed: {},
  discipline: null,
  otherDiscipline: "",
  experienceLevel: null,
  memberStatus: null,
  otherStatus: "",
  currentRole: "",
  primaryGoal: "",
  communityGoals: [],
  referralSource: null,
  otherReferral: "",
  fullName: "",
  username: "",
  dateOfBirth: "",
  discordUsername: "",
  bio: "",
  githubHandle: "",
  linkedinUrl: "",
  twitterHandle: "",
  websiteUrl: "",
  skills: [],
  avatarUrl: null,
};

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      ...INITIAL,
      setStep: (step) => set({ step }),
      merge: (data) => set(data),
      reset: () => set(INITIAL),
    }),
    { name: "onboarding" }
  )
);

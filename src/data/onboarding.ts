export const ONBOARDING_STEPS = [
  { label: "Terms", description: "Platform & privacy" },
  { label: "Welcome", description: "Who we are" },
  { label: "Core Values", description: "What we stand for" },
  { label: "Code of Conduct", description: "How we behave & enforce" },
  { label: "Intro Video", description: "Meet Codetopia Community" },
  { label: "Join Us", description: "Discord & WhatsApp" },
  { label: "Your Background", description: "Discipline & experience" },
  { label: "Your Goals", description: "What you're here for" },
  { label: "Your Profile", description: "Set up your account" },
  { label: "Welcome In", description: "You're all set" },
] as const;

// Teams v2 adds a "Your Team" step between Goals and Profile.
export const TEAM_STEP = { label: "Your Team", description: "Where you'd like to help" } as const;
export const TEAM_STEP_INDEX = 8;

export function getOnboardingSteps(teamsV2: boolean) {
  if (!teamsV2) return [...ONBOARDING_STEPS];
  const steps = [...ONBOARDING_STEPS] as { label: string; description: string }[];
  steps.splice(TEAM_STEP_INDEX, 0, TEAM_STEP);
  return steps;
}

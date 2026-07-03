export const DISCIPLINES = [
  { value: "software_engineering", label: "Software Engineering" },
  { value: "ux_ui_design", label: "UX / UI Design" },
  { value: "data_science", label: "Data Science / Analytics" },
  { value: "ml_ai", label: "Machine Learning / AI" },
  { value: "cybersecurity", label: "Cybersecurity" },
  { value: "cloud_devops", label: "Cloud / DevOps" },
  { value: "product_management", label: "Product Management" },
  { value: "hardware_embedded", label: "Hardware / Embedded" },
  { value: "robotics_iot", label: "Robotics / IoT" },
  { value: "mobile_development", label: "Mobile Development" },
  { value: "qa_testing", label: "QA / Testing" },
  { value: "technical_writing", label: "Technical Writing" },
  { value: "other", label: "Other" },
];

export const EXPERIENCE_LEVELS = [
  {
    value: "complete_beginner",
    label: "Complete Beginner",
    description: "No prior experience. Just starting out.",
  },
  {
    value: "learner",
    label: "Learner",
    description: "Studying actively. Some foundational knowledge.",
  },
  {
    value: "practitioner",
    label: "Practitioner",
    description: "Applying skills on personal projects.",
  },
  {
    value: "intermediate",
    label: "Intermediate",
    description: "1–3 years of hands-on experience.",
  },
  {
    value: "advanced",
    label: "Advanced",
    description: "3+ years. Confident and independent.",
  },
  {
    value: "expert_senior",
    label: "Expert / Senior",
    description: "5+ years. Can lead teams or mentor.",
  },
];

export const MEMBER_STATUSES = [
  { value: "student", label: "Student" },
  { value: "recent_graduate", label: "Recent Graduate" },
  { value: "job_seeker", label: "Job Seeker" },
  { value: "employed_in_tech", label: "Employed in Tech" },
  { value: "employed_non_tech", label: "Employed (Non-tech)" },
  { value: "freelancer", label: "Freelancer / Contractor" },
  { value: "founder", label: "Founder / Building my own" },
  { value: "career_changer", label: "Career Changer" },
  { value: "taking_a_break", label: "Taking a Break" },
  { value: "other", label: "Other" },
];

export const COMMUNITY_GOALS = [
  { value: "mentorship", label: "Mentorship", description: "I want a mentor to guide my growth." },
  {
    value: "peer_learning",
    label: "Peer Learning",
    description: "I want to learn alongside others at a similar level.",
  },
  {
    value: "networking",
    label: "Networking",
    description: "I want to connect with people in the tech industry.",
  },
  {
    value: "collaboration",
    label: "Collaboration",
    description: "I want to find people to build projects with.",
  },
  {
    value: "career_support",
    label: "Career Support",
    description: "Help with job searching, CVs, and interviews.",
  },
  {
    value: "skill_building",
    label: "Skill Building",
    description: "Access to resources, workshops, and learning content.",
  },
  {
    value: "community",
    label: "Community",
    description: "I want to be part of a supportive tech community.",
  },
  {
    value: "giving_back",
    label: "Giving Back",
    description: "I want to contribute by mentoring or sharing knowledge.",
  },
];

export const REFERRAL_SOURCES = [
  { value: "friend_referral", label: "Referred by a friend or member" },
  { value: "social_media", label: "Social media (Twitter/X, LinkedIn, etc.)" },
  { value: "discord_discovery", label: "Discord server discovery" },
  { value: "online_search", label: "Online search" },
  { value: "event_hackathon", label: "Community event or hackathon" },
  { value: "newsletter_blog", label: "Newsletter or blog" },
  { value: "other", label: "Other" },
];

/**
 * These fields are stored as free text on the backend, so onboarding lets
 * members pick "other" and type a custom value that gets saved directly
 * (no "other" marker persists). Resolving an existing stored value back
 * against the preset list lets Settings show the right option selected,
 * with unmatched values falling into the "other" + custom-text state.
 */
export function resolvePresetOrOther(
  storedValue: string,
  options: { value: string }[]
): { selected: string | null; otherText: string } {
  if (!storedValue) return { selected: null, otherText: "" };
  if (options.some((o) => o.value === storedValue)) {
    return { selected: storedValue, otherText: "" };
  }
  return { selected: "other", otherText: storedValue };
}

/**
 * Maps a stored value to its display label. Falls back to title-casing the
 * raw value (e.g. "product_management" -> "Product Management") for custom
 * "other" text that isn't in the preset list, so it never renders as a raw
 * snake_case value.
 */
export function labelForOption<T extends { value: string; label: string }>(
  value: string | null | undefined,
  options: T[]
): string | null | undefined {
  if (!value) return value;
  const match = options.find((o) => o.value === value);
  if (match) return match.label;
  return value.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

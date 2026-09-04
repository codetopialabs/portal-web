/**
 * Preset reasons an admin can flag an account for.
 *
 * `label` is what the admin ticks; `message` is what the member reads in the
 * flag email and in the portal, so it's written as an instruction they can act
 * on. Admins can always add a custom line on top of these.
 */
export interface FlagReason {
  id: string;
  label: string;
  message: string;
}

export interface FlagReasonGroup {
  title: string;
  reasons: FlagReason[];
}

export const FLAG_REASON_GROUPS: FlagReasonGroup[] = [
  {
    title: "Photo & identity",
    reasons: [
      {
        id: "no_photo",
        label: "No profile photo",
        message: "Add a profile photo — a clear, recent headshot where your face is visible.",
      },
      {
        id: "unclear_photo",
        label: "Photo isn't a clear headshot",
        message:
          "Replace your profile photo with a clear headshot of you — not a logo, an avatar, a group photo, or a picture where your face can't be made out.",
      },
      {
        id: "inappropriate_photo",
        label: "Photo isn't appropriate",
        message:
          "Your current profile photo isn't suitable for the community. Please upload a presentable headshot.",
      },
      {
        id: "display_name",
        label: "Display name isn't a real name",
        message:
          "Set your display name to the name people would use to address you, rather than a handle or nickname.",
      },
    ],
  },
  {
    title: "Bio & background",
    reasons: [
      {
        id: "no_bio",
        label: "Bio is empty",
        message:
          "Add a bio. Two or three sentences on what you work on, what you're building or learning right now, and what people can approach you about.",
      },
      {
        id: "vague_bio",
        label: "Bio is too vague",
        message:
          "Expand your bio. Something like \"a developer\" doesn't tell anyone what you actually do — say what you build, what you're learning, and what you'd like to be contacted about.",
      },
      {
        id: "no_discipline",
        label: "Discipline or experience level missing",
        message:
          "Set your primary discipline and experience level so you can be matched for mentorship and recommended the right programmes.",
      },
      {
        id: "no_occupation",
        label: "Job title / occupation missing",
        message:
          "Add your current job title or occupation — what you do day to day, whether that's a job, your studies, or freelance work.",
      },
    ],
  },
  {
    title: "Skills & links",
    reasons: [
      {
        id: "no_skills",
        label: "No skills listed",
        message:
          "Add the skills you actually work with. Members filter the directory by skill, so this is how you get found for collaborations and referrals.",
      },
      {
        id: "generic_skills",
        label: "Skills are too generic",
        message:
          'Replace generic skills like "coding" or "computers" with the specific tools, languages, and practices you work with.',
      },
      {
        id: "no_links",
        label: "No social or portfolio links",
        message:
          "Add at least one link — GitHub, LinkedIn, or a portfolio — so members can see what you've built.",
      },
    ],
  },
  {
    title: "Other",
    reasons: [
      {
        id: "no_location",
        label: "Location missing",
        message:
          "Add your city and country so members nearby can find you for meetups and local opportunities.",
      },
      {
        id: "inactive",
        label: "Inactive account",
        message:
          "Your account has been inactive for a while. Sign in and bring your profile up to date so we know you're still with us.",
      },
      {
        id: "guidelines",
        label: "Doesn't meet community guidelines",
        message:
          "Some of your profile content doesn't meet our community guidelines. Please review it and make the necessary changes.",
      },
    ],
  },
];

export const FLAG_REASONS: FlagReason[] = FLAG_REASON_GROUPS.flatMap((group) => group.reasons);

/**
 * Builds the reason text stored on the flag and emailed to the member.
 * Presets come out in the order they're listed above (not the order they were
 * ticked) so every flag email reads the same way, with the custom note last.
 */
export function composeFlagReason(selectedIds: string[], customReason = ""): string {
  const selected = new Set(selectedIds);
  const lines = FLAG_REASONS.filter((reason) => selected.has(reason.id)).map(
    (reason) => `• ${reason.message}`
  );

  const custom = customReason.trim();
  if (custom) lines.push(`• ${custom}`);

  return lines.join("\n");
}

/**
 * Splits a stored reason back into its items for display. Flags raised before
 * the checklist existed are a single free-text paragraph, which comes back as
 * one item — so callers can render every flag the same way.
 */
export function parseFlagReason(reason: string): string[] {
  return reason
    .split("\n")
    .map((line) => line.replace(/^[•\-*]\s*/, "").trim())
    .filter(Boolean);
}

export type RecognitionStatus = "draft" | "published" | "revoked";

export type RecognitionCategory =
  | "member"
  | "volunteer"
  | "ambassador"
  | "core_team"
  | "domain_specific";

/**
 * A Wall of Impact entry. Admin-authored *about* a member rather than
 * submitted by them, so there's no pending/approved review queue here — a
 * curator drafts it and a senior lead publishes it.
 */
export interface Recognition {
  id: string;
  slug: string;
  username: string;
  communityId: string;
  fullName: string;
  profilePictureUrl: string;
  coverImageUrl: string;
  category: RecognitionCategory;
  awardName: string;
  period: string;
  periodStart: string | null;
  periodEnd: string | null;
  impactSummary: string;
  achievements: string[];
  domain: string;
  roleLabel: string;
  status: RecognitionStatus;
  featuredRank: number | null;
  nominatedByUsername: string | null;
  publishedByUsername: string | null;
  publishedAt: string | null;
  revokedByUsername: string | null;
  revokedAt: string | null;
  revocationReason: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * The subset embedded on a member payload (/users/members/). Published entries
 * only, and no honoree identity fields — the member is the thing being
 * serialized, so repeating their name and avatar here would be redundant.
 */
export interface MemberRecognition {
  id: string;
  slug: string;
  category: RecognitionCategory;
  awardName: string;
  period: string;
  periodStart: string | null;
  periodEnd: string | null;
  impactSummary: string;
  achievements: string[];
  domain: string;
  roleLabel: string;
  featuredRank: number | null;
  publishedAt: string | null;
}

export interface RecognitionInput {
  username?: string;
  category: RecognitionCategory;
  awardName: string;
  period: string;
  periodStart?: string | null;
  periodEnd?: string | null;
  impactSummary: string;
  achievements: string[];
  domain?: string;
  roleLabel?: string;
  featuredRank?: number | null;
}

export interface RecognitionCategoryOption {
  value: RecognitionCategory;
  label: string;
}

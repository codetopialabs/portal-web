export interface MemberGrowthPoint {
  weekStart: string;
  count: number;
}

export interface AdminOverviewMembers {
  total: number;
  new7d: number;
  new30d: number;
  onboardingRate: number;
  growth: MemberGrowthPoint[];
}

export interface AdminOverviewEngagement {
  dormantMembers: number;
  unverifiedEmails: number;
}

export interface AdminOverviewReflections {
  period: string;
  dueOn: string;
  eligible: number;
  submitted: number;
  participationRate: number;
  awaitingReview: number;
}

export interface AdminOverviewReflectionsTrendPoint {
  period: string;
  eligible: number;
  submitted: number;
  participationRate: number;
}

export interface AdminOverviewCompositionBucket {
  value: string | null;
  count: number;
  label?: string;
}

export interface AdminOverviewMemberComposition {
  byExperienceLevel: AdminOverviewCompositionBucket[];
  byDiscipline: AdminOverviewCompositionBucket[];
  byReferralSource: AdminOverviewCompositionBucket[];
}

export interface AdminOverviewFlaggedAccount {
  username: string;
  reason: string;
  flaggedAt: string;
}

export interface AdminOverviewAwaitingReviewReflection {
  username: string;
  period: string;
  submittedAt: string | null;
}

export interface AdminOverviewPendingActions {
  flaggedAccounts: number;
  flaggedAccountsList: AdminOverviewFlaggedAccount[];
  reflectionsAwaitingReview: number;
  reflectionsAwaitingReviewList: AdminOverviewAwaitingReviewReflection[];
  total: number;
}

export interface AdminOverviewRoleDistribution {
  name: string;
  displayName: string;
  rank: number;
  memberCount: number;
}

export interface AdminOverviewActivityEntry {
  eventType: string;
  eventLabel: string;
  detail: string;
  user: { username: string; email: string };
  createdAt: string;
}

export interface AdminOverview {
  members: AdminOverviewMembers;
  engagement: AdminOverviewEngagement;
  reflections: AdminOverviewReflections | null;
  reflectionsTrend: AdminOverviewReflectionsTrendPoint[];
  memberComposition: AdminOverviewMemberComposition;
  pendingActions: AdminOverviewPendingActions;
  teams: { active: number };
  roleDistribution: AdminOverviewRoleDistribution[];
  recentActivity: AdminOverviewActivityEntry[];
}

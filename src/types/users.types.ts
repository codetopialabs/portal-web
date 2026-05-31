export interface AdminMember {
  id: string;
  communityId: string;
  email: string;
  username: string;
  profilePictureUrl?: string | null;
  coverImageUrl?: string | null;
  isActive: boolean;
  isEmailVerified: boolean;
  isOnboarded: boolean;
  primaryRole: string | null;
  primaryRoleRank: number | null;
  roles: string[];
  fullName: string;
  bio: string | null;
  skills: string[];
  githubHandle: string | null;
  twitterHandle: string | null;
  linkedinUrl: string | null;
  websiteUrl: string | null;
  discipline: string | null;
  experienceLevel: string | null;
  discordUsername: string | null;
  primaryGoal: string | null;
  communityGoals: string[];
  referralSource: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  location: string | null;
  currentRole: string | null;
  memberStatus: string | null;
  createdAt: string;
  updatedAt: string;
  joinedAt: string;
}

export type AdminMemberDetail = AdminMember;

export interface UpdateMemberInput {
  username?: string;
  isEmailVerified?: boolean;
  fullName?: string;
  bio?: string;
  location?: string;
  currentRole?: string;
  memberStatus?: string;
}

export interface MemberListParams {
  search?: string;
  role?: string;
  isEmailVerified?: boolean;
  isActive?: boolean;
}

export interface AdminUserSession {
  id: number;
  userId: string;
  deviceName: string;
  ipAddress: string | null;
  userAgent: string;
  createdAt: string;
  isCurrent: boolean;
}

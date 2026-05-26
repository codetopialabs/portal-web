export interface Role {
  id: number;
  name: string;
  displayName: string;
  description: string;
  rank: number;
  permissions: string[];
  isSystem: boolean;
  memberCount: number;
}

export type RoleDetail = Role;

export interface CreateRoleInput {
  name: string;
  displayName: string;
  description?: string;
  rank: number;
  permissions: string[];
}

export interface UpdateRoleInput {
  displayName?: string;
  description?: string;
  rank?: number;
  permissions?: string[];
}

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
  fullName: string;
  primaryRole: string | null;
  primaryRoleRank: number | null;
  roles: string[];
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
  memberStatus?: string;
  currentRole?: string;
}

export interface PermissionEntry {
  codename: string;
  description: string;
  isDestructive: boolean;
}

export interface MemberListParams {
  search?: string;
  role?: string;
  isEmailVerified?: boolean;
  isActive?: boolean;
}

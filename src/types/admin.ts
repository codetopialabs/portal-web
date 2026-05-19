export interface Role {
  id: number;
  name: string;
  displayName: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  memberCount: number;
}

export interface RoleMember {
  id: string;
  communityId: string;
  username: string;
  fullName: string;
  profilePictureUrl: string | null;
}

export interface RoleDetail extends Role {
  members: RoleMember[];
}

export interface CreateRoleInput {
  name: string;
  displayName: string;
  description?: string;
  permissions: string[];
}

export interface UpdateRoleInput {
  displayName?: string;
  description?: string;
  permissions?: string[];
}

export interface AdminMember {
  id: string;
  communityId: string;
  email: string;
  username: string;
  fullName: string;
  roles: string[];
  isEmailVerified: boolean;
  joinedAt: string;
}

export interface AdminMemberDetail extends AdminMember {
  bio: string | null;
  discipline: string | null;
  experienceLevel: string | null;
  skills: string[];
  location: string | null;
  discordUsername: string | null;
  githubHandle: string | null;
  twitterHandle: string | null;
  linkedinUrl: string | null;
  websiteUrl: string | null;
  profilePictureUrl: string | null;
  coverImageUrl: string | null;
  primaryGoal: string | null;
  communityGoals: string[];
  memberStatus: string | null;
  currentRole: string | null;
}

export interface UpdateMemberInput {
  fullName?: string;
  bio?: string;
  discipline?: string;
  experienceLevel?: string;
  skills?: string[];
  location?: string;
  discordUsername?: string;
  githubHandle?: string;
  twitterHandle?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  primaryGoal?: string;
  communityGoals?: string[];
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
}

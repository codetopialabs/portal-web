export interface UserProfile {
  id: string;
  communityId: string;
  email: string;
  username: string;
  roles: string[];
  permissions: string[];
  isOnboarded: boolean;
  isEmailVerified: boolean;
  fullName: string;
  profilePictureUrl: string | null;
  coverImageUrl: string | null;
  bio: string | null;
  skills: string[];
  githubHandle: string | null;
  twitterHandle: string | null;
  linkedinUrl: string | null;
  websiteUrl: string | null;
  discipline: string | null;
  experienceLevel: string | null;
  memberStatus: string | null;
  currentRole: string | null;
  primaryRole: string | null;
  discordUsername: string | null;
  primaryGoal: string | null;
  communityGoals: string[];
  referralSource: string | null;
  location: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  nationality: string | null;
  completedWalkthroughs: string[];
}

export interface CommunityMember {
  id: string;
  communityId: string;
  email: string;
  username: string;
  communityRoles: string[];
  fullName: string;
  profilePictureUrl: string;
  coverImageUrl: string;
  bio: string;
  skills: string[];
  location: string;
  experienceLevel: string;
  currentRole: string;
  primaryRole: string;
  discordUsername: string;
  githubHandle: string;
  twitterHandle: string;
  linkedinUrl: string;
  websiteUrl: string;
  isEmailVerified: boolean;
  isOnboarded: boolean;
  joinedAt: string;
  gender: string;
}

export interface UpdateMeRequest {
  full_name?: string;
  username?: string;
  bio?: string;
  skills?: string[];
  github_handle?: string;
  twitter_handle?: string;
  linkedin_url?: string;
  website_url?: string;
  discipline?: string;
  experience_level?: string;
  member_status?: string;
  current_role?: string;
  primary_role?: string;
  discord_username?: string;
  primary_goal?: string;
  community_goals?: string[];
  referral_source?: string;
  location?: string;
  date_of_birth?: string;
  gender?: string;
  nationality?: string;
  is_onboarded?: boolean;
  profile_picture_url?: string;
  cover_image_url?: string;
  completed_walkthroughs?: string[];
}

export interface UploadSignature {
  signature: string;
  timestamp: number;
  cloud_name: string;
  api_key: string;
  folder: string;
}

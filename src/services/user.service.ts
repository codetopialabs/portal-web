import axiosInstance from "@/lib/axios";

export interface SocialLink {
  platform: string;
  label: string;
  url: string;
}

export interface UserProfile {
  id: string;
  communityId: string;
  email: string;
  username: string;
  roles: string[];
  permissions: string[];
  isOnboarded: boolean;
  isEmailVerified: boolean;
  lastLoginAt: string | null;
  fullName: string;
  profilePictureUrl: string | null;
  coverImageUrl: string | null;
  gender: string | null;
  bio: string | null;
  skills: string[];
  githubHandle: string | null;
  twitterHandle: string | null;
  linkedinUrl: string | null;
  websiteUrl: string | null;
  socialLinks: SocialLink[];
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
  completedWalkthroughs: string[];
  nationality: string | null;
  joinedAt: string | null;
  usernameLastChanged: string | null;
  isFlagged: boolean;
  activeFlag: {
    id: number;
    reason: string;
    flaggedBy: string | null;
    flaggedAt: string;
    profileUpdatedAfterFlag: boolean;
  } | null;
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
  gender: string;
  bio: string;
  skills: string[];
  location: string;
  experienceLevel: string;
  currentRole: string;
  primaryRole: string;
  discordUsername: string;
  discordId: string;
  githubHandle: string;
  twitterHandle: string;
  linkedinUrl: string;
  websiteUrl: string;
  socialLinks: SocialLink[];
  discipline: string;
  isEmailVerified: boolean;
  isOnboarded: boolean;
  joinedAt: string;
}

export interface UpdateMeRequest {
  full_name?: string;
  username?: string;
  gender?: string;
  bio?: string;
  skills?: string[];
  github_handle?: string;
  twitter_handle?: string;
  linkedin_url?: string;
  website_url?: string;
  social_links?: SocialLink[];
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
  date_of_birth?: string | null;
  nationality?: string;
  is_onboarded?: boolean;
  profile_picture_url?: string;
  cover_image_url?: string;
  completed_walkthroughs?: string[];
}

interface UploadSignature {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder: string;
}

export const UserService = {
  async getMe(): Promise<UserProfile> {
    const response = await axiosInstance.get<{ data: UserProfile }>("/auth/me/");
    return response.data.data;
  },

  async getCommunityMembers(search?: string): Promise<CommunityMember[]> {
    const response = await axiosInstance.get<{ data: CommunityMember[] }>("/users/members/", {
      params: { search },
    });
    return response.data.data;
  },

  async getMemberByUsername(username: string): Promise<CommunityMember> {
    const response = await axiosInstance.get<{ data: CommunityMember }>(
      `/users/members/${username}/`
    );
    return response.data.data;
  },

  async updateMe(data: UpdateMeRequest): Promise<UserProfile> {
    const response = await axiosInstance.patch<{ data: UserProfile }>("/auth/me/", data);
    return response.data.data;
  },

  async uploadAvatar(file: File): Promise<string> {
    const sigResponse = await axiosInstance.get<{ data: UploadSignature }>(
      "/auth/cloudinary-signature/"
    );
    const sig = sigResponse.data.data;
    const form = new FormData();
    form.append("file", file);
    form.append("api_key", sig.apiKey);
    form.append("timestamp", String(sig.timestamp));
    form.append("signature", sig.signature);
    form.append("folder", sig.folder);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
      method: "POST",
      body: form,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message ?? "Upload failed.");
    return json.secure_url as string;
  },

  async uploadCoverImage(file: File): Promise<string> {
    const sigResponse = await axiosInstance.get<{ data: UploadSignature }>(
      "/auth/cloudinary-signature/?type=cover"
    );
    const sig = sigResponse.data.data;
    const form = new FormData();
    form.append("file", file);
    form.append("api_key", sig.apiKey);
    form.append("timestamp", String(sig.timestamp));
    form.append("signature", sig.signature);
    form.append("folder", sig.folder);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
      method: "POST",
      body: form,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message ?? "Upload failed.");
    return json.secure_url as string;
  },
};

import axiosInstance from "@/lib/axios";

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  role: string;
  isOnboarded: boolean;
  isEmailVerified: boolean;
  fullName: string;
  profilePictureUrl: string | null;
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
  discordUsername: string | null;
  primaryGoal: string | null;
  communityGoals: string[];
  referralSource: string | null;
  location: string | null;
  dateOfBirth: string | null;
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
  discord_username?: string;
  primary_goal?: string;
  community_goals?: string[];
  referral_source?: string;
  location?: string;
  date_of_birth?: string;
  is_onboarded?: boolean;
  profile_picture_url?: string;
}

interface UploadSignature {
  signature: string;
  timestamp: number;
  cloud_name: string;
  api_key: string;
  folder: string;
}

export const UserService = {
  async getMe(): Promise<UserProfile> {
    const response = await axiosInstance.get<{ data: UserProfile }>("/auth/me/");
    return response.data.data;
  },

  async updateMe(data: UpdateMeRequest): Promise<UserProfile> {
    const response = await axiosInstance.patch<{ data: UserProfile }>("/auth/me/", data);
    return response.data.data;
  },

  async uploadAvatar(file: File): Promise<string> {
    const sigResponse = await axiosInstance.get<{ data: UploadSignature }>("/auth/cloudinary-signature/");
    const sig = sigResponse.data.data;
    const form = new FormData();
    form.append("file", file);
    form.append("api_key", sig.api_key);
    form.append("timestamp", String(sig.timestamp));
    form.append("signature", sig.signature);
    form.append("folder", sig.folder);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloud_name}/image/upload`, {
      method: "POST",
      body: form,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message ?? "Upload failed.");
    return json.secure_url as string;
  },
};

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
  is_onboarded?: boolean;
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
};

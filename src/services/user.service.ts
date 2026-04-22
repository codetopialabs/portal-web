import axiosInstance from "@/lib/axios";

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  role: string;
  is_onboarded: boolean;
  is_email_verified: boolean;
  full_name: string;
  profile_picture_url: string | null;
  bio: string | null;
  skills: string[];
  github_handle: string | null;
  twitter_handle: string | null;
  linkedin_url: string | null;
  website_url: string | null;
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

function getAccessToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith("accessToken="));
  return match ? match.split("=")[1] : null;
}

export const UserService = {
  async getMe(): Promise<UserProfile> {
    const token = getAccessToken();
    const response = await axiosInstance.get<UserProfile>("/auth/me/", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  },

  async updateMe(data: UpdateMeRequest): Promise<UserProfile> {
    const token = getAccessToken();
    const response = await axiosInstance.patch<UserProfile>("/auth/me/", data, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  },
};

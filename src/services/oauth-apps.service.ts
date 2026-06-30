import axiosInstance from "@/lib/axios";
import type {
  CreatedOAuthApp,
  CreateOAuthAppInput,
  OAuthApp,
  UpdateOAuthAppInput,
} from "@/types/oauth-apps.types";

const BASE = "/admin/oauth-apps";

export const OAuthAppsService = {
  async getApps(): Promise<OAuthApp[]> {
    const res = await axiosInstance.get(`${BASE}/`);
    // Handle both wrapped and unwrapped DRF responses
    if (res.data?.results) {
      return res.data.results;
    }
    if (res.data?.data) {
      return res.data.data;
    }
    return res.data;
  },

  async createApp(data: CreateOAuthAppInput): Promise<CreatedOAuthApp> {
    const res = await axiosInstance.post(`${BASE}/`, data);
    return res.data?.data || res.data;
  },

  async updateApp(id: number, data: UpdateOAuthAppInput): Promise<OAuthApp> {
    const res = await axiosInstance.patch(`${BASE}/${id}/`, data);
    return res.data?.data || res.data;
  },

  async deleteApp(id: number): Promise<void> {
    await axiosInstance.delete(`${BASE}/${id}/`);
  },
};

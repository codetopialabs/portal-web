import axiosInstance from "@/lib/axios";
import type { ApiResponse } from "@/types/api.types";
import type { ApiKey, CreateApiKeyInput, CreatedApiKey } from "@/types/api-keys.types";

const BASE = "/api-keys";

export const ApiKeysService = {
  async getKeys(): Promise<ApiKey[]> {
    const res = await axiosInstance.get<ApiResponse<ApiKey[]>>(`${BASE}/`);
    return res.data.data;
  },

  async createKey(data: CreateApiKeyInput): Promise<CreatedApiKey> {
    const res = await axiosInstance.post<ApiResponse<CreatedApiKey>>(`${BASE}/`, {
      name: data.name,
      permissions: data.permissions,
      expires_at: data.expiresAt ?? null,
    });
    return res.data.data;
  },

  async revokeKey(id: string): Promise<ApiKey> {
    const res = await axiosInstance.post<ApiResponse<ApiKey>>(`${BASE}/${id}/`);
    return res.data.data;
  },
};

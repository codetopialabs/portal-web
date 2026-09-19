import axiosInstance from "@/lib/axios";
import type { ApiResponse } from "@/types/api.types";
import type {
  ApiKey,
  CreateApiKeyInput,
  CreatedApiKey,
  UpdateApiKeyInput,
} from "@/types/api-keys.types";

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

  async updateKey(id: string, data: UpdateApiKeyInput): Promise<ApiKey> {
    const payload: Record<string, unknown> = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.permissions !== undefined) payload.permissions = data.permissions;
    if (data.expiresAt !== undefined) payload.expires_at = data.expiresAt;
    const res = await axiosInstance.patch<ApiResponse<ApiKey>>(`${BASE}/${id}/`, payload);
    return res.data.data;
  },

  async revokeKey(id: string): Promise<ApiKey> {
    const res = await axiosInstance.post<ApiResponse<ApiKey>>(`${BASE}/${id}/`);
    return res.data.data;
  },
};

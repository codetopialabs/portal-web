import axiosInstance from "@/lib/axios";
import type { ApiResponse } from "@/types/api.types";

// Departments group teams and each maps to one Discord channel. Admin-only
// data: the Discord role ID lives here and nowhere member-facing.

export interface Department {
  id: string;
  slug: string;
  name: string;
  description: string;
  /** The Discord role that unlocks this department's channel. */
  discordRoleId: string;
  /** Display order on the public directory. Lower first. */
  order: number;
  teamCount: number;
  createdAt: string;
}

export interface DepartmentInput {
  name: string;
  description?: string;
  discordRoleId?: string;
  order?: number;
}

const BASE = "/admin/departments";

function toPayload(data: Partial<DepartmentInput>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (data.name !== undefined) payload.name = data.name;
  if (data.description !== undefined) payload.description = data.description;
  if (data.discordRoleId !== undefined) payload.discord_role_id = data.discordRoleId;
  if (data.order !== undefined) payload.order = data.order;
  return payload;
}

export const DepartmentsService = {
  async list(): Promise<Department[]> {
    const res = await axiosInstance.get<ApiResponse<Department[]>>(`${BASE}/`);
    return res.data.data;
  },

  async create(data: DepartmentInput): Promise<Department> {
    const res = await axiosInstance.post<ApiResponse<Department>>(`${BASE}/`, toPayload(data));
    return res.data.data;
  },

  async update(slug: string, data: Partial<DepartmentInput>): Promise<Department> {
    const res = await axiosInstance.patch<ApiResponse<Department>>(
      `${BASE}/${slug}/`,
      toPayload(data)
    );
    return res.data.data;
  },

  async remove(slug: string): Promise<void> {
    await axiosInstance.delete(`${BASE}/${slug}/`);
  },
};

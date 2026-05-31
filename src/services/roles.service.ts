import axiosInstance from "@/lib/axios";
import { ApiResponse } from "@/types/api.types";
import { CreateRoleInput, Role, RoleDetail, UpdateRoleInput } from "@/types/roles.types";

const ROLES_BASE = "/roles";

export const RolesService = {
  async getRoles(): Promise<Role[]> {
    const res = await axiosInstance.get<ApiResponse<Role[]>>(`${ROLES_BASE}/`);
    return res.data.data;
  },

  async getRole(slug: string): Promise<RoleDetail> {
    const res = await axiosInstance.get<ApiResponse<RoleDetail>>(`${ROLES_BASE}/${slug}/`);
    return res.data.data;
  },

  async createRole(data: CreateRoleInput): Promise<Role> {
    const res = await axiosInstance.post<ApiResponse<Role>>(`${ROLES_BASE}/`, {
      name: data.name,
      display_name: data.displayName,
      description: data.description ?? "",
      rank: data.rank,
      permissions: data.permissions,
    });
    return res.data.data;
  },

  async updateRole(slug: string, data: UpdateRoleInput): Promise<Role> {
    const payload: Record<string, unknown> = {};
    if (data.displayName !== undefined) payload.display_name = data.displayName;
    if (data.description !== undefined) payload.description = data.description;
    if (data.rank !== undefined) payload.rank = data.rank;
    if (data.permissions !== undefined) payload.permissions = data.permissions;
    const res = await axiosInstance.patch<ApiResponse<Role>>(`${ROLES_BASE}/${slug}/`, payload);
    return res.data.data;
  },

  async deleteRole(slug: string): Promise<void> {
    await axiosInstance.delete(`${ROLES_BASE}/${slug}/`);
  },

  async assignRole(userId: string, roleName: string): Promise<void> {
    await axiosInstance.post(`${ROLES_BASE}/assign/`, {
      user_id: userId,
      role: roleName,
    });
  },

  async revokeRole(userId: string, roleName: string): Promise<void> {
    await axiosInstance.post(`${ROLES_BASE}/revoke/`, {
      user_id: userId,
      role: roleName,
    });
  },
};

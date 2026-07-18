import axiosInstance from "@/lib/axios";
import type { ApiResponse } from "@/types/api.types";
import type { CreateRoleInput, Role, RoleDetail, UpdateRoleInput } from "@/types/roles.types";

const ROLES_BASE = "/roles";

export const RolesService = {
  async getRoles(): Promise<Role[]> {
    const res = await axiosInstance.get<ApiResponse<Role[]>>(`${ROLES_BASE}/`);
    // Hide internal team-scoped roles, but keep system roles (admin, member, …)
    // so they're visible in the registry. They render locked and can't be deleted.
    return res.data.data.filter((r) => !r.name.startsWith("team_"));
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
      is_public: data.isPublic ?? false,
      progression_eligible: data.progressionEligible ?? false,
      team_requirement: data.teamRequirement ?? "none",
      team_role_requirement: data.teamRoleRequirement ?? "any",
      requires_contribution: data.requiresContribution ?? false,
      permissions: data.permissions,
    });
    return res.data.data;
  },

  async updateRole(slug: string, data: UpdateRoleInput): Promise<Role> {
    const payload: Record<string, unknown> = {};
    if (data.displayName !== undefined) payload.display_name = data.displayName;
    if (data.description !== undefined) payload.description = data.description;
    if (data.rank !== undefined) payload.rank = data.rank;
    if (data.isPublic !== undefined) payload.is_public = data.isPublic;
    if (data.progressionEligible !== undefined)
      payload.progression_eligible = data.progressionEligible;
    if (data.teamRequirement !== undefined) payload.team_requirement = data.teamRequirement;
    if (data.teamRoleRequirement !== undefined)
      payload.team_role_requirement = data.teamRoleRequirement;
    if (data.requiresContribution !== undefined)
      payload.requires_contribution = data.requiresContribution;
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

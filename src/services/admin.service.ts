import axiosInstance from "@/lib/axios";
import { DESTRUCTIVE_PERMISSIONS } from "@/lib/permissions";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Role {
  id: number;
  name: string;
  displayName: string;
  description: string;
  rank: number;
  permissions: string[];
  isSystem: boolean;
  memberCount: number;
}

export type RoleDetail = Role;

export interface CreateRoleInput {
  name: string;
  displayName: string;
  description?: string;
  rank: number;
  permissions: string[];
}

export interface UpdateRoleInput {
  displayName?: string;
  description?: string;
  rank?: number;
  permissions?: string[];
}

export interface AdminMember {
  id: string;
  communityId: string;
  email: string;
  username: string;
  profilePictureUrl?: string | null;
  coverImageUrl?: string | null;
  isActive: boolean;
  isEmailVerified: boolean;
  isOnboarded: boolean;
  primaryRole: string | null;
  primaryRoleRank: number | null;
  roles: string[];
  fullName: string;
  bio: string | null;
  skills: string[];
  githubHandle: string | null;
  twitterHandle: string | null;
  linkedinUrl: string | null;
  websiteUrl: string | null;
  discipline: string | null;
  experienceLevel: string | null;
  discordUsername: string | null;
  primaryGoal: string | null;
  communityGoals: string[];
  referralSource: string | null;
  dateOfBirth: string | null;
  location: string | null;
  currentRole: string | null;
  memberStatus: string | null;
  createdAt: string;
  updatedAt: string;
  joinedAt: string;
}

export type AdminMemberDetail = AdminMember;

export interface UpdateMemberInput {
  username?: string;
  isEmailVerified?: boolean;
  fullName?: string;
  bio?: string;
  location?: string;
  currentRole?: string;
  memberStatus?: string;
}

export interface PermissionEntry {
  codename: string;
  description: string;
  isDestructive: boolean;
}

export interface MemberListParams {
  search?: string;
  role?: string;
  isEmailVerified?: boolean;
  isActive?: boolean;
}

export interface AdminUserSession {
  id: number;
  userId: string;
  deviceName: string;
  ipAddress: string | null;
  userAgent: string;
  createdAt: string;
  isCurrent: boolean;
}

export interface AdminActivityEntry {
  id: number;
  eventType: string;
  detail: string;
  ipAddress: string | null;
  userAgent: string;
  deviceName: string;
  createdAt: string;
}

// ─── API envelope ─────────────────────────────────────────────────────────────

interface ApiResponse<T> {
  data: T;
  errors: unknown;
  meta: unknown;
}

const ADMIN_BASE = "/auth/admin";

// ─── Admin service ────────────────────────────────────────────────────────────

export const AdminService = {
  // ── Roles ──────────────────────────────────────────────────────────────────

  async getRoles(): Promise<Role[]> {
    const res = await axiosInstance.get<ApiResponse<Role[]>>(`${ADMIN_BASE}/roles/`);
    return res.data.data;
  },

  async getRole(slug: string): Promise<RoleDetail> {
    const res = await axiosInstance.get<ApiResponse<RoleDetail>>(`${ADMIN_BASE}/roles/${slug}/`);
    return res.data.data;
  },

  async createRole(data: CreateRoleInput): Promise<Role> {
    const res = await axiosInstance.post<ApiResponse<Role>>(`${ADMIN_BASE}/roles/`, {
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
    const res = await axiosInstance.patch<ApiResponse<Role>>(
      `${ADMIN_BASE}/roles/${slug}/`,
      payload
    );
    return res.data.data;
  },

  async deleteRole(slug: string): Promise<void> {
    await axiosInstance.delete(`${ADMIN_BASE}/roles/${slug}/`);
  },

  async assignRole(userId: string, roleName: string): Promise<void> {
    await axiosInstance.post(`${ADMIN_BASE}/roles/assign/`, {
      user_id: userId,
      role: roleName,
    });
  },

  async revokeRole(userId: string, roleName: string): Promise<void> {
    await axiosInstance.post(`${ADMIN_BASE}/roles/revoke/`, {
      user_id: userId,
      role: roleName,
    });
  },

  // ── Members ────────────────────────────────────────────────────────────────

  async getAdminMembers(params?: MemberListParams): Promise<AdminMember[]> {
    const res = await axiosInstance.get<ApiResponse<AdminMember[]>>(`${ADMIN_BASE}/users/`, {
      params: {
        ...(params?.search ? { search: params.search } : {}),
      },
    });
    return res.data.data;
  },

  async getAdminMember(identifier: string): Promise<AdminMemberDetail> {
    const res = await axiosInstance.get<ApiResponse<AdminMemberDetail>>(
      `${ADMIN_BASE}/users/${identifier}/`
    );
    return res.data.data;
  },

  async updateAdminMember(identifier: string, data: UpdateMemberInput): Promise<AdminMemberDetail> {
    // Convert camelCase to snake_case for the backend
    const payload: Record<string, unknown> = {};
    if (data.username !== undefined) payload.username = data.username;
    if (data.isEmailVerified !== undefined) payload.is_email_verified = data.isEmailVerified;
    if (data.fullName !== undefined) payload.full_name = data.fullName;
    if (data.bio !== undefined) payload.bio = data.bio;
    if (data.location !== undefined) payload.location = data.location;
    if (data.memberStatus !== undefined) payload.member_status = data.memberStatus;
    if (data.currentRole !== undefined) payload.current_role = data.currentRole;

    const res = await axiosInstance.patch<ApiResponse<AdminMemberDetail>>(
      `${ADMIN_BASE}/users/${identifier}/`,
      payload
    );
    return res.data.data;
  },

  async suspendMember(id: string): Promise<AdminMemberDetail> {
    const res = await axiosInstance.post<ApiResponse<AdminMemberDetail>>(
      `${ADMIN_BASE}/users/${id}/suspend/`
    );
    return res.data.data;
  },

  async reactivateMember(id: string): Promise<AdminMemberDetail> {
    const res = await axiosInstance.post<ApiResponse<AdminMemberDetail>>(
      `${ADMIN_BASE}/users/${id}/reactivate/`
    );
    return res.data.data;
  },

  async deleteMember(id: string): Promise<void> {
    await axiosInstance.delete(`${ADMIN_BASE}/users/${id}/`);
  },

  // ── Permissions ────────────────────────────────────────────────────────────

  async getPermissions(): Promise<PermissionEntry[]> {
    const res = await axiosInstance.get<ApiResponse<Array<Omit<PermissionEntry, "isDestructive">>>>(
      `${ADMIN_BASE}/permissions/`
    );
    return res.data.data.map((permission) => ({
      ...permission,
      isDestructive: DESTRUCTIVE_PERMISSIONS.has(permission.codename),
    }));
  },

  // ── Sessions ───────────────────────────────────────────────────────────────

  async getAdminUserSessions(userId: string): Promise<AdminUserSession[]> {
    const res = await axiosInstance.get<ApiResponse<AdminUserSession[]>>(
      `${ADMIN_BASE}/users/${userId}/sessions/`
    );
    return res.data.data;
  },

  async revokeAdminUserSession(userId: string, sessionId: number): Promise<void> {
    await axiosInstance.post(`${ADMIN_BASE}/users/${userId}/sessions/${sessionId}/revoke/`);
  },

  async revokeAllAdminUserSessions(userId: string): Promise<{ detail: string }> {
    const res = await axiosInstance.post<ApiResponse<{ detail: string }>>(
      `${ADMIN_BASE}/users/${userId}/sessions/revoke-all/`
    );
    return res.data.data;
  },

  // ── Activity ──────────────────────────────────────────────────────────────

  async getAdminActivity(
    limit = 20,
    offset = 0,
    userId?: string
  ): Promise<{ results: AdminActivityEntry[]; total: number; limit: number; offset: number }> {
    const res = await axiosInstance.get<
      ApiResponse<{
        results: AdminActivityEntry[];
        total: number;
        limit: number;
        offset: number;
      }>
    >(`${ADMIN_BASE}/activity/`, {
      params: {
        limit,
        offset,
        ...(userId ? { user_id: userId } : {}),
      },
    });
    return res.data.data;
  },
};

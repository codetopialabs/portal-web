import axiosInstance from "@/lib/axios";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Role {
    id: number;
    name: string;
    displayName: string;
    description: string;
    permissions: string[];
    isSystem: boolean;
    memberCount: number;
}

export interface RoleMember {
    id: string;
    communityId: string;
    username: string;
    fullName: string;
    profilePictureUrl: string | null;
}

export interface RoleDetail extends Role {
    members: RoleMember[];
}

export interface CreateRoleInput {
    name: string;
    displayName: string;
    description?: string;
    permissions: string[];
}

export interface UpdateRoleInput {
    displayName?: string;
    description?: string;
    permissions?: string[];
}

export interface AdminMember {
    id: string;
    communityId: string;
    email: string;
    username: string;
    fullName: string;
    roles: string[];
    isEmailVerified: boolean;
    joinedAt: string;
}

export interface AdminMemberDetail extends AdminMember {
    bio: string | null;
    discipline: string | null;
    experienceLevel: string | null;
    skills: string[];
    location: string | null;
    discordUsername: string | null;
    githubHandle: string | null;
    twitterHandle: string | null;
    linkedinUrl: string | null;
    websiteUrl: string | null;
    profilePictureUrl: string | null;
    coverImageUrl: string | null;
    primaryGoal: string | null;
    communityGoals: string[];
    memberStatus: string | null;
    currentRole: string | null;
}

export interface UpdateMemberInput {
    fullName?: string;
    bio?: string;
    discipline?: string;
    experienceLevel?: string;
    skills?: string[];
    location?: string;
    discordUsername?: string;
    githubHandle?: string;
    twitterHandle?: string;
    linkedinUrl?: string;
    websiteUrl?: string;
    primaryGoal?: string;
    communityGoals?: string[];
    memberStatus?: string;
    currentRole?: string;
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
}

// ─── API envelope ─────────────────────────────────────────────────────────────

interface ApiResponse<T> {
    data: T;
    errors: unknown;
    meta: unknown;
}

// ─── Admin service ────────────────────────────────────────────────────────────

export const AdminService = {
    // ── Roles ──────────────────────────────────────────────────────────────────

    async getRoles(): Promise<Role[]> {
        const res = await axiosInstance.get<ApiResponse<Role[]>>("/roles/");
        return res.data.data;
    },

    async getRole(id: string): Promise<RoleDetail> {
        const res = await axiosInstance.get<ApiResponse<RoleDetail>>(`/roles/${id}/`);
        return res.data.data;
    },

    async createRole(data: CreateRoleInput): Promise<Role> {
        const res = await axiosInstance.post<ApiResponse<Role>>("/roles/", {
            name: data.name,
            display_name: data.displayName,
            description: data.description ?? "",
            permissions: data.permissions,
        });
        return res.data.data;
    },

    async updateRole(id: string, data: UpdateRoleInput): Promise<Role> {
        const payload: Record<string, unknown> = {};
        if (data.displayName !== undefined) payload.display_name = data.displayName;
        if (data.description !== undefined) payload.description = data.description;
        if (data.permissions !== undefined) payload.permissions = data.permissions;
        const res = await axiosInstance.patch<ApiResponse<Role>>(`/roles/${id}/`, payload);
        return res.data.data;
    },

    async deleteRole(id: string): Promise<void> {
        await axiosInstance.delete(`/roles/${id}/`);
    },

    async assignRole(userId: string, roleId: string): Promise<void> {
        await axiosInstance.post(`/users/${userId}/roles/`, { role_id: roleId });
    },

    async revokeRole(userId: string, roleId: string): Promise<void> {
        await axiosInstance.delete(`/users/${userId}/roles/${roleId}/`);
    },

    // ── Members ────────────────────────────────────────────────────────────────

    async getAdminMembers(params?: MemberListParams): Promise<AdminMember[]> {
        const res = await axiosInstance.get<ApiResponse<AdminMember[]>>("/admin/members/", {
            params: {
                ...(params?.search ? { search: params.search } : {}),
                ...(params?.role ? { role: params.role } : {}),
                ...(params?.isEmailVerified !== undefined
                    ? { is_email_verified: params.isEmailVerified }
                    : {}),
            },
        });
        return res.data.data;
    },

    async getAdminMember(id: string): Promise<AdminMemberDetail> {
        const res = await axiosInstance.get<ApiResponse<AdminMemberDetail>>(
            `/admin/members/${id}/`
        );
        return res.data.data;
    },

    async updateAdminMember(id: string, data: UpdateMemberInput): Promise<AdminMemberDetail> {
        // Convert camelCase to snake_case for the backend
        const payload: Record<string, unknown> = {};
        if (data.fullName !== undefined) payload.full_name = data.fullName;
        if (data.bio !== undefined) payload.bio = data.bio;
        if (data.discipline !== undefined) payload.discipline = data.discipline;
        if (data.experienceLevel !== undefined) payload.experience_level = data.experienceLevel;
        if (data.skills !== undefined) payload.skills = data.skills;
        if (data.location !== undefined) payload.location = data.location;
        if (data.discordUsername !== undefined) payload.discord_username = data.discordUsername;
        if (data.githubHandle !== undefined) payload.github_handle = data.githubHandle;
        if (data.twitterHandle !== undefined) payload.twitter_handle = data.twitterHandle;
        if (data.linkedinUrl !== undefined) payload.linkedin_url = data.linkedinUrl;
        if (data.websiteUrl !== undefined) payload.website_url = data.websiteUrl;
        if (data.primaryGoal !== undefined) payload.primary_goal = data.primaryGoal;
        if (data.communityGoals !== undefined) payload.community_goals = data.communityGoals;
        if (data.memberStatus !== undefined) payload.member_status = data.memberStatus;
        if (data.currentRole !== undefined) payload.current_role = data.currentRole;

        const res = await axiosInstance.patch<ApiResponse<AdminMemberDetail>>(
            `/admin/members/${id}/`,
            payload
        );
        return res.data.data;
    },

    async deactivateMember(id: string): Promise<void> {
        await axiosInstance.post(`/admin/members/${id}/deactivate/`);
    },

    // ── Permissions ────────────────────────────────────────────────────────────

    async getPermissions(): Promise<PermissionEntry[]> {
        const res = await axiosInstance.get<ApiResponse<PermissionEntry[]>>("/permissions/");
        return res.data.data;
    },
};

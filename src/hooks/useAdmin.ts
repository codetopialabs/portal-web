"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AdminService,
  type CreateRoleInput,
  type MemberListParams,
  type UpdateMemberInput,
  type UpdateRoleInput,
} from "@/services/admin.service";

// ─── Query keys ───────────────────────────────────────────────────────────────

export const adminKeys = {
  roles: ["admin", "roles"] as const,
  role: (slug: string) => ["admin", "roles", slug] as const,
  usersRoot: ["admin", "users"] as const,
  users: (params?: MemberListParams) => ["admin", "users", params] as const,
  user: (id: string) => ["admin", "users", id] as const,
  userSessions: (id: string) => ["admin", "users", id, "sessions"] as const,
  activity: (params?: { userId?: string; page?: number; limit?: number }) =>
    ["admin", "activity", params] as const,
  permissions: ["admin", "permissions"] as const,
};

// ─── Roles ────────────────────────────────────────────────────────────────────

export function useRoles() {
  return useQuery({
    queryKey: adminKeys.roles,
    queryFn: () => AdminService.getRoles(),
  });
}

export function useRole(slug: string) {
  return useQuery({
    queryKey: adminKeys.role(slug),
    queryFn: () => AdminService.getRole(slug),
    enabled: !!slug,
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRoleInput) => AdminService.createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.roles });
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: UpdateRoleInput }) =>
      AdminService.updateRole(slug, data),
    onSuccess: (_result, { slug }) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.roles });
      queryClient.invalidateQueries({ queryKey: adminKeys.role(slug) });
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => AdminService.deleteRole(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.roles });
    },
  });
}

// ─── Role assignment ──────────────────────────────────────────────────────────

export function useAssignRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, roleName }: { userId: string; roleName: string }) =>
      AdminService.assignRole(userId, roleName),
    onSuccess: (_result, { userId }) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.user(userId) });
      queryClient.invalidateQueries({ queryKey: adminKeys.usersRoot });
      queryClient.invalidateQueries({ queryKey: ["community-members"] });
      queryClient.invalidateQueries({ queryKey: adminKeys.roles });
    },
  });
}

export function useRevokeRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, roleName }: { userId: string; roleName: string }) =>
      AdminService.revokeRole(userId, roleName),
    onSuccess: (_result, { userId }) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.user(userId) });
      queryClient.invalidateQueries({ queryKey: adminKeys.usersRoot });
      queryClient.invalidateQueries({ queryKey: ["community-members"] });
      queryClient.invalidateQueries({ queryKey: adminKeys.roles });
    },
  });
}

// ─── Members ──────────────────────────────────────────────────────────────────

export function useAdminMembers(params?: MemberListParams) {
  return useQuery({
    queryKey: adminKeys.users(params),
    queryFn: () => AdminService.getAdminMembers(params),
  });
}

export function useAdminMember(id: string) {
  return useQuery({
    queryKey: adminKeys.user(id),
    queryFn: () => AdminService.getAdminMember(id),
    enabled: !!id,
  });
}

export function useUpdateAdminMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMemberInput }) =>
      AdminService.updateAdminMember(id, data),
    onSuccess: (_result, { id }) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.user(id) });
      queryClient.invalidateQueries({ queryKey: adminKeys.usersRoot });
      queryClient.invalidateQueries({ queryKey: ["community-members"] });
    },
  });
}

export function useSuspendMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => AdminService.suspendMember(id),
    onSuccess: (_result, id) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.user(id) });
      queryClient.invalidateQueries({ queryKey: adminKeys.usersRoot });
      queryClient.invalidateQueries({ queryKey: ["community-members"] });
    },
  });
}

export function useReactivateMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => AdminService.reactivateMember(id),
    onSuccess: (_result, id) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.user(id) });
      queryClient.invalidateQueries({ queryKey: adminKeys.usersRoot });
      queryClient.invalidateQueries({ queryKey: ["community-members"] });
    },
  });
}

export function useDeleteMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => AdminService.deleteMember(id),
    onSuccess: (_result, id) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.user(id) });
      queryClient.invalidateQueries({ queryKey: adminKeys.usersRoot });
      queryClient.invalidateQueries({ queryKey: ["community-members"] });
    },
  });
}

// ─── Admin sessions ─────────────────────────────────────────────────────────

export function useAdminUserSessions(id: string, enabled = true) {
  return useQuery({
    queryKey: adminKeys.userSessions(id),
    queryFn: () => AdminService.getAdminUserSessions(id),
    enabled: !!id && enabled,
  });
}

export function useRevokeAdminUserSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, sessionId }: { userId: string; sessionId: number }) =>
      AdminService.revokeAdminUserSession(userId, sessionId),
    onSuccess: (_result, { userId }) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.userSessions(userId) });
    },
  });
}

export function useRevokeAllAdminUserSessions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => AdminService.revokeAllAdminUserSessions(userId),
    onSuccess: (_result, userId) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.userSessions(userId) });
    },
  });
}

// ─── Admin activity ─────────────────────────────────────────────────────────

export function useAdminActivity(
  params: { limit?: number; offset?: number; userId?: string },
  enabled = true
) {
  return useQuery({
    queryKey: adminKeys.activity({
      userId: params.userId,
      page: params.offset,
      limit: params.limit,
    }),
    queryFn: () => AdminService.getAdminActivity(params.limit, params.offset, params.userId),
    enabled,
  });
}

// ─── Permissions ──────────────────────────────────────────────────────────────

export function usePermissionList() {
  return useQuery({
    queryKey: adminKeys.permissions,
    queryFn: () => AdminService.getPermissions(),
  });
}

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ME_QUERY_KEY } from "@/hooks/useMe";
import { ActivityService } from "@/services/activity.service";
import { PermissionsService } from "@/services/permissions.service";
import { RolesService } from "@/services/roles.service";
import { UsersService } from "@/services/users.service";
import type { CreateRoleInput, UpdateRoleInput } from "@/types/roles.types";
import type { MemberListParams, UpdateMemberInput } from "@/types/users.types";

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
    queryFn: () => RolesService.getRoles(),
  });
}

export function useRole(slug: string) {
  return useQuery({
    queryKey: adminKeys.role(slug),
    queryFn: () => RolesService.getRole(slug),
    enabled: !!slug,
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRoleInput) => RolesService.createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.roles });
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: UpdateRoleInput }) =>
      RolesService.updateRole(slug, data),
    onSuccess: (_result, { slug }) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.roles });
      queryClient.invalidateQueries({ queryKey: adminKeys.role(slug) });
      // Role permissions changed — current user's permissions may be stale.
      queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY });
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => RolesService.deleteRole(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.roles });
      // A role was deleted — current user may have held it.
      queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY });
    },
  });
}

// ─── Role assignment ──────────────────────────────────────────────────────────

export function useAssignRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, roleName }: { userId: string; roleName: string }) =>
      RolesService.assignRole(userId, roleName),
    onSuccess: (_result, { userId }) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.user(userId) });
      queryClient.invalidateQueries({ queryKey: adminKeys.usersRoot });
      queryClient.invalidateQueries({ queryKey: ["community-members"] });
      queryClient.invalidateQueries({ queryKey: adminKeys.roles });
      // The target user's permissions changed — if they're the current user, refresh me.
      queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY });
    },
  });
}

export function useRevokeRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, roleName }: { userId: string; roleName: string }) =>
      RolesService.revokeRole(userId, roleName),
    onSuccess: (_result, { userId }) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.user(userId) });
      queryClient.invalidateQueries({ queryKey: adminKeys.usersRoot });
      queryClient.invalidateQueries({ queryKey: ["community-members"] });
      queryClient.invalidateQueries({ queryKey: adminKeys.roles });
      // The target user's permissions changed — if they're the current user, refresh me.
      queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY });
    },
  });
}

// ─── Members ──────────────────────────────────────────────────────────────────

export function useAdminMembers(params?: MemberListParams) {
  return useQuery({
    queryKey: adminKeys.users(params),
    queryFn: () => UsersService.getUsers(params),
  });
}

export function useAdminMember(id: string) {
  return useQuery({
    queryKey: adminKeys.user(id),
    queryFn: () => UsersService.getUser(id),
    enabled: !!id,
  });
}

export function useUpdateAdminMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMemberInput }) =>
      UsersService.updateUser(id, data),
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
    mutationFn: (id: string) => UsersService.suspendUser(id),
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
    mutationFn: (id: string) => UsersService.reactivateUser(id),
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
    mutationFn: (id: string) => UsersService.deleteUser(id),
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
    queryFn: () => UsersService.getUserSessions(id),
    enabled: !!id && enabled,
  });
}

export function useRevokeAdminUserSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, sessionId }: { userId: string; sessionId: number }) =>
      UsersService.revokeUserSession(userId, sessionId),
    onSuccess: (_result, { userId }) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.userSessions(userId) });
    },
  });
}

export function useRevokeAllAdminUserSessions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => UsersService.revokeAllUserSessions(userId),
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
    queryFn: () => ActivityService.getAllActivity(params.limit, params.offset, params.userId),
    enabled,
  });
}

// ─── Permissions ──────────────────────────────────────────────────────────────

export function usePermissionList() {
  return useQuery({
    queryKey: adminKeys.permissions,
    queryFn: () => PermissionsService.getPermissions(),
  });
}

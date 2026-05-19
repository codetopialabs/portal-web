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
  role: (id: string) => ["admin", "roles", id] as const,
  membersRoot: ["admin", "members"] as const,
  members: (params?: MemberListParams) => ["admin", "members", params] as const,
  member: (id: string) => ["admin", "members", id] as const,
  permissions: ["admin", "permissions"] as const,
};

// ─── Roles ────────────────────────────────────────────────────────────────────

export function useRoles() {
  return useQuery({
    queryKey: adminKeys.roles,
    queryFn: () => AdminService.getRoles(),
  });
}

export function useRole(id: string) {
  return useQuery({
    queryKey: adminKeys.role(id),
    queryFn: () => AdminService.getRole(id),
    enabled: !!id,
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
    mutationFn: ({ id, data }: { id: string; data: UpdateRoleInput }) =>
      AdminService.updateRole(id, data),
    onSuccess: (_result, { id }) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.roles });
      queryClient.invalidateQueries({ queryKey: adminKeys.role(id) });
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => AdminService.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.roles });
    },
  });
}

// ─── Role assignment ──────────────────────────────────────────────────────────

export function useAssignRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      AdminService.assignRole(userId, roleId),
    onSuccess: (_result, { userId }) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.member(userId) });
      queryClient.invalidateQueries({ queryKey: adminKeys.membersRoot });
      queryClient.invalidateQueries({ queryKey: ["community-members"] });
      queryClient.invalidateQueries({ queryKey: adminKeys.roles });
    },
  });
}

export function useRevokeRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      AdminService.revokeRole(userId, roleId),
    onSuccess: (_result, { userId }) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.member(userId) });
      queryClient.invalidateQueries({ queryKey: adminKeys.membersRoot });
      queryClient.invalidateQueries({ queryKey: ["community-members"] });
      queryClient.invalidateQueries({ queryKey: adminKeys.roles });
    },
  });
}

// ─── Members ──────────────────────────────────────────────────────────────────

export function useAdminMembers(params?: MemberListParams) {
  return useQuery({
    queryKey: adminKeys.members(params),
    queryFn: () => AdminService.getAdminMembers(params),
  });
}

export function useAdminMember(id: string) {
  return useQuery({
    queryKey: adminKeys.member(id),
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
      queryClient.invalidateQueries({ queryKey: adminKeys.member(id) });
      queryClient.invalidateQueries({ queryKey: adminKeys.membersRoot });
      queryClient.invalidateQueries({ queryKey: ["community-members"] });
    },
  });
}

export function useDeactivateMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => AdminService.deactivateMember(id),
    onSuccess: (_result, id) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.member(id) });
      queryClient.invalidateQueries({ queryKey: adminKeys.membersRoot });
      queryClient.invalidateQueries({ queryKey: ["community-members"] });
    },
  });
}

// ─── Permissions ──────────────────────────────────────────────────────────────

export function usePermissionList() {
  return useQuery({
    queryKey: adminKeys.permissions,
    queryFn: () => AdminService.getPermissions(),
  });
}

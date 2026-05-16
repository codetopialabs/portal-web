"use client";

import { useUserStore } from "@/store/user.store";
import { resolvePermission } from "@/lib/permissions";

/**
 * Check if the current user has a specific permission.
 *
 * Implements the full wildcard resolver matching backend logic:
 * 1. Destructive permission → exact match only
 * 2. "*" in set → true
 * 3. Exact match → true
 * 4. "resource.*" in set → true
 * 5. "*.action" in set → true
 * 6. false
 *
 * Usage:
 *   const canManageRoles = usePermission("roles.edit");
 *   const canDeactivate = usePermission("members.deactivate"); // destructive — exact only
 */
export function usePermission(permission: string): boolean {
  const permissions = useUserStore((s) => s.profile?.permissions ?? EMPTY_PERMISSIONS);
  return resolvePermission(permission, permissions);
}

export function useRole(roleName: string): boolean {
  const roles = useUserStore((s) => s.profile?.roles ?? []);
  return roles.includes(roleName);
}

const EMPTY_PERMISSIONS: string[] = [];

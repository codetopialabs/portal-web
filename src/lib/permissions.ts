/**
 * Permission system utilities.
 *
 * Mirrors the backend wildcard resolver in apps/common/permissions.py.
 * The frontend check is UX-only â€” the backend enforces the same logic independently.
 */

// Permissions that must be explicitly listed in a role â€” wildcards never grant them.
export const DESTRUCTIVE_PERMISSIONS = new Set<string>([
  "users.delete",
  "users.suspend",
  "roles.delete",
  "oauth_apps.delete",
]);

/**
 * Route â†’ Permission map.
 * Every protected Next.js route declares its required permission.
 * "authenticated" means any verified, onboarded member can access it.
 * RouteGuard reads this map and redirects to "/" if the check fails.
 */
export const ROUTE_PERMISSIONS: Record<string, string | "authenticated"> = {
  "/": "authenticated",
  "/admin": "admin.panel.access",
  "/admin/roles": "roles.view",
  "/admin/roles/new": "roles.create",
  "/admin/roles/[slug]": "roles.view",
  "/admin/roles/[slug]/edit": "roles.edit",
  "/admin/members": "users.view",
  "/admin/members/[username]": "users.view",
  "/admin/members/[username]/edit": "users.edit",
  "/admin/api-keys": "api_keys.view",
  "/admin/oauth-apps": "oauth_apps.view",
  "/admin/oauth-apps/new": "oauth_apps.create",
  "/admin/reflections": "reflections.view_any",
  "/admin/career-progressions": "career_progressions.review",
  "/admin/reflections/questions": "reflections.manage",
  "/admin/github-repos": "github_repos.manage",
  "/admin/teams": "admin.panel.access",
  "/admin/teams/[teamSlug]": "admin.panel.access",
  "/reflections": "reflections.submit",
  "/reflections/submit": "reflections.submit",
  "/settings/profile": "profile.edit",
  "/settings/career": "career_progressions.submit",
  "/settings/security": "security.view",
  "/settings/apps": "authenticated",
  "/community": "authenticated",
  "/mentorship": "authenticated",
  "/resources": "authenticated",
  "/teams": "teams.view",
  "/teams/new": "teams.create",
  "/teams/browse": "authenticated",
  "/activity": "activity.view",
  "/docs": "docs.view",
};

// Dynamic route patterns (checked separately in RouteGuard)
export const DYNAMIC_ROUTE_PERMISSIONS: Array<{
  pattern: RegExp;
  permission: string | "authenticated";
}> = [
  // Public member profiles live at /<username> (no "@" prefix — the previous
  // pattern here never matched anything real). Exclude every reserved
  // top-level route name so a real username can't collide with them.
  {
    pattern:
      /^\/(?!admin|community|mentorship|resources|settings|teams|activity|docs|reflections|login|signup|forgot-password|reset-password|verify-email|onboarding|authorize|discord)[^/]+$/,
    permission: "profile.view",
  },
  { pattern: /^\/teams\/[^/]+(\/.*)?$/, permission: "authenticated" }, // Scoped checks handled in-page or by backend
  { pattern: /^\/admin\/roles\/[^/]+\/edit$/, permission: "roles.edit" },
  { pattern: /^\/admin\/roles\/[^/]+$/, permission: "roles.view" },
  { pattern: /^\/admin\/members\/[^/]+\/edit$/, permission: "users.edit" },
  { pattern: /^\/admin\/members\/[^/]+$/, permission: "users.view" },
  { pattern: /^\/admin\/oauth-apps\/[^/]+\/edit$/, permission: "oauth_apps.edit" },
  { pattern: /^\/admin\/oauth-apps\/[^/]+$/, permission: "oauth_apps.view" },
  { pattern: /^\/docs(\/.*)?$/, permission: "docs.view" },
];

/**
 * Resolve whether a permission is granted given a permission set.
 *
 * Wildcard resolution order (mirrors backend):
 * 1. Destructive permission â†’ exact match only, no wildcards
 * 2. "*" in set â†’ true
 * 3. Exact match â†’ true
 * 4. "resource.*" in set â†’ true
 * 5. "*.action" in set â†’ true
 * 6. false
 */
export function resolvePermission(permission: string, permissionSet: string[]): boolean {
  const set = new Set(permissionSet);

  // 1. Exact match always wins (even for destructive)
  if (set.has(permission)) return true;

  // 2. Destructive permissions require exact match â€” no wildcard expansion
  if (DESTRUCTIVE_PERMISSIONS.has(permission)) {
    return false;
  }

  // 3. "*" grants all non-destructive permissions
  if (set.has("*")) return true;

  // 4. "resource.*" in set (e.g. "users.*" covers "users.edit")
  const dotIndex = permission.indexOf(".");
  if (dotIndex !== -1) {
    const resource = permission.substring(0, dotIndex);
    const action = permission.substring(dotIndex + 1);

    if (set.has(`${resource}.*`)) return true;

    // 5. "*.action" in set (e.g. "*.view" covers "users.view")
    if (set.has(`*.${action}`)) return true;
  }

  return false;
}

/**
 * Get the required permission for a given pathname.
 * Returns null if the route is not in the map (public route).
 */
export function getRoutePermission(pathname: string): string | "authenticated" | null {
  // Check static routes first
  if (pathname in ROUTE_PERMISSIONS) {
    return ROUTE_PERMISSIONS[pathname];
  }

  // Check dynamic route patterns
  for (const { pattern, permission } of DYNAMIC_ROUTE_PERMISSIONS) {
    if (pattern.test(pathname)) {
      return permission;
    }
  }

  return null;
}

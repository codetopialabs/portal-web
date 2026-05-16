/**
 * Permission system utilities.
 *
 * Mirrors the backend wildcard resolver in apps/common/permissions.py.
 * The frontend check is UX-only — the backend enforces the same logic independently.
 */

// Permissions that must be explicitly listed in a role — wildcards never grant them.
export const DESTRUCTIVE_PERMISSIONS = new Set<string>([
    "members.deactivate",
    "roles.delete",
]);

/**
 * Route → Permission map.
 * Every protected Next.js route declares its required permission.
 * "authenticated" means any verified, onboarded member can access it.
 * RouteGuard reads this map and redirects to "/" if the check fails.
 */
export const ROUTE_PERMISSIONS: Record<string, string | "authenticated"> = {
    "/": "authenticated",
    "/admin": "admin.panel.access",
    "/admin/roles": "roles.view",
    "/admin/roles/new": "roles.create",
    "/admin/roles/[id]": "roles.view",
    "/admin/roles/[id]/edit": "roles.edit",
    "/admin/members": "members.view",
    "/admin/members/[id]": "members.view",
    "/admin/members/[id]/edit": "members.edit",
    "/settings/profile": "profile.edit",
    "/settings/security": "security.view",
    "/settings/apps": "authenticated",
    "/community": "authenticated",
    "/programs": "authenticated",
    "/mentorship": "authenticated",
    "/resources": "authenticated",
    "/activity": "activity.view",
    "/docs": "docs.view",
};

// Dynamic route patterns (checked separately in RouteGuard)
export const DYNAMIC_ROUTE_PERMISSIONS: Array<{
    pattern: RegExp;
    permission: string | "authenticated";
}> = [
        { pattern: /^\/members\/[^/]+\/public-profile$/, permission: "profile.view" },
        { pattern: /^\/admin\/roles\/[^/]+\/edit$/, permission: "roles.edit" },
        { pattern: /^\/admin\/roles\/[^/]+$/, permission: "roles.view" },
        { pattern: /^\/admin\/members\/[^/]+\/edit$/, permission: "members.edit" },
        { pattern: /^\/admin\/members\/[^/]+$/, permission: "members.view" },
        { pattern: /^\/docs(\/.*)?$/, permission: "docs.view" },
    ];

/**
 * Resolve whether a permission is granted given a permission set.
 *
 * Wildcard resolution order (mirrors backend):
 * 1. Destructive permission → exact match only, no wildcards
 * 2. "*" in set → true
 * 3. Exact match → true
 * 4. "resource.*" in set → true
 * 5. "*.action" in set → true
 * 6. false
 */
export function resolvePermission(
    permission: string,
    permissionSet: string[]
): boolean {
    const set = new Set(permissionSet);

    // 1. Destructive permissions require exact match — no wildcard expansion
    if (DESTRUCTIVE_PERMISSIONS.has(permission)) {
        return set.has(permission);
    }

    // 2. "*" grants all non-destructive permissions
    if (set.has("*")) return true;

    // 3. Exact match
    if (set.has(permission)) return true;

    // 4. "resource.*" in set (e.g. "members.*" covers "members.edit")
    const dotIndex = permission.indexOf(".");
    if (dotIndex !== -1) {
        const resource = permission.substring(0, dotIndex);
        const action = permission.substring(dotIndex + 1);

        if (set.has(`${resource}.*`)) return true;

        // 5. "*.action" in set (e.g. "*.view" covers "members.view")
        if (set.has(`*.${action}`)) return true;
    }

    return false;
}

/**
 * Get the required permission for a given pathname.
 * Returns null if the route is not in the map (public route).
 */
export function getRoutePermission(
    pathname: string
): string | "authenticated" | null {
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

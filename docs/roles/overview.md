# Roles Overview

Roles are how permissions get assigned to members. A role is a named bundle of permission codenames. Admins create roles, attach permissions to them, and assign them to members.

## How roles work

- A role has a **name** (slug, unique, e.g. `community-manager`), a **display name**, an optional description, and a list of permission codenames.
- A member can hold multiple roles at once.
- The member's effective permissions are the union of all permissions across all their roles.
- Roles are created and managed entirely through the Admin Panel — no code deployment needed.

## Creating a role

1. Go to Admin Panel → Roles → New Role
2. Enter a name (slug format, e.g. `event-organizer`), display name, and description
3. Select permissions from the master permission list — permissions are grouped by resource namespace
4. Save — the role is immediately available to assign to members

## Assigning a role

1. Go to Admin Panel → Members → find the member
2. Click "Assign Role" and select from the available roles
3. The member's portal updates within 30 seconds — new sections appear automatically

## Wildcard permissions in roles

You can use wildcards when building a role to grant broad access:

```
members.*   → all members permissions (except destructive)
*.view      → view access on every resource
*           → everything (except destructive) — use carefully
```

Destructive permissions (`members.deactivate`, `roles.delete`) must always be listed explicitly.

## Primary Community Role

Members holding multiple community roles can select a single **Primary Community Role** that best identifies them to the community:
1. Go to Settings → Profile
2. Under "Personal Info", find the **Primary Community Role** dropdown
3. Select from your assigned roles to set it as your primary identifier
4. Save Changes

This primary role will be displayed as the main badge on your Public Profile and in the Community Member Directory. Other assigned roles continue to be displayed inside the "Community roles" list on your profile card.

## System roles

Some roles are marked as system roles and cannot be deleted. See [System Roles](./system-roles.md).

## See also

- [Permission List](../permissions/permission-list.md)
- [Role Builder (Admin)](../admin/role-builder.md)

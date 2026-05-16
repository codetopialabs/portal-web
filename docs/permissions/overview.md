---
title: Permission System Overview
category: permissions
order: 1
---

# Permission System Overview

The Codetopia portal uses a role-based permission system where every action — viewing a page, calling an API, clicking a button — is gated by a permission codename.

## How it works

1. An admin creates a **Role** and attaches a list of permission codenames to it (e.g. `members.view`, `roles.assign`).
2. The admin assigns that role to a member.
3. When the member logs in, the portal fetches their full **Permission Set** — the combined list of all permissions from all their roles.
4. Every page, button, and API call checks that Permission Set before allowing the action.

A member can hold multiple roles at once. Their Permission Set is the union of all permissions across all their roles.

## Permission codename format

All codenames follow `resource.action` format:

```
members.view       → view the member list
members.edit       → edit any member's profile
roles.create       → create a new role
admin.panel.access       → access the admin panel
```

## Wildcard permissions

Roles can use wildcards to grant broad access without listing every codename:

| Wildcard | What it grants |
|---|---|
| `*` | Everything (except destructive permissions) |
| `members.*` | All `members.*` permissions (except destructive) |
| `*.view` | The `.view` action on every resource |

## Destructive permissions

Some actions are irreversible. These **must be listed explicitly** in a role — wildcards never grant them:

- `members.deactivate` — deactivate a member account
- `roles.delete` — permanently delete a role

## Where permissions are enforced

- **Backend:** Every API endpoint has a `HasPermission("codename")` check. A missing permission returns HTTP 403.
- **Frontend:** The `usePermission("codename")` hook returns `true` or `false`. UI elements that require a permission are hidden (not disabled) when the check fails.

The backend is the real enforcer. The frontend check is purely for UX — hiding things the member can't use.

## See also

- [Permission List](./permission-list.md) — every codename and what it grants
- [Route Map](./route-map.md) — which permission each page requires

# Role Builder

The role builder lets admins create and edit roles without any code changes.

## Creating a role

1. Go to Admin Panel → Roles → New Role
2. Fill in:
   - **Name** — a unique slug, e.g. `event_organizer` (lowercase letters, numbers, and underscores)
   - **Display name** — human-readable, e.g. "Event Organizer"
   - **Description** — optional, explains what this role is for
3. Select permissions from the master list — permissions are grouped by resource namespace (e.g. all `members.*` permissions together, all `roles.*` together)
4. Click Create Role

The role is immediately available to assign to members.

## Editing a role

1. Go to Admin Panel → Roles → click the role name
2. Edit the display name, description, or permissions
3. Save — changes take effect immediately for all members who hold the role

## Deleting a role

Roles can be deleted unless they are system roles (`member`, `core_member`). Deleting a role removes it from all members who hold it — their permissions update immediately.

## Using wildcards

When selecting permissions, you can type a wildcard directly:

- `members.*` — grants all members permissions except destructive ones
- `*.view` — grants view access on every resource
- `*` — grants everything except destructive permissions

Wildcards are stored as-is in the role's permission list and resolved at check time.

## Destructive permissions

`members.deactivate` and `roles.delete` must be selected explicitly — they do not appear when a wildcard is used. They are highlighted in the permission picker to make them easy to identify.

## See also

- [Permission List](../permissions/permission-list.md)
- [Member Management](./member-management.md)

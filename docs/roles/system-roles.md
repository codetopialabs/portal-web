# System Roles

System roles are built-in roles that cannot be deleted. They are seeded automatically when the backend is set up.

> **When adding a new system role:** update this file and add a seed entry in the backend migration.

## Current system roles

### `member`

Auto-assigned to every new member on registration.

| Property | Value |
|---|---|
| Name | `member` |
| Display name | Member |
| System role | Yes — cannot be deleted |
| Default permissions | `profile.view`, `profile.edit` |

Every registered, verified member has this role. It grants access to the basic portal (dashboard, public profiles, settings).

---

### `core_member`

Elevated role assigned by admins to trusted community members.

| Property | Value |
|---|---|
| Name | `core_member` |
| Display name | Core Member |
| System role | Yes — cannot be deleted |
| Default permissions | `profile.view`, `profile.edit` + access to all registered OAuth clients |

Core members can log into all external systems connected to Codetopia via OAuth. Regular members can only log into systems that explicitly allow `member`-level access.

---

## Adding a new system role

1. Define the role in the backend seed/migration
2. Set `is_system = True` on the `CommunityRole` record
3. Add it to this file with its name, display name, and default permissions
4. Update `docs/changelog.md`

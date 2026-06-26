---
title: Master Permission List
category: permissions
order: 2
---

# Permission List

Every permission codename in the system. This list is the source of truth for what actions exist.

Permissions are served to the frontend via `GET /api/v1/auth/admin/permissions/` — the admin role builder reads from this endpoint.

> **When adding a new permission:** add it here, in `AGENTS.md`, and in `apps/common/permissions.py` on the backend.

## Current permissions

| Codename | Description | Destructive |
|---|---|---|
| `admin.panel.access` | Access the admin panel | No |
| `users.view` | View all users in the system | No |
| `users.create` | Create a new user manually | No |
| `users.edit` | Edit another user's profile/data | No |
| `users.delete` | Delete a user permanently | **Yes** |
| `users.suspend` | Suspend/deactivate a user account | **Yes** |
| `users.reactivate` | Reactivate a suspended user account | No |
| `roles.view` | View all roles | No |
| `roles.create` | Create new roles | No |
| `roles.edit` | Edit existing roles | No |
| `roles.delete` | Delete a role | **Yes** |
| `roles.assign` | Assign roles to members | No |
| `roles.revoke` | Remove roles from members | No |
| `profile.view` | View public profiles | No |
| `profile.edit` | Edit own profile | No |
| `profiles.view` | View managed profile records | No |
| `profiles.edit` | Edit another user's profile details | No |
| `permissions.view` | View the master permission list | No |
| `permissions.assign` | Grant a permission directly to a user | No |
| `permissions.revoke` | Revoke a directly-granted permission from a user | No |
| `api_keys.view` | View API keys and their scopes | No |
| `api_keys.create` | Create an API key for external integrations | No |
| `api_keys.revoke` | Revoke an API key | No |
| `reflections.submit` | Submit your own monthly reflection | No |
| `reflections.view_any` | View all members' collated reflections | No |
| `reflections.review` | Approve or request changes on a reflection | No |
| `reflections.manage` | Manage reflection questions and cycles | No |
| `activity.view` | View own activity log | No |
| `activity.view_any` | View activity logs for other users | No |
| `security.view` | View own active sessions | No |
| `security.revoke` | Revoke own sessions | No |
| `sessions.view_any` | View sessions for other users | No |
| `sessions.revoke_any` | Revoke sessions for other users | No |
| `docs.view` | View the community documentation portal | No |

## Planned permissions (Coming Soon features)

These will be added when the corresponding features are built:

| Codename | Feature |
|---|---|
| `events.create` | Events |
| `events.edit_own` | Events |
| `events.edit_any` | Events |
| `events.delete_any` | Events (destructive) |
| `programs.create` | Programs |
| `programs.enroll_member` | Programs |
| `mentorship.view` | Mentorship |
| `mentorship.assign_mentee` | Mentorship |
| `mentor.access` | Mentor tools |
| `organizer.access` | Organizer tools |
| `feed.post` | Activity feed |
| `feed.moderate` | Activity feed |
| `announcements.create` | Announcements |
| `xp.award_manual` | XP system (destructive) |
| `api_keys.manage` | API key management |

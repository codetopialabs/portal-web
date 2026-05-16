# Route → Permission Map

Every protected page in the portal and the permission required to access it.

If a member navigates to a route they don't have permission for, they are redirected to the dashboard home (`/`).

> **When adding a new route:** add it here, in `AGENTS.md`, and in `src/lib/permissions.ts`.

## Current routes

| Route | Required Permission | Notes |
|---|---|---|
| `/` (dashboard) | authenticated | Any verified, onboarded member |
| `/admin` | `admin.panel.access` | Any member with this permission, regardless of role name |
| `/admin/roles` | `roles.view` | |
| `/admin/roles/new` | `roles.create` | |
| `/admin/roles/[id]` | `roles.view` | |
| `/admin/roles/[id]/edit` | `roles.edit` | |
| `/admin/members` | `members.view` | |
| `/admin/members/[id]` | `members.view` | |
| `/admin/members/[id]/edit` | `members.edit` | |
| `/members/[username]/public-profile` | `profile.view` | Any authenticated member |
| `/settings/profile` | authenticated | Own profile only |
| `/settings/security` | authenticated | Own sessions only |

## Auth routes (no permission required)

These routes are accessible without being logged in:

| Route | Purpose |
|---|---|
| `/login` | Sign in |
| `/signup` | Register |
| `/forgot-password` | Request password reset |
| `/reset-password` | Set new password via reset link |
| `/verify-email` | Verify email address |
| `/onboarding` | Complete profile after first verification |

---
title: Route Permission Map
category: Permissions
order: 3
---

# Route Permission Map

Every protected page in the portal declares the permission required to access it. If a member is signed in but does not have the required permission, the portal shows an access restricted screen instead of the page.

## Current routes

| Route | Required Permission | Notes |
|---|---|---|
| `/` (dashboard) | authenticated | Any verified, onboarded member |
| `/community` | authenticated | Member directory and community tabs |
| `/programs` | authenticated | Member program workspace |
| `/mentorship` | authenticated | Member mentorship workspace |
| `/resources` | authenticated | Member resource library |
| `/admin` | `admin.panel.access` | Any member with this permission |
| `/admin/roles` | `roles.view` | |
| `/admin/roles/new` | `roles.create` | |
| `/admin/roles/[id]` | `roles.view` | |
| `/admin/roles/[id]/edit` | `roles.edit` | |
| `/admin/members` | `members.view` | |
| `/admin/members/[id]` | `members.view` | |
| `/admin/members/[id]/edit` | `members.edit` | |
| `/@username` | `profile.view` | Any authenticated member |
| `/settings/profile` | `profile.edit` | Own profile |
| `/settings/security` | `security.view` | Own sessions and password settings |
| `/settings/apps` | authenticated | Connected apps placeholder |
| `/activity` | `activity.view` | Own activity log |
| `/docs` | `docs.view` | Live documentation portal |

## Auth routes

These routes are accessible without being logged in:

| Route | Purpose |
|---|---|
| `/login` | Sign in |
| `/signup` | Register |
| `/forgot-password` | Request password reset |
| `/reset-password` | Set new password via reset link |
| `/verify-email` | Verify email address |
| `/onboarding` | Complete profile after first verification |

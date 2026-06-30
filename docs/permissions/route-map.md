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
| `/admin/roles/[slug]` | `roles.view` | |
| `/admin/roles/[slug]/edit` | `roles.edit` | |
| `/admin/members` | `users.view` | |
| `/admin/members/[username]` | `users.view` | |
| `/admin/members/[username]/edit` | `users.edit` | |
| `/@username` | none (public) | Any visitor |
| `/admin/oauth-apps` | `oauth_apps.view` | OAuth Apps management |
| `/admin/oauth-apps/new` | `oauth_apps.create` | |
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

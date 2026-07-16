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
| `/mentorship` | authenticated | Member mentorship workspace |
| `/resources` | authenticated | Member resource library |
| `/settings/profile` | `profile.edit` | Own profile |
| `/settings/security` | `security.view` | Own sessions and password settings |
| `/settings/apps` | authenticated | Connected apps placeholder |
| `/settings/career` | `career_progressions.submit` | Career progression submission |
| `/activity` | `activity.view` | Own activity log |
| `/reflections` | `reflections.submit` | Reflection history and current cycle status |
| `/reflections/submit` | `reflections.submit` | Monthly reflection question form |
| `/teams` | `teams.view` | Team directory |
| `/teams/new` | `teams.create` | Team creation flow |
| `/teams/[teamSlug]` | `teams.view:[teamSlug]` | Scoped team workspace â€” checked in-page |
| `/teams/[teamSlug]/reviews` | `teams.view:[teamSlug]` | Team contribution reviews |
| `/teams/[teamSlug]/reviews/[reviewId]` | `teams.view:[teamSlug]` | Specific review discussion |
| `/authorize` | authenticated | SSO consent screen â€” self-guards |
| `/admin` | `admin.panel.access` | Any member with this permission |
| `/admin/roles` | `roles.view` | |
| `/admin/roles/new` | `roles.create` | |
| `/admin/roles/[slug]` | `roles.view` | |
| `/admin/roles/[slug]/edit` | `roles.edit` | |
| `/admin/members` | `users.view` | |
| `/admin/members/[username]` | `users.view` | |
| `/admin/members/[username]/edit` | `users.edit` | |
| `/admin/api-keys` | `api_keys.view` | API key management |
| `/admin/oauth-apps` | `oauth_apps.view` | OAuth app management |
| `/admin/oauth-apps/new` | `oauth_apps.create` | |
| `/admin/oauth-apps/[id]/edit` | `oauth_apps.edit` | |
| `/admin/reflections` | `reflections.view_any` | Reflection review dashboard |
| `/admin/reflections/[id]/review` | `reflections.review` | Full-page reflection review |
| `/admin/reflections/members/[username]` | `reflections.view_any` | Member reflection history |
| `/admin/reflections/settings` | `reflections.manage` | Schedule, questions, manual trigger |
| `/admin/reflections/questions` | `reflections.manage` | Reflection question editor |
| `/admin/career-progressions` | `career_progressions.review` | Career progression review dashboard |
| `/badges` | authenticated | Member badge collection and featured badge selection |
| `/admin/badges` | `badges.view` | Badge catalogue and award totals |
| `/admin/badges/new` | `badges.create` | Badge creation and criteria builder |
| `/admin/badges/[slug]/edit` | `badges.edit` | Badge editing and criteria management || `/docs` | `docs.view` | Live documentation portal |
| `/@username` (or `/[username]`) | `profile.view` | Any authenticated member |

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
| `/discord/link` | Discord account linking callback |

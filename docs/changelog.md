---
title: Changelog
category: General
order: 1
---

## [2026-07-04] Documentation catch-up

**What changed:** Brought all docs up to date with current codebase. Added missing permissions (`career_progressions.*`, `users.flag`, `users.review_flag`, `teams.invite`, `teams.manage`, `teams.close_review`), filled in missing routes in the route map (career progressions, reflection admin sub-routes, `/authorize`, `/discord/link`, `/settings/career`), updated the admin overview to reflect API Keys, OAuth Apps, Reflections, and Career Progressions as live sections (no longer Coming Soon), moved API key and OAuth activity events out of the "Coming Soon" section in the activity log, added all team and reflection events, and created new doc files for Reflections and Career Progressions.
**Affected areas:** `docs/permissions/`, `docs/admin/overview.md`, `docs/api/`, `docs/reflections/`, `docs/career-progressions/`.
**Permissions added:** `career_progressions.submit`, `career_progressions.view_any`, `career_progressions.review`, `users.flag`, `users.review_flag`, `teams.invite`, `teams.manage`, `teams.close_review`.
**Breaking changes:** No.

## [2026-06-30] Community profile navigation

**What changed:** Community member cards now open the member's public profile page directly instead of showing the directory profile modal.
**Affected areas:** `/community`, public profiles.
**Permissions added:** none.
**Breaking changes:** No.

## [2026-06-30] Admin stability fixes

**What changed:** Fixed OAuth Apps rendering when the API returns camelCase OAuth fields, and locked system role edit screens so protected roles like `member` cannot be submitted into a backend validation error.
**Affected areas:** `/admin/oauth-apps`, `/admin/roles/[slug]`, `/admin/roles/[slug]/edit`.
**Permissions added:** none.
**Breaking changes:** No.

## [2026-06-30] Reflection submit page

**What changed:** Added a dedicated `/reflections/submit` page where members answer the current monthly reflection questions, upload attachments, and resubmit when changes are requested.
**Affected areas:** `/reflections`, `/reflections/submit`, dashboard reflection prompt, sidebar reflection shortcut.
**Permissions added:** none.
**Breaking changes:** No.

## [2026-06-27] OAuth App Management UI

**What changed:** Added an admin dashboard section to create, view, edit, and delete OAuth Applications for SSO, replacing the need to use the `seed_oauth_app` backend CLI command.
**Affected areas:** `/admin/oauth-apps`, backend `apps/authentication/views_admin_oauth.py`.
**Permissions added:** `oauth_apps.view`, `oauth_apps.create`, `oauth_apps.edit`, `oauth_apps.delete`.
**Breaking changes:** No.

## [2026-06-23] Single sign-on (portal as identity provider)

**What changed:** The portal can now sign users into other systems via OAuth2 Authorization Code + PKCE. Added a token-authenticated `/api/v1/oauth/authorize/` (issues an authorization code for the logged-in user), an OIDC-style `/api/v1/oauth/userinfo/`, a portal `/authorize` consent screen, and a `seed_oauth_app` command to register consumer clients. The Community Admin Center's password login was replaced with "Continue with Community Portal" (PKCE start + callback that gates on `admin.panel.access`).
**Affected areas:** portal `/authorize`, backend `apps/authentication/oauth.py` + `/o/token/`, community-website `/admin/login` + `/api/admin/auth/{start,callback}`.
**Permissions added:** none (consumers are gated on existing permissions like `admin.panel.access`).
**Breaking changes:** Admin Center no longer uses its local password login.

## [2026-06-23] API keys for external integrations

**What changed:** Admins can issue scoped API keys so external systems can call the backend without a user account. Keys carry RBAC permission scopes, are shown once at creation, and can be revoked. Added `ApiKeyAuthentication` (accepts `Authorization: Api-Key <key>` or `X-Api-Key`) and an admin UI at `/admin/api-keys`.
**Affected areas:** backend `apps/api_keys/`, portal `/admin/api-keys`.
**Permissions added:** `api_keys.view`, `api_keys.create`, `api_keys.revoke`.
**Breaking changes:** No.

## [2026-06-23] Monthly reflections

**What changed:** Members submit a monthly reflection in a window that opens on the 25th and is due 7 days later. A dismissible prompt + banner nags until submitted; after submitting it's hidden. Reviewers (with `reflections.view_any`/`reflections.review`) read collated reflections and can approve or request changes (which reopens the form with notes). Questions are admin-configurable and snapshotted per cycle. Reminder/opening/reviewer emails are sent by the `run_reflection_reminders` command (daily cron).
**Affected areas:** backend `apps/reflections/`, portal `/reflections`, `/admin/reflections`, `/admin/reflections/questions`, dashboard shell prompt.
**Permissions added:** `reflections.submit` (granted to members), `reflections.view_any`, `reflections.review`, `reflections.manage`.
**Breaking changes:** No.

## [2026-06-23] Direct user permissions & member management fixes

**What changed:** Admins can now grant permissions to a member directly, without creating or assigning a role — effective access is the union of role-derived and direct permissions. The member detail page gained a "Direct permissions" panel (grant via picker, revoke inline). Fixed a bug where the Roles panel keyed assignment/revocation off role display names instead of slugs, which could leave assigned roles selectable and cause revoke calls to fail; it now uses the new `roleNames` field. Role editing now rejects unknown/typo permission strings.
**Affected areas:** `/admin/members/[username]`, backend `apps/users/` (`UserPermission` model, `/api/v1/users/<id>/permissions/`), `RoleWriteSerializer` validation.
**Permissions added:** `permissions.assign`, `permissions.revoke`.
**Breaking changes:** No.

## [2026-06-11] Google and GitHub OAuth Integration

**What changed:** Implemented seamless social login via Google and GitHub. The frontend handles OAuth popups and sends tokens/codes to new backend custom endpoints that verify them directly and issue secure access tokens, completely bypassing the heavy `django-allauth` dependencies for a robust decoupled integration.
**Affected areas:** Frontend Login page (`/login`), Backend Authentication API (`/api/v1/auth/google/` and `/api/v1/auth/github/`).
**Permissions added:** none.
**Breaking changes:** No.

## [2026-06-11] Fix team invites and production image domain whitelist

**What changed:** Resolved team invite acceptance and revoking failures by updating Django URL routing to match UUIDs instead of integers. Added `api.dicebear.com` to Next.js images domain configuration to allow loading default fallback avatars in production. Fixed a casing typo for `invitedBy` inside the team workspace view.
**Affected areas:** `/teams/[teamSlug]` workspace, `/teams` dashboard invites banner, Next.js image domain config (`next.config.ts`), backend URL router (`apps/teams/urls.py`).
**Permissions added:** none.
**Breaking changes:** No.

## [2026-06-06] Teams invite notifications & review UX

**What changed:** Added transactional email on team invite dispatch, global in-app invite badge and dismissible banner in the dashboard shell, and polished review detail page (richer header, merged chronological timeline, improved inline comment editing, redesigned sidebar) and review list (stacked assignee avatars with +N, structured empty states).
**Affected areas:** `/teams/[teamSlug]` workspace, `/teams/[teamSlug]/reviews`, `/teams/[teamSlug]/reviews/[reviewId]`, `DashboardSidebar`, `DashboardShell`, backend `apps/teams/`.
**Permissions added:** none.
**Breaking changes:** No.

## [2026-06-02] Team Management & Contribution Panel

**What changed:** Launched a comprehensive workspace for teams to collaborate, open contribution reviews, and track progress via a GitHub-style Contribution Graph.
**Affected areas:** Portal Dashboard, Public Profiles, `/teams` workspace.
**Permissions added:** `teams.view`, `teams.create`, `teams.view:[id]`, `teams.manage:[id]`, `teams.create_review:[id]`, `teams.approve_review:[id]`.
**Breaking changes:** No.

## [2026-06-01] Dashboard Community ID placement update

**What changed:** Moved the Community ID on the dashboard out of the profile-strength sidebar and placed it directly in the primary profile action row beside the Edit Profile control for cleaner placement.
**Affected areas:** Dashboard profile header.
**Permissions added:** none.
**Breaking changes:** No.

## [2026-06-01] Required onboarding gender selection and unified dropdown

**What changed:** Updated onboarding and settings profile forms so gender must be selected before submitting, limited gender options to only `Male` and `Female`, and replaced browser-native gender selects with the shared shadcn-styled select for a consistent form UI.
**Affected areas:** Onboarding (Profile step), Settings (Profile), form validation and input styling.
**Permissions added:** none.
**Breaking changes:** No.

## [2026-05-30] Public profiles without authentication

**What changed:** Made member public profiles (`/@username`) accessible to visitors without requiring them to log in, similar to public LinkedIn profiles.
**Affected areas:** Public Profiles, Member Profile API.
**Permissions added:** none.
**Breaking changes:** No.

## [2026-05-30] API URL restructuring

**What changed:** Moved all backend API routes from admin-scoped `/api/v1/auth/admin/*` to entity-scoped root paths: `/api/v1/roles/`, `/api/v1/users/`, `/api/v1/permissions/`, `/api/v1/activity/`. Frontend services split from monolithic `admin.service.ts` into per-entity service and type files.
**Affected areas:** All admin API endpoints, frontend services, frontend types, frontend hooks.
**Permissions added:** none.
**Breaking changes:** Yes — all `/auth/admin/*` API URLs have moved. See `docs/api/overview.md` for the new endpoints.

## [2026-05-26] Role slug admin URLs

**What changed:** Updated admin role detail, edit, update, and delete flows to use the role slug instead of the numeric role ID.
**Affected areas:** Admin Roles, Permission System docs.
**Permissions added:** none.
**Breaking changes:** Yes - admin role URLs now use `/admin/roles/[slug]` and `/admin/roles/[slug]/edit`.

## [2026-05-26] Role permission detail accordions

**What changed:** Reworked the role detail permissions view into resource-based accordions that expand wildcard grants and explain unrestricted access.
**Affected areas:** Admin Roles.
**Permissions added:** none.
**Breaking changes:** No.

## [2026-05-26] Admin roles list polish

**What changed:** Refined the admin roles list with boxy summary stats, clearer search/filter controls, role risk labels, and more readable role rows.
**Affected areas:** Admin Roles.
**Permissions added:** none.
**Breaking changes:** No.

## [2026-05-26] Role assignment permission previews

**What changed:** Added plain-English permission previews when assigning or revoking member roles so admins can understand what access a role grants or removes before confirming.
**Affected areas:** Admin Members.
**Permissions added:** none.
**Breaking changes:** No.

## [2026-05-26] Admin member edit polish

**What changed:** Refined the admin member edit page with a wider boxy layout, member preview header, grouped profile fields, account state panel, and clearer save controls.
**Affected areas:** Admin Members.
**Permissions added:** none.
**Breaking changes:** No.

## [2026-05-26] Admin member detail polish

**What changed:** Refined the individual admin member page into a GitHub-style profile layout and moved risky account/session controls into a red bottom danger zone with typed confirmation before every dangerous action.
**Affected areas:** Admin Members.
**Permissions added:** none.
**Breaking changes:** No.

## [2026-05-26] Admin members list polish

**What changed:** Refined the admin members list with calmer visual styling, clearer member rows, summary stats, readable filters, and friendlier empty/error states.
**Affected areas:** Admin Members.
**Permissions added:** none.
**Breaking changes:** No.

## [2026-05-27] Admin High-Fidelity Detail & Security Refactor

**What changed:** Migrated admin member management from UUIDs to human-readable usernames in URLs. Rebuilt the member detail page with a high-fidelity "boxy" UI and implemented typed confirmation guards for all destructive administrative actions.
**Affected areas:** Admin Panel (/admin/members/[username]), User Profiles (/@username).
**Permissions added:** None.
**Breaking changes:** Yes — URLs for admin member detail have changed from `/admin/members/[id]` to `/admin/members/[username]`.

## [2026-05-26] Admin members table refresh

**What changed:** Redesigned the admin members list with avatar-based rows, compact status chips, and client-side pagination controls.
**Affected areas:** Admin Members.
**Permissions added:** none.
**Breaking changes:** No.

## [2026-05-26] Admin wiring alignment and org activity view

**What changed:** Aligned admin roles/members UI with the updated backend endpoints, added org-wide activity viewing, and introduced session management for member accounts.  
**Affected areas:** Admin Members, Admin Roles, Activity Log, Permission System, Docs.  
**Permissions added:** `users.*`, `sessions.view_any`, `sessions.revoke_any`, `activity.view_any` (replacing `members.*` in the UI).  
**Breaking changes:** Yes — permission codenames in the frontend now use `users.*` instead of `members.*`.

---

## [2026-05-19] Performance and reliability upgrades
**What changed:** Added Redis-backed caching for high-traffic profile and member endpoints and introduced global plus auth-specific rate limits.
**Affected areas:** Authentication API, Community Member API, API Throttling.
**Permissions added:** none.
**Breaking changes:** No.

## [2026-05-19] Primary role selection and rendering

**What changed:** Implemented primary role selection for community members, enabling them to choose one of their assigned roles to highlight as their primary identifier. Supported this by extending the Django `Profile` model and serialization, updating the Next.js form and types, and rendering the chosen role across public profiles and the member directory.  
**Affected areas:** User Profile Model, Settings Profile Page, Public Profiles, Member Cards, Community Member Directory, API Serializers.  
**Permissions added:** none.  
**Breaking changes:** No.

## [2026-05-19] Walkthrough state synchronization with backend

**What changed:** Implemented backend database storage for completed user onboarding walkthroughs, migrating from purely local storage to persistent DB sync. Corrected and modernized Django serializers and API endpoints to completely resolve stale imports and legacy single-role definitions.  
**Affected areas:** User Profile Model, Authentication Serializers, Profile Views, Walkthrough Hooks, Onboarding Flows.  
**Permissions added:** none.  
**Breaking changes:** No.

## [2026-05-19] Settings page onboarding walkthrough

**What changed:** Implemented an interactive onboarding walkthrough for the user settings page using driver.js, guiding members through navigation tabs, avatar and cover uploading, personal info, social links, skill tags, and applying settings updates.  
**Affected areas:** Settings Layout, Profile Settings Page.  
**Permissions added:** none.  
**Breaking changes:** No.

## [2026-05-19] Frontend structure cleanup

**What changed:** Centralized dashboard and public profile views into shared components, moved navigation data into shared modules, and consolidated shared types/helpers to reduce oversized files without altering user-facing behavior.  
**Affected areas:** Dashboard, Public Profiles, Navigation.  
**Permissions added:** none.  
**Breaking changes:** No.

## [2026-05-18] Portal workspace layout refresh

**What changed:** Refined dashboard and workspace page layouts, simplified page headers, and removed duplicated Programs and Resources tabs from Community so each sidebar section has a clearer purpose.  
**Affected areas:** Dashboard, Community, Programs, Mentorship, Resources, Admin Panel, Settings, Activity Log.  
**Permissions added:** none.  
**Breaking changes:** No.

## [2026-05-18] Permission-aware portal polish

**What changed:** Tightened protected page guards, added permission-based member edit actions, and refreshed member/admin data after role or profile changes.  
**Affected areas:** Community, Public Profiles, Settings, Activity Log, Programs, Mentorship, Resources, Admin Members.  
**Permissions added:** none.  
**Breaking changes:** No.

## [2026-05-17] Documentation UI refresh

**What changed:** Refined the documentation portal with a signature black sidebar, stronger typography, improved mobile navigation, and cleaner article, table, and code styles.  
**Affected areas:** Documentation Portal.  
**Permissions added:** none.  
**Breaking changes:** No.

## [2026-05-17] Public profile UI refresh

**What changed:** Improved public profile layout as a standalone personal website, refreshed loading and not-found states, and removed community IDs from public profile display.  
**Affected areas:** Public Profiles, Member Directory.  
**Permissions added:** none.  
**Breaking changes:** No.

## [2026-05-17] Dashboard UI refresh

**What changed:** Refined the member dashboard with a richer profile hero, clearer status metrics, improved portal module cards, and a cleaner community snapshot.  
**Affected areas:** Dashboard.  
**Permissions added:** none.  
**Breaking changes:** No.

## [2026-05-16] Community directory code cleanup

**What changed:** Refactored the Community page into focused tabs, member directory, filter, member card, loading, and data-loading modules without changing the visible feature set.  
**Affected areas:** Community.  
**Permissions added:** none.  
**Breaking changes:** No.

## [2026-05-16] Community Portal v1 implementation

**What changed:** Added admin roles and members management screens, role builder flows, and permission-guarded routing.  
**Affected areas:** Admin Panel, Roles, Members, Permissions, Activity Log, API.  
**Permissions added:** none.  
**Breaking changes:** No.

## [2026-05-16] Initial spec — Community Portal v1

**What changed:** Requirements, design conventions, and permission system defined. No code shipped yet.  
**Affected areas:** Entire portal — this is the foundation spec.  
**Permissions added:** `admin.panel.access`, `members.view`, `members.edit`, `members.deactivate`, `roles.view`, `roles.create`, `roles.edit`, `roles.delete`, `roles.assign`, `roles.revoke`, `profile.view`, `profile.edit`, `permissions.view`  
**Breaking changes:** No — greenfield.

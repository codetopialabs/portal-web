# Admin Panel Overview

The Admin Panel is the management interface for community operations. It is accessible to any member whose Permission Set includes `admin.panel.access` — access is determined by the permission, not by a specific role name.

## Accessing the admin panel

The Admin Panel appears in the sidebar automatically when a member has `admin.panel.access`. Navigate to `/admin`.

## Available sections

### Roles
Manage community roles — create, edit, and assign permissions.  
Requires: `roles.view`  
Route: `/admin/roles`  
→ See [Role Builder](./role-builder.md)

### Members
View and manage community members — search, filter, assign roles, suspend, reactivate, view sessions.  
Requires: `users.view`  
Route: `/admin/members`  
→ See [Member Management](./member-management.md)

### API Key Management
Create and revoke scoped API keys for external integrations. Keys carry their own permission scopes and can be used via `Authorization: Api-Key <key>` or `X-Api-Key`.  
Requires: `api_keys.view`  
Route: `/admin/api-keys`

### OAuth App Management
Register and manage OAuth 2.0 applications that can authenticate users via "Continue with Community Portal". Apps support Authorization Code + PKCE.  
Requires: `oauth_apps.view`  
Route: `/admin/oauth-apps`

### Reflections
Review and manage the monthly reflection programme — view all member submissions, approve or request changes, configure questions and cycle settings, and trigger cycles manually.  
Requires: `reflections.view_any` (review dashboard), `reflections.manage` (questions and settings)  
Route: `/admin/reflections`

### Career Progressions
Review career progression submissions from members. Approve or reject entries and view the full submission history.  
Requires: `career_progressions.review`  
Route: `/admin/career-progressions`

## Coming Soon sections

These sections are visible in the admin panel but not yet functional:

| Section | What it will do |
|---|---|
| Application Management | Review and process member applications |
| Form Builder | Attach custom forms to application types |
| Event Management | Create and manage events |
| Mentorship Management | Pair mentors and mentees |
| XP Management | Manually award XP to members |

## Permission model

The admin panel does not have a single "admin" role. Access to each section is controlled by individual permissions:

- Seeing the admin panel at all → `admin.panel.access`
- Seeing the roles section → `roles.view`
- Creating roles → `roles.create`
- Editing roles → `roles.edit`
- Assigning roles → `roles.assign`
- Seeing the members section → `users.view`
- Editing members → `users.edit`
- Suspending members → `users.suspend` (must be explicit — no wildcards)
- Reactivating members → `users.reactivate`
- Deleting members → `users.delete` (must be explicit — no wildcards)
- Flagging members → `users.flag`
- Reviewing flags → `users.review_flag`
- Viewing member sessions → `sessions.view_any`
- Revoking member sessions → `sessions.revoke_any`
- Viewing org-wide activity logs → `activity.view_any`
- Managing API keys → `api_keys.view`, `api_keys.create`, `api_keys.revoke`
- Managing OAuth apps → `oauth_apps.view`, `oauth_apps.create`, `oauth_apps.edit`, `oauth_apps.delete`
- Reviewing reflections → `reflections.view_any`, `reflections.review`
- Managing reflection cycles/questions → `reflections.manage`
- Reviewing career progressions → `career_progressions.review`, `career_progressions.view_any`
- Granting permissions directly to members → `permissions.assign`, `permissions.revoke`

A member can have `admin.panel.access` and `users.view` without having `roles.view` — they'd see the admin panel and the members section but not the roles section.

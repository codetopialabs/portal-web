# API Overview

The Codetopia Portal API is a REST API built with Django REST Framework.

## Base URL

```
/api/v1/
```

## Response envelope

All responses follow a consistent structure:

```json
{
  "data": {},
  "errors": null,
  "meta": { "version": "v1" }
}
```

- `data` — the response payload (object or array)
- `errors` — `null` on success, or an object/array describing what went wrong
- `meta` — metadata about the response

## Key naming

- API responses use **camelCase** keys
- Backend internals use snake_case — conversion is automatic

## Authentication

Two methods are supported:

### Bearer token (user sessions)

```
Authorization: Bearer <access_token>
```

Obtained from `POST /api/v1/auth/login/`. Expires after a configured period. Use the refresh token to get a new access token without re-authenticating.

### API key (external devices and apps)

```
Authorization: Api-Key <api_key>
X-Api-Key: <api_key>
```

API keys have their own Permission Set assigned at creation time. They go through the same permission check layer as user tokens.

## Rate limiting

The API enforces rate limits using both user and IP throttles. Limits vary by endpoint:

- Default authenticated: 300 requests/minute + 60 requests/10s burst
- Default anonymous: 60 requests/minute + 20 requests/10s burst
- `/auth/me/`: 600 requests/minute + 120 requests/10s burst
- Login: 10 requests/minute + 3 requests/10s burst (per IP and per email)
- Signup: 5 requests/minute + 2 requests/10s burst (per IP and per email)
- Password reset request: 5 requests/minute + 2 requests/10s burst (per IP and per email)
- Email verification: 10 requests/minute + 3 requests/10s burst (per IP and per token)

When limits are exceeded, the API returns HTTP 429.

## Caching

Selected read-heavy endpoints are cached in Redis with short TTLs. Writes immediately invalidate related cache entries so profiles and member lists update quickly after changes.

## Permission enforcement

Every endpoint declares a required permission. Requests without the required permission receive HTTP 403.

## Key endpoints (v1)

### Authentication (`/api/v1/auth/`)

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| POST | `/api/v1/auth/login/` | none | Sign in, get tokens |
| POST | `/api/v1/auth/token/refresh/` | none | Refresh access token |
| POST | `/api/v1/auth/register/` | none | Register new member |
| POST | `/api/v1/auth/logout/` | authenticated | Sign out |
| GET | `/api/v1/auth/me/` | authenticated | Get own profile + permissions |
| PATCH | `/api/v1/auth/me/` | authenticated | Update own profile |
| POST | `/api/v1/auth/change-password/` | authenticated | Change own password |
| GET | `/api/v1/auth/sessions/` | `security.view` | List own sessions |
| DELETE | `/api/v1/auth/sessions/{id}/` | `security.revoke` | Revoke own session |
| POST | `/api/v1/auth/google/` | none | Sign in with Google |
| POST | `/api/v1/auth/github/` | none | Sign in with GitHub |

### Community members (`/api/v1/users/members/`)

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| GET | `/api/v1/users/members/` | `profile.view` | List community members |
| GET | `/api/v1/users/members/{username}/` | none | Get member public profile |

### User management (`/api/v1/users/`)

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| GET | `/api/v1/users/` | `users.view` | List all users |
| GET | `/api/v1/users/{id}/` | `users.view` | Get user detail |
| PATCH | `/api/v1/users/{id}/` | `users.edit` | Update user profile fields |
| DELETE | `/api/v1/users/{id}/` | `users.delete` | Delete a user account |
| POST | `/api/v1/users/{id}/suspend/` | `users.suspend` | Suspend a user account |
| POST | `/api/v1/users/{id}/reactivate/` | `users.reactivate` | Reactivate a user account |
| POST | `/api/v1/users/{id}/flag/` | `users.flag` | Flag a user account for review |
| GET | `/api/v1/users/{id}/sessions/` | `sessions.view_any` | List user sessions |
| POST | `/api/v1/users/{id}/sessions/{sessionId}/revoke/` | `sessions.revoke_any` | Revoke a session |
| POST | `/api/v1/users/{id}/sessions/revoke-all/` | `sessions.revoke_any` | Revoke all sessions |
| GET | `/api/v1/users/{id}/permissions/` | `permissions.view` | View direct permissions for a user |
| POST | `/api/v1/users/{id}/permissions/` | `permissions.assign` | Grant a direct permission |
| DELETE | `/api/v1/users/{id}/permissions/{codename}/` | `permissions.revoke` | Revoke a direct permission |

### Roles (`/api/v1/roles/`)

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| GET | `/api/v1/roles/` | `roles.view` | List all roles |
| POST | `/api/v1/roles/` | `roles.create` | Create a role |
| GET | `/api/v1/roles/{slug}/` | `roles.view` | Get role detail |
| PATCH | `/api/v1/roles/{slug}/` | `roles.edit` | Edit a role |
| DELETE | `/api/v1/roles/{slug}/` | `roles.delete` | Delete a role |
| POST | `/api/v1/roles/assign/` | `roles.assign` | Assign role to member |
| POST | `/api/v1/roles/revoke/` | `roles.revoke` | Remove role from member |

### Permissions (`/api/v1/permissions/`)

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| GET | `/api/v1/permissions/` | `permissions.view` | Get master permission list |

### Activity (`/api/v1/activity/`)

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| GET | `/api/v1/activity/` | `activity.view` | Own activity log |
| GET | `/api/v1/activity/all/` | `activity.view_any` | Org-wide activity logs |

### Teams (`/api/v1/teams/`)

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| GET | `/api/v1/teams/` | `teams.view` | List teams |
| POST | `/api/v1/teams/` | `teams.create` | Create a team |
| GET | `/api/v1/teams/{slug}/` | `teams.view:[slug]` | Get team detail |
| PATCH | `/api/v1/teams/{slug}/` | `teams.manage:[slug]` | Update team details |
| GET | `/api/v1/teams/{slug}/reviews/` | `teams.view:[slug]` | List reviews |
| POST | `/api/v1/teams/{slug}/reviews/` | `teams.create_review:[slug]` | Open a review |
| GET | `/api/v1/teams/{slug}/reviews/{id}/` | `teams.view:[slug]` | Get review detail |
| POST | `/api/v1/teams/{slug}/reviews/{id}/approve/` | `teams.approve_review:[slug]` | Approve a review |
| POST | `/api/v1/teams/{slug}/reviews/{id}/close/` | `teams.close_review` | Close a review |
| GET | `/api/v1/teams/{slug}/members/` | `teams.view:[slug]` | List team members |
| POST | `/api/v1/teams/{slug}/invites/` | `teams.invite` | Send a team invite |
| GET | `/api/v1/teams/invites/mine/` | authenticated | List own pending invites |

### Reflections (`/api/v1/reflections/`)

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| GET | `/api/v1/reflections/current/` | `reflections.submit` | Get the active reflection cycle and own submission |
| POST | `/api/v1/reflections/current/` | `reflections.submit` | Submit or resubmit a reflection |
| GET | `/api/v1/reflections/history/` | `reflections.submit` | Own submission history |
| GET | `/api/v1/reflections/` | `reflections.view_any` | List all member submissions |
| GET | `/api/v1/reflections/{id}/` | `reflections.view_any` | Get a specific submission |
| POST | `/api/v1/reflections/{id}/review/` | `reflections.review` | Approve or request changes |
| GET | `/api/v1/reflections/questions/` | `reflections.manage` | List reflection questions |
| POST | `/api/v1/reflections/questions/` | `reflections.manage` | Create a question |
| PATCH | `/api/v1/reflections/questions/{id}/` | `reflections.manage` | Edit a question |
| DELETE | `/api/v1/reflections/questions/{id}/` | `reflections.manage` | Delete a question |
| GET | `/api/v1/reflections/settings/` | `reflections.manage` | Get cycle settings |
| PATCH | `/api/v1/reflections/settings/` | `reflections.manage` | Update cycle settings |
| POST | `/api/v1/reflections/trigger/` | `reflections.manage` | Manually open a reflection cycle |

### Career Progressions (`/api/v1/career-progressions/`)

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| GET | `/api/v1/career-progressions/me/` | `career_progressions.submit` | Own career progression entries |
| POST | `/api/v1/career-progressions/me/` | `career_progressions.submit` | Submit a new entry |
| GET | `/api/v1/career-progressions/` | `career_progressions.view_any` | List all submissions |
| GET | `/api/v1/career-progressions/{id}/` | `career_progressions.review` | Get a submission |
| POST | `/api/v1/career-progressions/{id}/review/` | `career_progressions.review` | Approve or reject a submission |

### API Keys (`/api/v1/api-keys/`)

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| GET | `/api/v1/api-keys/` | `api_keys.view` | List API keys |
| POST | `/api/v1/api-keys/` | `api_keys.create` | Create a new API key |
| POST | `/api/v1/api-keys/{id}/revoke/` | `api_keys.revoke` | Revoke an API key |

### OAuth Apps (`/api/v1/admin/oauth-apps/`)

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| GET | `/api/v1/admin/oauth-apps/` | `oauth_apps.view` | List OAuth applications |
| POST | `/api/v1/admin/oauth-apps/` | `oauth_apps.create` | Register a new OAuth application |
| GET | `/api/v1/admin/oauth-apps/{id}/` | `oauth_apps.view` | Get application detail |
| PATCH | `/api/v1/admin/oauth-apps/{id}/` | `oauth_apps.edit` | Edit an application |
| DELETE | `/api/v1/admin/oauth-apps/{id}/` | `oauth_apps.delete` | Delete an application |

### SSO / OAuth (`/api/v1/oauth/`)

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| GET | `/api/v1/oauth/authorize/` | authenticated | Issue an authorization code (PKCE) |
| GET | `/api/v1/oauth/userinfo/` | authenticated | OIDC-style user info |

### Admin Overview (`/api/v1/admin/overview/`)

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| GET | `/api/v1/admin/overview/` | `admin.panel.access` | Admin dashboard summary stats |

> **When adding a new endpoint:** add it to this table and update `docs/changelog.md`.

## See also

- [Activity Log](./activity-log.md)
- [Permission List](../permissions/permission-list.md)

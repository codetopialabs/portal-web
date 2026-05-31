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
X-API-Key: <api_key>
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

```
GET  /api/v1/users/members/    → requires profile.view
GET  /api/v1/users/            → requires users.view
GET  /api/v1/roles/            → requires roles.view
POST /api/v1/roles/            → requires roles.create
```

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

### Community members (`/api/v1/users/members/`)

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| GET | `/api/v1/users/members/` | `profile.view` | List community members |
| GET | `/api/v1/users/members/{username}/` | none | Get member profile |

### User management (`/api/v1/users/`)

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| GET | `/api/v1/users/` | `users.view` | List all users |
| GET | `/api/v1/users/{id}/` | `users.view` | Get user detail |
| PATCH | `/api/v1/users/{id}/` | `users.edit` | Update user profile fields |
| DELETE | `/api/v1/users/{id}/` | `users.delete` | Delete a user account |
| POST | `/api/v1/users/{id}/suspend/` | `users.suspend` | Suspend a user account |
| POST | `/api/v1/users/{id}/reactivate/` | `users.reactivate` | Reactivate a user account |
| GET | `/api/v1/users/{id}/sessions/` | `sessions.view_any` | List user sessions |
| POST | `/api/v1/users/{id}/sessions/{sessionId}/revoke/` | `sessions.revoke_any` | Revoke a session |
| POST | `/api/v1/users/{id}/sessions/revoke-all/` | `sessions.revoke_any` | Revoke all sessions |

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

> **When adding a new endpoint:** add it to this table and update `docs/changelog.md`.

## See also

- [Activity Log](./activity-log.md)
- [Permission List](../permissions/permission-list.md)

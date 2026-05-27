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
GET  /api/v1/users/members/  → requires profile.view
GET  /api/v1/auth/admin/users/ → requires users.view
GET  /api/v1/auth/admin/roles/ → requires roles.view
POST /api/v1/auth/admin/roles/ → requires roles.create
```

## Key endpoints (v1)

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| POST | `/api/v1/auth/login/` | none | Sign in, get tokens |
| POST | `/api/v1/auth/token/refresh/` | none | Refresh access token |
| POST | `/api/v1/auth/register/` | none | Register new member |
| GET | `/api/v1/auth/me/` | authenticated | Get own profile + permissions |
| PATCH | `/api/v1/auth/me/` | authenticated | Update own profile |
| GET | `/api/v1/users/members/` | `profile.view` | List community members |
| GET | `/api/v1/users/members/{username}/` | `profile.view` | Get member profile |
| GET | `/api/v1/auth/admin/roles/` | `roles.view` | List all roles |
| POST | `/api/v1/auth/admin/roles/` | `roles.create` | Create a role |
| GET | `/api/v1/auth/admin/roles/{slug}/` | `roles.view` | Get role detail |
| PATCH | `/api/v1/auth/admin/roles/{slug}/` | `roles.edit` | Edit a role |
| DELETE | `/api/v1/auth/admin/roles/{slug}/` | `roles.delete` | Delete a role |
| POST | `/api/v1/auth/admin/roles/assign/` | `roles.assign` | Assign role to member |
| POST | `/api/v1/auth/admin/roles/revoke/` | `roles.revoke` | Remove role from member |
| GET | `/api/v1/auth/admin/permissions/` | `permissions.view` | Get master permission list |
| GET | `/api/v1/auth/admin/users/` | `users.view` | List community members for admins |
| GET | `/api/v1/auth/admin/users/{id}/` | `users.view` | Get admin member detail |
| PATCH | `/api/v1/auth/admin/users/{id}/` | `users.edit` | Update member profile fields |
| DELETE | `/api/v1/auth/admin/users/{id}/` | `users.delete` | Delete a member account |
| POST | `/api/v1/auth/admin/users/{id}/suspend/` | `users.suspend` | Suspend a member account |
| POST | `/api/v1/auth/admin/users/{id}/reactivate/` | `users.reactivate` | Reactivate a member account |
| GET | `/api/v1/auth/admin/users/{id}/sessions/` | `sessions.view_any` | List member sessions |
| POST | `/api/v1/auth/admin/users/{id}/sessions/{sessionId}/revoke/` | `sessions.revoke_any` | Revoke a session |
| POST | `/api/v1/auth/admin/users/{id}/sessions/revoke-all/` | `sessions.revoke_any` | Revoke all sessions |
| GET | `/api/v1/auth/admin/activity/` | `activity.view_any` | List org activity logs |

> **When adding a new endpoint:** add it to this table and update `docs/changelog.md`.

## See also

- [Activity Log](./activity-log.md)
- [Permission List](../permissions/permission-list.md)

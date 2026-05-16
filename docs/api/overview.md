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

Obtained from `POST /api/v1/auth/token/`. Expires after a configured period. Use the refresh token to get a new access token without re-authenticating.

### API key (external devices and apps)

```
X-API-Key: <api_key>
```

API keys have their own Permission Set assigned at creation time. They go through the same permission check layer as user tokens.

## Permission enforcement

Every endpoint declares a required permission. Requests without the required permission receive HTTP 403.

```
GET  /api/v1/users/          → requires members.view
PATCH /api/v1/users/{id}/    → requires members.edit
GET  /api/v1/roles/          → requires roles.view
POST /api/v1/roles/          → requires roles.create
```

## Key endpoints (v1)

| Method | Endpoint | Permission | Description |
|---|---|---|---|
| POST | `/api/v1/auth/token/` | none | Sign in, get tokens |
| POST | `/api/v1/auth/token/refresh/` | none | Refresh access token |
| POST | `/api/v1/auth/register/` | none | Register new member |
| GET | `/api/v1/users/me/` | authenticated | Get own profile + permissions |
| PATCH | `/api/v1/users/me/` | authenticated | Update own profile |
| GET | `/api/v1/users/` | `members.view` | List all members |
| GET | `/api/v1/users/{id}/` | `members.view` | Get member detail |
| PATCH | `/api/v1/users/{id}/` | `members.edit` | Edit member profile |
| GET | `/api/v1/roles/` | `roles.view` | List all roles |
| POST | `/api/v1/roles/` | `roles.create` | Create a role |
| GET | `/api/v1/roles/{id}/` | `roles.view` | Get role detail |
| PATCH | `/api/v1/roles/{id}/` | `roles.edit` | Edit a role |
| DELETE | `/api/v1/roles/{id}/` | `roles.delete` | Delete a role |
| POST | `/api/v1/users/{id}/roles/` | `roles.assign` | Assign role to member |
| DELETE | `/api/v1/users/{id}/roles/{role_id}/` | `roles.revoke` | Remove role from member |
| GET | `/api/v1/permissions/` | `permissions.view` | Get master permission list |
| GET | `/api/v1/admin/members/` | `members.view` | List community members for admins |
| GET | `/api/v1/admin/members/{id}/` | `members.view` | Get admin member detail |
| PATCH | `/api/v1/admin/members/{id}/` | `members.edit` | Update member profile fields |
| POST | `/api/v1/admin/members/{id}/deactivate/` | `members.deactivate` | Deactivate a member account |

> **When adding a new endpoint:** add it to this table and update `docs/changelog.md`.

## See also

- [Activity Log](./activity-log.md)
- [Permission List](../permissions/permission-list.md)

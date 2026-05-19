# Activity Log

Every significant action on a member account is recorded in the activity log. Logs capture the event type, a human-readable description, IP address, device name, and timestamp.

## Viewing the log

Activity logs are accessible to admins via the Admin Panel (Coming Soon in v1). Members can see their own recent activity in Settings → Security.

## Event types

### Auth events

| Event type | When it fires |
|---|---|
| `login` | Member signs in successfully |
| `logout` | Member signs out |
| `token_refresh` | Access token refreshed |

### Account events

| Event type | When it fires |
|---|---|
| `register` | New account created |
| `email_verified` | Email verification link clicked |
| `onboarding_completed` | Member finished onboarding |
| `password_changed` | Password changed from settings |
| `password_reset_requested` | Password reset email sent |
| `password_reset_completed` | Password reset via email link |

### Profile events

| Event type | When it fires |
|---|---|
| `profile_updated` | Profile fields saved |
| `avatar_updated` | Profile photo changed |

### Session events

| Event type | When it fires |
|---|---|
| `session_revoked` | Single session signed out |
| `all_sessions_revoked` | All other sessions signed out |

### Role and permission events

| Event type | When it fires |
|---|---|
| `role_assigned` | Admin assigns a role to a member |
| `role_revoked` | Admin removes a role from a member |
| `role_created` | Admin creates a new role |
| `role_edited` | Admin edits a role's permissions |
| `role_deleted` | Admin deletes a role |
| `member_deactivated` | Admin deactivates a member account |

### OAuth and API key events (Coming Soon)

| Event type | When it fires |
|---|---|
| `oauth_authorized` | Member authorises an OAuth client |
| `oauth_revoked` | Member revokes an OAuth client authorisation |
| `api_key_created` | Admin creates an API key |
| `api_key_revoked` | Admin revokes an API key |

## Adding a new event type

1. Add the event type to `ActivityEventType` in `apps/authentication/models.py` (flag to user — backend change)
2. Call `log_activity(user, ActivityEventType.NEW_EVENT, detail="...", request=request)` at the point the action occurs
3. Add the event type to the relevant table in this file
4. Update `docs/changelog.md`

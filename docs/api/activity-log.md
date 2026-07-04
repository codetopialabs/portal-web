# Activity Log

Every significant action on a member account is recorded in the activity log. Logs capture the event type, a human-readable description, IP address, device name, and timestamp.

## Viewing the log

- Members can see their own recent activity at `/activity` (requires `activity.view`).
- Admins can view org-wide logs via `GET /api/v1/activity/all/` (requires `activity.view_any`).

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
| `password_changed` | Password changed from settings |
| `password_reset_requested` | Password reset email sent |
| `password_reset_completed` | Password reset via email link |
| `username_changed` | Member changes their username |

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
| `role_updated` | Admin edits a role's permissions |
| `role_deleted` | Admin deletes a role |
| `user_updated` | Admin edits a member account |
| `user_suspended` | Admin suspends a member account |
| `user_reactivated` | Admin reactivates a member account |
| `user_deleted` | Admin deletes a member account |

### Account policy / flagging events

| Event type | When it fires |
|---|---|
| `account_flagged` | A member account is flagged for policy review |
| `account_flag_resolved` | A flag on a member account is resolved |

### Team events

| Event type | When it fires |
|---|---|
| `team_created` | A new team is created |
| `team_member_invited` | A member is invited to a team |
| `team_member_joined` | A member accepts a team invite and joins |
| `team_member_removed` | A member is removed from a team |
| `team_invite_sent` | Team invite email dispatched |
| `team_invite_accepted` | Member accepts an invite |
| `team_invite_declined` | Member declines an invite |
| `review_opened` | A contribution review is opened in a team |
| `review_approved` | A contribution review is approved |
| `review_closed` | A contribution review is closed without approval |
| `review_comment_added` | A comment is posted on a review |

### Reflection events

| Event type | When it fires |
|---|---|
| `reflection_submitted` | Member submits their monthly reflection |
| `reflection_approved` | Admin approves a reflection |
| `reflection_changes_requested` | Admin requests changes on a reflection |

### API key events

| Event type | When it fires |
|---|---|
| `api_key_created` | Admin creates a new API key |
| `api_key_revoked` | Admin revokes an API key |

### OAuth / SSO events

| Event type | When it fires |
|---|---|
| `oauth_authorized` | Member authorises an OAuth application |
| `oauth_revoked` | Member revokes an OAuth application authorisation |

### Discord events

| Event type | When it fires |
|---|---|
| `discord_linked` | Member links their Discord account |

## Adding a new event type

1. Add the event type to `ActivityEventType` in `apps/authentication/models.py` (flag to user — backend change)
2. Call `log_activity(user, ActivityEventType.NEW_EVENT, detail="...", request=request)` at the point the action occurs
3. Add the event type to the relevant table in this file
4. Update `docs/changelog.md`

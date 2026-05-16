# Member Lifecycle

How a person goes from visitor to active community member.

## Steps

```
1. Register       → /signup — email, username, full name, password
2. Verify email   → click link in verification email (expires 24h)
3. Onboard        → /onboarding — complete profile (discipline, skills, goals, etc.)
4. Portal access  → dashboard unlocks, member role auto-assigned
5. Role expansion → admin assigns additional roles → new portal sections appear
```

## Registration

- Requires: email address, username, full name, password (must contain at least one number)
- On success: `member` role auto-assigned, verification email sent
- Duplicate email or username → error shown inline

## Email verification

- Token expires after 24 hours
- Member can request a new verification email if the token expires
- Until verified: member cannot access any portal section

## Onboarding

- Triggered automatically after first email verification
- Multi-step form collecting: discipline, experience level, skills, location, community goals, referral source
- Progress is saved — member can return and continue later
- Until onboarding is complete: member is redirected to `/onboarding` on every login
- On completion: `is_onboarded` flag set to `true`, member lands on dashboard

## Portal access

Once onboarded, the member sees their personalised portal. What they see depends on their Permission Set:

- All members: Dashboard, Profile, Settings
- Members with `admin.panel.access`: Admin Panel
- Other sections unlock as roles are assigned

## Account deactivation

An admin with `members.deactivate` permission can deactivate a member account. This:
- Prevents the member from signing in
- Revokes all active sessions immediately
- Is logged in the activity log

Deactivation is a destructive action — it cannot be granted via wildcard.

## See also

- [Public Profile](./profile.md)
- [Roles Overview](../roles/overview.md)

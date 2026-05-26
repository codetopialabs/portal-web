# Member Management

The Members section of the Admin Panel lets admins view, search, and manage community members.

## Viewing members

Go to Admin Panel → Members. The list shows:
- Community ID
- Full name
- Email
- Assigned roles
- Account status
- Verification status
- Join date

Use the search bar to find members by name or email. Use filters to narrow by role or verification status.

## Assigning a role

1. Click a member's name to open their detail view
2. Click "Assign Role"
3. Select a role from the list
4. Confirm — the member's portal updates within 30 seconds

The assignment is recorded with the assigning admin's identity for audit purposes.

## Removing a role

1. Open the member's detail view
2. Find the role under their current roles
3. Click "Remove" — the role is revoked immediately

## Suspending a member

Requires the `users.suspend` permission (must be explicitly granted — wildcards don't cover this).

1. Open the member's detail view
2. Click "Suspend"
3. Confirm — the member is immediately signed out of all sessions and cannot sign in again

Suspension is logged in the activity log.

## Reactivating a member

Requires the `users.reactivate` permission.

1. Open the suspended member's detail view
2. Click "Reactivate"
3. Confirm — the member can sign in again immediately

## Deleting a member

Requires the `users.delete` permission (must be explicitly granted — wildcards don't cover this).

1. Open the member's detail view
2. Click "Delete"
3. Confirm — the account is permanently removed

## Viewing and revoking member sessions

Requires `sessions.view_any` to view sessions and `sessions.revoke_any` to revoke them.

1. Open the member's detail view
2. Scroll to Active Sessions
3. Click "Revoke" on a specific session or "Revoke All" to sign out every device

## See also

- [Role Builder](./role-builder.md)
- [Member Lifecycle](../members/overview.md)

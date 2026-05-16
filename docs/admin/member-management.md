# Member Management

The Members section of the Admin Panel lets admins view, search, and manage community members.

## Viewing members

Go to Admin Panel → Members. The list shows:
- Community ID
- Full name
- Email
- Assigned roles
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

## Deactivating a member

Requires the `members.deactivate` permission (must be explicitly granted — wildcards don't cover this).

1. Open the member's detail view
2. Click "Deactivate Account"
3. Confirm — the member is immediately signed out of all sessions and cannot sign in again

Deactivation is logged in the activity log. It is not reversible from the UI in v1 — contact a developer to reactivate.

## See also

- [Role Builder](./role-builder.md)
- [Member Lifecycle](../members/overview.md)

# Admin Panel Overview

The Admin Panel is the management interface for community operations. It is accessible to any member whose Permission Set includes `admin.panel.access` — access is determined by the permission, not by a specific role name.

## Accessing the admin panel

The Admin Panel appears in the sidebar automatically when a member has `admin.panel.access`. Navigate to `/admin`.

## Available sections (v1)

### Roles
Manage community roles — create, edit, and assign permissions.  
Requires: `roles.view`  
→ See [Role Builder](./role-builder.md)

### Members
View and manage community members — search, filter, assign roles.  
Requires: `members.view`  
→ See [Member Management](./member-management.md)

## Coming Soon sections

These sections are visible in the admin panel but not yet functional:

| Section | What it will do |
|---|---|
| Application Management | Review and process member applications |
| Form Builder | Attach custom forms to application types |
| Event Management | Create and manage events |
| Mentorship Management | Pair mentors and mentees |
| XP Management | Manually award XP to members |
| API Key Management | Create and revoke API keys |
| OAuth Client Management | Register external apps for "Login with Codetopia" |

## Permission model

The admin panel does not have a single "admin" role. Access to each section is controlled by individual permissions:

- Seeing the admin panel at all → `admin.panel.access`
- Seeing the roles section → `roles.view`
- Creating roles → `roles.create`
- Editing roles → `roles.edit`
- Assigning roles → `roles.assign`
- Seeing the members section → `members.view`
- Editing members → `members.edit`
- Deactivating members → `members.deactivate` (must be explicit — no wildcards)

A member can have `admin.panel.access` and `members.view` without having `roles.view` — they'd see the admin panel and the members section but not the roles section.

---
title: Badges
category: Community
order: 1
---

# Badges

Badges recognise meaningful member milestones. Active badges are awarded automatically when a member satisfies their saved criteria. Administrators can also make a manual award when they have the `badges.award` permission.

## Member experience

- Earned badges appear on the dashboard and the `/badges` collection page.
- Members can feature up to three earned badges on their public profile.
- A new award is announced with a congratulations screen on the member's next portal visit.
- Awards remain part of the member's history unless an authorised administrator revokes them with a reason.

## Creating a badge

The admin badge builder accepts a name, description, square PNG or WebP artwork, status, and an award rule. Artwork should be 512 by 512 pixels and no larger than 2 MB.

Rules use readable `ALL` and `ANY` groups. Available criteria currently include profile completion, profile fields, account state, community roles, team membership and position, approved career progressions, reflections, join date, and previously earned badges. Rule fields and operators are validated by the backend; administrators do not write or execute code.

Use Preview Matches before publishing to see how many existing members meet the rule. After activating or changing a badge, Reconcile awards it to matching existing members. Future qualifying activity is evaluated automatically.

## Badge lifecycle

- Draft badges are editable and never awarded automatically.
- Active badges can be awarded automatically or manually.
- Archived badges stop issuing new awards while preserving award history.
- A badge with no awards can be permanently deleted. A badge with awards is archived instead.

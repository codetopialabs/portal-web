---
title: Changelog
category: General
order: 1
---

# Changelog

All notable changes to the Codetopia Community Portal are documented here.

---

## [2026-05-19] Performance and reliability upgrades

**What changed:** Added Redis-backed caching for high-traffic profile and member endpoints and introduced global plus auth-specific rate limits.
**Affected areas:** Authentication API, Community Member API, API Throttling.
**Permissions added:** none.
**Breaking changes:** No.

## [2026-05-19] Primary role selection and rendering

**What changed:** Implemented primary role selection for community members, enabling them to choose one of their assigned roles to highlight as their primary identifier. Supported this by extending the Django `Profile` model and serialization, updating the Next.js form and types, and rendering the chosen role across public profiles and the member directory.  
**Affected areas:** User Profile Model, Settings Profile Page, Public Profiles, Member Cards, Community Member Directory, API Serializers.  
**Permissions added:** none.  
**Breaking changes:** No.

## [2026-05-19] Walkthrough state synchronization with backend

**What changed:** Implemented backend database storage for completed user onboarding walkthroughs, migrating from purely local storage to persistent DB sync. Corrected and modernized Django serializers and API endpoints to completely resolve stale imports and legacy single-role definitions.  
**Affected areas:** User Profile Model, Authentication Serializers, Profile Views, Walkthrough Hooks, Onboarding Flows.  
**Permissions added:** none.  
**Breaking changes:** No.

## [2026-05-19] Settings page onboarding walkthrough

**What changed:** Implemented an interactive onboarding walkthrough for the user settings page using driver.js, guiding members through navigation tabs, avatar and cover uploading, personal info, social links, skill tags, and applying settings updates.  
**Affected areas:** Settings Layout, Profile Settings Page.  
**Permissions added:** none.  
**Breaking changes:** No.

## [2026-05-19] Frontend structure cleanup

**What changed:** Centralized dashboard and public profile views into shared components, moved navigation data into shared modules, and consolidated shared types/helpers to reduce oversized files without altering user-facing behavior.  
**Affected areas:** Dashboard, Public Profiles, Navigation.  
**Permissions added:** none.  
**Breaking changes:** No.

## [2026-05-18] Portal workspace layout refresh

**What changed:** Refined dashboard and workspace page layouts, simplified page headers, and removed duplicated Programs and Resources tabs from Community so each sidebar section has a clearer purpose.  
**Affected areas:** Dashboard, Community, Programs, Mentorship, Resources, Admin Panel, Settings, Activity Log.  
**Permissions added:** none.  
**Breaking changes:** No.

## [2026-05-18] Permission-aware portal polish

**What changed:** Tightened protected page guards, added permission-based member edit actions, and refreshed member/admin data after role or profile changes.  
**Affected areas:** Community, Public Profiles, Settings, Activity Log, Programs, Mentorship, Resources, Admin Members.  
**Permissions added:** none.  
**Breaking changes:** No.

## [2026-05-17] Documentation UI refresh

**What changed:** Refined the documentation portal with a signature black sidebar, stronger typography, improved mobile navigation, and cleaner article, table, and code styles.  
**Affected areas:** Documentation Portal.  
**Permissions added:** none.  
**Breaking changes:** No.

## [2026-05-17] Public profile UI refresh

**What changed:** Improved public profile layout as a standalone personal website, refreshed loading and not-found states, and removed community IDs from public profile display.  
**Affected areas:** Public Profiles, Member Directory.  
**Permissions added:** none.  
**Breaking changes:** No.

## [2026-05-17] Dashboard UI refresh

**What changed:** Refined the member dashboard with a richer profile hero, clearer status metrics, improved portal module cards, and a cleaner community snapshot.  
**Affected areas:** Dashboard.  
**Permissions added:** none.  
**Breaking changes:** No.

## [2026-05-16] Community directory code cleanup

**What changed:** Refactored the Community page into focused tabs, member directory, filter, member card, loading, and data-loading modules without changing the visible feature set.  
**Affected areas:** Community.  
**Permissions added:** none.  
**Breaking changes:** No.

## [2026-05-16] Community Portal v1 implementation

**What changed:** Added admin roles and members management screens, role builder flows, and permission-guarded routing.  
**Affected areas:** Admin Panel, Roles, Members, Permissions, Activity Log, API.  
**Permissions added:** none.  
**Breaking changes:** No.

## [2026-05-16] Initial spec — Community Portal v1

**What changed:** Requirements, design conventions, and permission system defined. No code shipped yet.  
**Affected areas:** Entire portal — this is the foundation spec.  
**Permissions added:** `admin.panel.access`, `members.view`, `members.edit`, `members.deactivate`, `roles.view`, `roles.create`, `roles.edit`, `roles.delete`, `roles.assign`, `roles.revoke`, `profile.view`, `profile.edit`, `permissions.view`  
**Breaking changes:** No — greenfield.

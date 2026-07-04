---
title: Monthly Reflections
category: Reflections
order: 1
---

# Monthly Reflections

The monthly reflection system lets members submit a short written reflection at the end of each month. Admins can review submissions and approve them or request changes.

## How cycles work

A reflection cycle opens automatically on the 25th of each month and closes 7 days later. Members receive a reminder email when the cycle opens and a follow-up if they haven't submitted before the deadline. The `run_reflection_reminders` management command runs these emails — it should be scheduled as a daily cron job.

Cycles can also be opened manually by an admin from `/admin/reflections/settings`.

## Member flow

1. A dismissible prompt appears on the dashboard when the cycle is open and the member hasn't submitted yet.
2. The member goes to `/reflections/submit` and answers the current questions.
3. Attachments can be uploaded alongside the text answers.
4. After submitting, the prompt disappears and the submission shows as "Pending review" in `/reflections`.
5. If an admin requests changes, the form reopens with the reviewer's notes and the member can resubmit.
6. Once approved, the submission is marked as complete.

## Admin flow

1. Go to `/admin/reflections` to see all submitted reflections for the current cycle.
2. Click a submission to open the full review page at `/admin/reflections/[id]/review`.
3. Approve the reflection or request changes with a note — the note is sent to the member.
4. View a specific member's full reflection history at `/admin/reflections/members/[username]`.

## Reflection questions

Questions are admin-configurable. Each question is snapshotted when a cycle opens so historical submissions always show the questions that were active at that time.

Manage questions at `/admin/reflections/questions` or `/admin/reflections/settings`.

## Permissions

| Permission | Who needs it |
|---|---|
| `reflections.submit` | All members — required to view and submit your own reflections |
| `reflections.view_any` | Reviewers — see all member submissions |
| `reflections.review` | Reviewers — approve or request changes |
| `reflections.manage` | Admins — manage questions, cycle settings, manual trigger |

## Routes

| Route | Purpose |
|---|---|
| `/reflections` | Own reflection history and current cycle status |
| `/reflections/submit` | Submit or resubmit the current cycle reflection |
| `/admin/reflections` | All member submissions (reviewer dashboard) |
| `/admin/reflections/[id]/review` | Full-page review for a single submission |
| `/admin/reflections/members/[username]` | Submission history for a specific member |
| `/admin/reflections/settings` | Cycle configuration and manual trigger |
| `/admin/reflections/questions` | Reflection question editor |

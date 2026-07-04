---
title: Career Progressions
category: Career Progressions
order: 1
---

# Career Progressions

The career progression system lets members log milestones, skills gained, and growth they've experienced through their involvement in the community. Submissions are reviewed by admins who can approve or reject entries with feedback.

## Member flow

1. Members submit career progression entries at `/settings/career`.
2. Each entry describes a skill, milestone, or progression point the member wants to have recognised.
3. After submitting, the entry shows as "Pending review".
4. An admin reviews the entry and either approves it or rejects it with a note.

## Admin flow

1. Go to `/admin/career-progressions` to see all pending and reviewed submissions.
2. Open a submission to see the full detail.
3. Approve the entry or reject it with a note that is returned to the member.

## Permissions

| Permission | Who needs it |
|---|---|
| `career_progressions.submit` | All members — required to view and submit own entries |
| `career_progressions.view_any` | Admins — see all member submissions |
| `career_progressions.review` | Admins — approve or reject submissions |

## Routes

| Route | Purpose |
|---|---|
| `/settings/career` | Member's own career progression entries and submission form |
| `/admin/career-progressions` | Admin review dashboard for all submissions |

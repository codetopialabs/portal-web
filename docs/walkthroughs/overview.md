---
title: Feature Walkthroughs
category: Frontend
order: 1
---

# Feature Walkthroughs & Guided Tours

To help members navigate the platform and discover new capabilities as they earn new roles, the portal uses a contextual walkthrough system. 

When a member is granted a new permission (e.g., access to the admin panel or a new mentorship module), the system detects this and triggers a guided tour of the newly unlocked UI elements.

## Technology Stack

We use **[Driver.js](https://driverjs.com/)** for our walkthroughs. It is a lightweight, dependency-free vanilla JavaScript engine that works flawlessly with React. It allows us to:
- Highlight specific DOM elements.
- Dim the background with a focus overlay.
- Apply our strict, high-contrast, boxy styling to the popover cards.

## How it Works (Architecture)

The walkthrough system relies on three pillars:

### 1. State Tracking (Backend)
To ensure a user only sees a walkthrough once across all their devices, we track completion state on the user profile.
- A field like `completed_walkthroughs: string[]` on the User model.
- Once a tour is finished or dismissed, an API call is made to append the tour's unique ID to this array.

### 2. Component-Level Execution
Tours naturally inherit the platform's Permission System. Because we place the `useWalkthrough` hook *inside* the protected page or component:
1. If the user lacks the permission, the page never renders, and the tour never triggers.
2. If the user gains the permission and visits the page, the component renders and triggers the tour immediately.

### 3. The `useWalkthrough` Hook
In the frontend, we wrap the logic in a custom hook.

```ts
// Example usage inside an Admin Page component
useWalkthrough({
  tourId: "admin_panel_intro",
  steps: [
    { element: '#admin-sidebar', popover: { title: 'Admin Controls', description: 'Your new dashboard.' } }
  ]
});
```

The hook automatically checks the completion state in local storage, mounts the `driver.js` instance if eligible, and handles the completion callback.

## Creating a New Walkthrough

When adding a new UI feature that requires an explanation:
1. Ensure the new UI elements have stable `id` attributes (e.g., `id="role-builder-btn"`).
2. Define the tour steps referencing those IDs.
3. Call the `useWalkthrough` hook within the top-level component of that feature, passing the appropriate `requiredPermission`.
4. Style the Driver.js popover to match the Codetopia industrial aesthetic (square corners, bold borders, black/white contrast).

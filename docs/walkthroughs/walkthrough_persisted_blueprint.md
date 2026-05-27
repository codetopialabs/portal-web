# Architectural Blueprint: Persistent Walkthrough Synchronization State

This blueprint details the migration of user walkthrough completion states from client-side `localStorage` to backend-persisted JSON data on the user's Profile. This ensures walkthrough states are:
1. **Cross-device synchronized:** A walkthrough completed on desktop will not repeat on mobile.
2. **Admin/Backend managed:** The backend can reset specific walkthrough flags when new sub-features are unlocked or rolled out.
3. **Robust and resilient:** User walkthrough states survive cookie clear-outs and incognito sessions.

---

## 1. Quick Test: How to Reset & View the Walkthrough Right Now

If you are not seeing the Settings walkthrough, it is because of the `localStorage` key being flagged as `completed` during development testing. 

To reset it and view the walkthrough immediately:
1. Open your browser **Developer Tools** (Press `F12` or right-click -> `Inspect`).
2. Navigate to the **Console** tab.
3. Paste the following command and press **Enter**:
   ```javascript
   localStorage.removeItem("codetopia_walkthrough_settings_profile_tour_v1");
   location.reload();
   ```
4. This clears the settings tour cache specifically and triggers it fresh on reload!

---

## 2. Django Backend Blueprint (Read-Only reference)

*Note: Since the backend is reference-only in this repository, these changes must be approved and applied on the backend codebase.*

### A. Model Addition (`apps/users/models.py`)
Add `completed_walkthroughs` to the `Profile` model (or the `User` model, depending on where preferences are kept). Following the guidelines in `docs/walkthroughs/overview.md`, we will add it as a `JSONField` (default list of tour IDs) on the `Profile` model:

```python
# apps/users/models.py
class Profile(TimeStampedModel):
    # ... existing fields ...
    completed_walkthroughs = models.JSONField(default=list, blank=True)
```

Create and run the migration:
```bash
python manage.py makemigrations users
python manage.py migrate
```

### B. Serializer Schema (`apps/authentication/serializers.py`)
Expose the new field in both retrieval (`MeSerializer`) and update (`UpdateMeSerializer`) schemas:

```python
# apps/authentication/serializers.py

class UpdateMeSerializer(serializers.Serializer):
    # ... existing fields ...
    completed_walkthroughs = serializers.ListField(
        child=serializers.CharField(), required=False
    )

class MeSerializer(serializers.Serializer):
    # ... existing fields ...
    completed_walkthroughs = serializers.ListField(child=serializers.CharField())
```

---

## 3. Next.js Frontend Blueprint

Once the backend supports `completed_walkthroughs`, the frontend can migrate from `localStorage` immediately.

### A. Update Profile Interface (`src/services/user.service.ts`)
Add `completedWalkthroughs` to the `UserProfile` return type and `completed_walkthroughs` to the `UpdateMeRequest` payload:

```diff
// src/services/user.service.ts

export interface UserProfile {
  // ... existing fields ...
  location: string | null;
  dateOfBirth: string | null;
+ completedWalkthroughs: string[];
}

export interface UpdateMeRequest {
  // ... existing fields ...
  location?: string;
  date_of_birth?: string;
+ completed_walkthroughs?: string[];
}
```

### B. Update the `useWalkthrough` Hook (`src/hooks/useWalkthrough.ts`)
Refactor the hook to check the user's synced profile state and dispatch an API patch request to finish the tour:

```typescript
"use client";

import { type DriveStep, driver } from "driver.js";
import { useEffect, useRef } from "react";
import "driver.js/dist/driver.css";
import { useUserStore } from "@/store/user.store";

interface UseWalkthroughProps {
  tourId: string;
  steps: DriveStep[];
  enabled?: boolean;
}

export function useWalkthrough({ tourId, steps, enabled = true }: UseWalkthroughProps) {
  const hasInitialized = useRef(false);
  const profile = useUserStore((s) => s.profile);
  const updateMe = useUserStore((s) => s.updateMe);

  useEffect(() => {
    if (!enabled || hasInitialized.current || !profile) return;

    // Check completion state from backend-persisted profile data
    const completedList = profile.completedWalkthroughs ?? [];
    if (completedList.includes(tourId)) return;

    hasInitialized.current = true;

    const timer = setTimeout(() => {
      const driverObj = driver({
        showProgress: true,
        allowClose: false,
        popoverClass: "codetopia-driver-theme",
        progressText: "{{current}} of {{total}}",
        doneBtnText: "Finish",
        nextBtnText: "Next",
        prevBtnText: "Prev",
        steps: steps,
        onDestroyStarted: () => {
          if (!driverObj.hasNextStep()) {
            // Append tour to profile walkthrough list and patch backend
            const updatedList = [...completedList, tourId];
            updateMe({ completed_walkthroughs: updatedList })
              .then(() => {
                driverObj.destroy();
              })
              .catch((err) => {
                console.error("Failed to save walkthrough state:", err);
                driverObj.destroy(); // fallback to destroy locally even if network fails
              });
          }
        },
      });

      driverObj.drive();
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [enabled, steps, tourId, profile, updateMe]);
}
```

### C. Seamless Unlocking of New Walks
When new features or tabs are unlocked dynamically, the backend merely appends/modifies the user roles/permissions. 
When the user visits the page associated with the new feature:
1. The route permission passes, mounting the feature component.
2. The hook inside the new component checks if `completedWalkthroughs` includes `new_feature_tour`.
3. Since it is absent, the new tour immediately starts guiding the member through their newly unlocked workspace.

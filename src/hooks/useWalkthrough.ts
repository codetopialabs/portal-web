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
  const { profile, updateMe } = useUserStore();

  // Maintain stable references to prevent parent re-renders from restarting or canceling the walkthrough
  const stepsRef = useRef(steps);
  const updateMeRef = useRef(updateMe);
  const profileRef = useRef(profile);

  useEffect(() => {
    stepsRef.current = steps;
  }, [steps]);

  useEffect(() => {
    updateMeRef.current = updateMe;
  }, [updateMe]);

  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: deliberately use refs for stable execution
  useEffect(() => {
    // Only proceed if enabled, profile is loaded, and we haven't initialized the driver yet
    if (!enabled || !profile) {
      return;
    }

    if (hasInitialized.current) {
      return;
    }

    const storageKey = `codetopia_walkthrough_${tourId}`;
    const isCompletedInStorage = localStorage.getItem(storageKey) === "completed";

    const completed = profile.completedWalkthroughs || [];
    const isCompletedInDB = completed.includes(tourId);

    if (isCompletedInStorage || isCompletedInDB) {
      if (isCompletedInDB && !isCompletedInStorage) {
        localStorage.setItem(storageKey, "completed");
      }
      return;
    }

    hasInitialized.current = true;

    const timer = setTimeout(() => {
      try {
        const driverObj = driver({
          showProgress: true,
          allowClose: false, // Prevents closing via clicking outside or Escape key
          popoverClass: "codetopia-driver-theme",
          progressText: "{{current}} of {{total}}",
          doneBtnText: "Finish",
          nextBtnText: "Next",
          prevBtnText: "Prev",
          steps: stepsRef.current,
          onDestroyStarted: () => {
            if (!driverObj.hasNextStep()) {
              localStorage.setItem(storageKey, "completed");

              const currentCompleted = profileRef.current?.completedWalkthroughs || [];
              if (!currentCompleted.includes(tourId)) {
                updateMeRef
                  .current({
                    completed_walkthroughs: [...currentCompleted, tourId],
                  })
                  .then(() => {
                    // no-op: completion syncing is best-effort
                  })
                  .catch(() => {
                    // intentionally ignore sync failures here
                  });
              }
              driverObj.destroy();
            }
          },
        });

        driverObj.drive();
      } catch {
        // intentionally ignore driver initialization errors
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      // Reset initialization ref so Strict Mode simulated mounts can successfully re-run the walkthrough timer
      hasInitialized.current = false;
    };
  }, [enabled, Boolean(profile), tourId]);
}

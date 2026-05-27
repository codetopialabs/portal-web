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
    console.log(`[useWalkthrough] Effect triggered for tourId: "${tourId}"`);
    console.log(
      `[useWalkthrough] State - enabled: ${enabled}, profileExists: ${Boolean(profile)}, hasInitialized: ${hasInitialized.current}`
    );

    // Only proceed if enabled, profile is loaded, and we haven't initialized the driver yet
    if (!enabled || !profile) {
      console.log("[useWalkthrough] Blocked: either not enabled or profile is not loaded yet.");
      return;
    }

    if (hasInitialized.current) {
      console.log("[useWalkthrough] Blocked: already initialized.");
      return;
    }

    // Dual-check: prioritizing fast LocalStorage read first, with DB sync fallback
    const storageKey = `codetopia_walkthrough_${tourId}`;
    const isCompletedInStorage = localStorage.getItem(storageKey) === "completed";

    const completed = profile.completedWalkthroughs || [];
    const isCompletedInDB = completed.includes(tourId);

    console.log(
      `[useWalkthrough] Checking status - LocalStorage: ${isCompletedInStorage}, DB: ${isCompletedInDB}`
    );

    if (isCompletedInStorage || isCompletedInDB) {
      console.log(`[useWalkthrough] Walkthrough "${tourId}" already completed. Skipping.`);
      // If completed in DB but not in localStorage, cache it locally for sub-millisecond loads next time
      if (isCompletedInDB && !isCompletedInStorage) {
        console.log(
          `[useWalkthrough] DB shows completed but LocalStorage does not. Backfilling LocalStorage cache...`
        );
        localStorage.setItem(storageKey, "completed");
      }
      return;
    }

    hasInitialized.current = true;
    console.log(`[useWalkthrough] Initializing driver for "${tourId}"...`);

    // A tiny timeout ensures the UI has finished mounting/animating before the tour begins
    const timer = setTimeout(() => {
      try {
        console.log(
          `[useWalkthrough] Starting driver.drive() for "${tourId}" with ${stepsRef.current.length} steps.`
        );
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
            console.log(
              `[useWalkthrough] onDestroyStarted triggered for "${tourId}". Has next step: ${driverObj.hasNextStep()}`
            );
            // Only allow destroying the tour if they are on the last step (finishing)
            if (!driverObj.hasNextStep()) {
              console.log(
                `[useWalkthrough] Tour "${tourId}" completed! Saving state to storage and database...`
              );
              localStorage.setItem(storageKey, "completed");

              // Persist the completion to the backend DB
              const currentCompleted = profileRef.current?.completedWalkthroughs || [];
              if (!currentCompleted.includes(tourId)) {
                updateMeRef
                  .current({
                    completed_walkthroughs: [...currentCompleted, tourId],
                  })
                  .then(() => {
                    console.log(
                      `[useWalkthrough] Successfully synced "${tourId}" completion with backend.`
                    );
                  })
                  .catch((err) => {
                    console.error("Failed to sync walkthrough completion with backend:", err);
                  });
              }
              driverObj.destroy();
            }
          },
        });

        driverObj.drive();
        console.log(`[useWalkthrough] driver.drive() successfully invoked for "${tourId}".`);
      } catch (err) {
        console.error(`[useWalkthrough] Error during driver initialization for "${tourId}":`, err);
      }
    }, 500);

    return () => {
      console.log(`[useWalkthrough] Cleanup triggered for tourId: "${tourId}"`);
      clearTimeout(timer);
      // Reset initialization ref so Strict Mode simulated mounts can successfully re-run the walkthrough timer
      hasInitialized.current = false;
    };
  }, [enabled, Boolean(profile), tourId]);
}

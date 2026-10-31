"use client";

import { useRouter } from "next/navigation";
import { startTransition } from "react";
import {
  ProfileUnavailable,
  UNAVAILABLE_ACTION_CLASS,
} from "@/components/profile/ProfileUnavailable";

// The profile couldn't be loaded (the API down or busy), which isn't the same
// as the member not existing, so it says so and offers another go.
export default function ProfileError({ reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <ProfileUnavailable
      title="Couldn't load this profile."
      message="Something went wrong on our side. Try again in a moment."
      action={
        <button
          type="button"
          // Refetch on the server, then render the page again.
          onClick={() =>
            startTransition(() => {
              router.refresh();
              reset();
            })
          }
          className={UNAVAILABLE_ACTION_CLASS}
        >
          Try again
        </button>
      }
    />
  );
}

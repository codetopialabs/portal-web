"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PiArrowUpRight } from "react-icons/pi";
import {
  ProfileUnavailable,
  UNAVAILABLE_ACTION_CLASS,
} from "@/components/profile/ProfileUnavailable";
import { getJoinCommunityUrl } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";

export default function ProfileNotFound() {
  // The session lives in storage, so it's only known after mounting.
  const session = useAuthStore((s) => s.session);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <ProfileUnavailable
      title="No one here by that name."
      message="The link might be off, or the profile isn't public."
      action={
        // Members can browse everyone; visitors can't, so they're pointed at
        // joining instead.
        mounted && session ? (
          <Link href="/community" className={UNAVAILABLE_ACTION_CLASS}>
            See all members
          </Link>
        ) : mounted ? (
          <a
            href={getJoinCommunityUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className={UNAVAILABLE_ACTION_CLASS}
          >
            Join the community
            <span className="sr-only"> (opens in a new tab)</span>
            <PiArrowUpRight
              aria-hidden
              className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </a>
        ) : (
          <div className="h-9 w-48" />
        )
      }
    />
  );
}

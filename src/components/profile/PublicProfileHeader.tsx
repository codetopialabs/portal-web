"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PiArrowUpRight } from "react-icons/pi";
import { getCommunitySiteUrl, getJoinCommunityUrl } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";

export function PublicProfileHeader() {
  const session = useAuthStore((s) => s.session);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-black/5 bg-white/85 text-zinc-950 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/85 dark:text-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* The logo leads to the community site, the home of everything here,
            in a new tab so the profile stays open. */}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={getCommunitySiteUrl()}
          className="flex items-center"
        >
          {/* Black and white files at full size rather than one filtered,
              resized image, so the thin letters stay sharp. */}
          <Image
            src="/logos/community-logo-black.png"
            alt="Codetopia Community"
            width={773}
            height={156}
            unoptimized
            className="h-8 w-auto dark:hidden"
            priority
          />
          <Image
            src="/logos/community-logo-white.png"
            alt="Codetopia Community"
            width={773}
            height={156}
            unoptimized
            className="hidden h-8 w-auto dark:block"
            priority
          />
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
        <nav className="flex items-center gap-2">
          {mounted && session ? (
            <Link
              href="/community"
              className="hidden h-8 items-center gap-2 border border-black/15 px-3 font-mono text-[13px] font-medium text-zinc-700 transition-colors hover:bg-zinc-950 hover:text-white sm:inline-flex dark:border-white/15 dark:text-zinc-300 dark:hover:bg-white dark:hover:text-zinc-950"
            >
              Community
            </Link>
          ) : mounted && !session ? (
            // Most visitors arrive from a shared link without an account, so
            // joining is the button and signing in is the quiet way back.
            <div className="flex items-center gap-5">
              <Link
                href="/login"
                className="font-mono text-[13px] text-zinc-500 transition-colors hover:text-zinc-950 dark:hover:text-white"
              >
                Sign in
              </Link>
              <a
                href={getJoinCommunityUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex h-8 items-center gap-1 bg-zinc-950 px-3 font-mono text-[13px] font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
              >
                <span>
                  Join<span className="hidden sm:inline">&nbsp;the community</span>
                </span>
                <span className="sr-only"> (opens in a new tab)</span>
                <PiArrowUpRight
                  aria-hidden
                  className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </a>
            </div>
          ) : (
            <div className="h-8 w-32 sm:w-64" /> /* Placeholder while loading */
          )}
        </nav>
      </div>
    </header>
  );
}

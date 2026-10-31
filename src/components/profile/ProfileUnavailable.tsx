"use client";

import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { ProfileCoverArt } from "@/components/profile/ProfileCoverArt";
import { PublicProfileFooter } from "@/components/profile/PublicProfileFooter";
import { PublicProfileHeader } from "@/components/profile/PublicProfileHeader";
import { handleFontSize } from "@/lib/cover-art";

// For when a profile can't be shown, shaped like one for the name that was
// asked for: a cover drawn from it, an empty avatar and the handle faint
// behind, so it reads as the page the visitor expected, with no one in it.
export function ProfileUnavailable({
  title,
  message,
  action,
}: {
  title: string;
  message: string;
  action: ReactNode;
}) {
  const pathname = usePathname();
  const handle = decodeURIComponent(pathname.split("/")[1] ?? "").replace(/^@/, "");

  // The theme is the visitor's own choice, so it's only known after
  // mounting. Dark by default, as on profiles.
  const [dark, setDark] = useState(true);
  useEffect(() => {
    try {
      if (window.localStorage.getItem("profile-theme") === "light") setDark(false);
    } catch {
      // Storage can be blocked; dark it is.
    }
  }, []);

  return (
    <div className={dark ? "dark" : undefined}>
      <div className="flex min-h-screen flex-col bg-[#ebebeb] text-zinc-900 dark:bg-[#0b0b0b] dark:text-zinc-100">
        <PublicProfileHeader />

        <main className="flex-grow overflow-x-clip bg-white pt-16 pb-28 dark:bg-[#151515] lg:pb-32">
          <div className="h-40 w-full overflow-hidden sm:h-64 lg:h-80">
            <ProfileCoverArt seed={handle || "codetopia"} />
          </div>

          {/* The rail's column is left empty, so the text starts where a
              profile's does. */}
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:pl-38">
            <header className="relative">
              {handle && (
                <p
                  aria-hidden="true"
                  className="pointer-events-none absolute right-0 bottom-0 hidden select-none whitespace-nowrap font-mono font-semibold leading-[0.75] tracking-tighter text-[#f4f4f4] [mask-image:linear-gradient(to_bottom,black_45%,transparent)] dark:text-[#1b1b1b] sm:block"
                  style={{ fontSize: handleFontSize(handle) }}
                >
                  {handle}
                </p>
              )}

              <div className="relative -mt-10 flex h-28 w-28 items-center justify-center bg-[#f2f2f2] font-sans text-5xl font-semibold text-zinc-300 ring-1 ring-black/10 dark:bg-[#1c1c1c] dark:text-zinc-700 dark:ring-white/10 sm:-mt-14 sm:h-40 sm:w-40 sm:text-7xl">
                ?
              </div>

              <div className="relative mt-5 max-w-3xl sm:mt-6">
                <h1 className="font-sans text-[32px] font-semibold leading-tight tracking-tighter text-zinc-950 dark:text-white sm:text-5xl">
                  {title}
                </h1>
                {handle && (
                  <p className="mt-1 truncate font-mono text-base text-zinc-500 sm:text-lg">
                    @{handle}
                  </p>
                )}
                <p className="mt-3 font-mono text-base text-zinc-600 dark:text-zinc-400 sm:text-lg">
                  {message}
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">{action}</div>
              </div>
            </header>
          </div>
        </main>

        <PublicProfileFooter />
      </div>
    </div>
  );
}

// The one action under the message: solid, like the header's main button.
export const UNAVAILABLE_ACTION_CLASS =
  "group inline-flex h-9 items-center gap-1 bg-zinc-950 px-4 font-mono text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200";

"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
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
        <Link href="/" className="flex items-center">
          <Image
            src="/logos/codetopia-community.png"
            alt="Codetopia Community"
            width={128}
            height={32}
            className="h-8 w-auto object-contain brightness-0 dark:invert"
            priority
          />
        </Link>
        <nav className="flex items-center gap-2">
          {mounted && session ? (
            <Link
              href="/community"
              className="hidden h-9 items-center gap-2 border border-black/15 px-3 font-mono text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-950 hover:text-white sm:inline-flex dark:border-white/15 dark:text-zinc-300 dark:hover:bg-white dark:hover:text-zinc-950"
            >
              Community
            </Link>
          ) : mounted && !session ? (
            <Link
              href="/login"
              className="inline-flex h-9 items-center bg-zinc-950 px-3 font-mono text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-emerald-100"
            >
              Sign in
            </Link>
          ) : (
            <div className="h-9 w-20" /> /* Placeholder while loading */
          )}
        </nav>
      </div>
    </header>
  );
}

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
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-zinc-950/85 text-white backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center">
          <Image
            src="/logos/codetopia-community.png"
            alt="Codetopia Community"
            width={128}
            height={32}
            className="h-8 w-auto object-contain brightness-0 invert"
            priority
          />
        </Link>
        <nav className="flex items-center gap-2">
          {mounted && session ? (
            <Link
              href="/community"
              className="hidden h-9 items-center gap-2 border border-white/15 px-3 font-mono text-[10px] font-black uppercase tracking-[0.16em] text-zinc-300 transition-colors hover:bg-white hover:text-zinc-950 sm:inline-flex"
            >
              Community
            </Link>
          ) : mounted && !session ? (
            <Link
              href="/login"
              className="inline-flex h-9 items-center border border-white/15 bg-white px-3 font-mono text-[10px] font-black uppercase tracking-[0.16em] text-zinc-950 transition-colors hover:bg-emerald-100"
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

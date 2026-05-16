import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import React from "react";

export function NotFound() {
  return (
    <div className="min-h-screen bg-[#f9fafb] flex flex-col">
      <div className="bg-black py-2 sticky top-0 z-50">
        <header className="flex items-center justify-between max-w-6xl mx-auto text-white px-4">
          <Link href="/" className="flex items-center gap-2">
            {/* biome-ignore lint/performance/noImgElement: logo */}
            <img
              src="/codetopia.png"
              alt="Codetopia logo"
              className="w-[70px] h-[70px] object-contain"
            />
          </Link>
        </header>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center pb-20">
        <p className="font-mono font-semibold text-sm text-zinc-900">Member not found</p>
        <Link
          href="/community"
          className="inline-flex items-center gap-2 font-mono text-sm text-zinc-500 hover:text-zinc-900 transition-colors border-b border-zinc-300 hover:border-zinc-900 pb-px"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Community
        </Link>
      </div>
    </div>
  );
}

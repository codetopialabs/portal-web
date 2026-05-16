import React from "react";

export function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-[#f9fafb] flex flex-col">
      <div className="bg-black py-2 sticky top-0 z-50">
        <header className="flex items-center justify-between max-w-6xl mx-auto text-white px-4 opacity-50">
          <div className="flex items-center gap-2">
            {/* biome-ignore lint/performance/noImgElement: logo */}
            <img
              src="/codetopia.png"
              alt="Codetopia logo"
              className="w-[70px] h-[70px] object-contain"
            />
          </div>
        </header>
      </div>
      <div className="max-w-6xl mx-auto w-full px-4 pb-20 pt-8 space-y-8 animate-pulse">
        <div className="bg-white border border-zinc-200 p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="w-20 h-20 rounded-full bg-zinc-100 shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="h-6 w-48 bg-zinc-100" />
              <div className="h-4 w-32 bg-zinc-100" />
              <div className="h-4 w-64 bg-zinc-100" />
            </div>
          </div>
          <div className="h-20 w-full bg-zinc-50" />
        </div>
      </div>
    </div>
  );
}

"use client";

import { AppWindow } from "lucide-react";

export default function SettingsAppsPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center border border-zinc-200 bg-white">
      <div className="w-12 h-12 border border-zinc-200 bg-zinc-50 flex items-center justify-center mb-5">
        <AppWindow className="w-5 h-5 text-zinc-300" />
      </div>
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-400 mb-2">
        Coming Soon
      </p>
      <p className="font-mono font-bold text-sm text-zinc-900 mb-1">Connected Apps</p>
      <p className="font-mono text-xs text-zinc-400 max-w-xs leading-relaxed">
        Third-party app management is on the roadmap. You'll be able to view and revoke OAuth
        access here once it's ready.
      </p>
    </div>
  );
}

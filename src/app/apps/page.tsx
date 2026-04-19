"use client";

import React from "react";
import { DashboardShell } from "@/components/dashboard/Shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppWindow, Search, ShieldCheck, X } from "lucide-react";

interface AppConnection {
  id: string;
  name: string;
  developer: string;
  lastAccessed: string;
  scopes: string[];
}

const mockApps: AppConnection[] = [
  {
    id: "1",
    name: "Codetopia Dev Portal",
    developer: "Codetopia Global",
    lastAccessed: "2 hours ago",
    scopes: ["Profile Read", "Code Access", "Email"],
  },
  {
    id: "2",
    name: "CommuniTrack",
    developer: "Community Labs",
    lastAccessed: "1 day ago",
    scopes: ["Identity", "Public Stats"],
  },
  {
    id: "3",
    name: "Forge Engine",
    developer: "Unknown Dev",
    lastAccessed: "3 months ago",
    scopes: ["Account Write", "Secret Access"],
  },
];

export default function AuthorizedAppsPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [apps, setApps] = React.useState(mockApps);

  const filtered = apps.filter(
    (app) =>
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.developer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function revoke(id: string) {
    setApps((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <DashboardShell>
      <div className="max-w-3xl space-y-8 pb-20">

        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-sans font-black uppercase tracking-tighter text-zinc-900">
            Authorized Apps
          </h1>
          <p className="font-mono text-xs uppercase tracking-widest text-zinc-400">
            Apps with access to your identity — revoke anytime
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
          <Input
            placeholder="Search apps..."
            className="h-11 rounded-none border-zinc-200 bg-white pl-9 font-mono text-xs focus-visible:ring-0 focus-visible:border-zinc-900 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* App List */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border border-zinc-200 bg-white">
            <div className="w-12 h-12 border border-zinc-200 bg-zinc-50 flex items-center justify-center mb-4">
              <AppWindow className="w-5 h-5 text-zinc-300" />
            </div>
            <p className="font-mono text-[10px] font-black uppercase tracking-widest text-zinc-900 mb-1">
              {searchQuery ? "No results found" : "No Apps Connected"}
            </p>
            <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-400">
              {searchQuery ? "Try a different search term" : "You haven't authorized any third-party apps yet"}
            </p>
          </div>
        ) : (
          <div className="border border-zinc-200 bg-white overflow-hidden divide-y divide-zinc-100">
            {filtered.map((app) => (
              <div key={app.id} className="p-5 flex items-center gap-5 group hover:bg-zinc-50 transition-all">
                {/* Icon */}
                <div className="w-10 h-10 border border-zinc-200 bg-zinc-50 flex items-center justify-center shrink-0">
                  <AppWindow className="w-4 h-4 text-zinc-400" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-sans font-black text-sm uppercase tracking-tight text-zinc-900">
                      {app.name}
                    </span>
                    <span className="font-mono text-[8px] uppercase tracking-widest text-zinc-400 border border-zinc-200 px-1.5 py-0.5">
                      {app.developer}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {app.scopes.map((scope) => (
                      <span
                        key={scope}
                        className="inline-flex items-center gap-1 font-mono text-[8px] uppercase tracking-widest text-zinc-500 bg-zinc-50 border border-zinc-100 px-2 py-0.5"
                      >
                        <ShieldCheck className="w-2.5 h-2.5 text-zinc-400" />
                        {scope}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Last accessed + revoke */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-400">
                    {app.lastAccessed}
                  </span>
                  <button
                    onClick={() => revoke(app.id)}
                    className="inline-flex items-center gap-1 font-mono text-[8px] uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors border-b border-transparent hover:border-zinc-900 pb-px"
                  >
                    <X className="w-3 h-3" />
                    Revoke
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer count */}
        {filtered.length > 0 && (
          <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-400">
            {filtered.length} app{filtered.length !== 1 ? "s" : ""} connected
          </p>
        )}

      </div>
    </DashboardShell>
  );
}

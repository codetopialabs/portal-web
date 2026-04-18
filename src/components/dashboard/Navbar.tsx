"use client";

import {
  Bell,
  Settings,
  HelpCircle,
  Plus
} from "lucide-react";

import { SidebarTrigger } from "@/components/ui/sidebar";

export function DashboardNavbar() {
  return (
    <header className="h-16 border-b border-zinc-200 bg-white/80 backdrop-blur-xl flex items-center justify-between px-6 relative z-40">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="text-zinc-500 hover:text-zinc-900 transition-colors" />
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-zinc-400">Identity Provider</span>
          <span className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-zinc-900/40">/</span>
          <span className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-zinc-900">Dashboard</span>
        </div>
      </div>

      <div className="flex items-center gap-6">

        <div className="flex items-center gap-1">
          <button className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-all relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-zinc-900 rounded-full border border-white" />
          </button>
          <button className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-all">
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>

        <div className="h-6 w-px bg-zinc-200" />

        <button className="flex items-center group">
          <div className="w-8 h-8 rounded-full overflow-hidden group-hover:ring-2 group-hover:ring-zinc-100 transition-all">
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop"
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </button>
      </div>
    </header>
  );
}

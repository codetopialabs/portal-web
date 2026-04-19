"use client";

import { Bell, HelpCircle, ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";

const routeLabels: Record<string, string> = {
  "": "Dashboard",
  community: "Community",
  profile: "Profile",
  security: "Security",
  apps: "Authorized Apps",
  activity: "Activity Log",
};

function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  // Root = just "Dashboard"
  if (segments.length === 0) {
    return (
      <div className="flex items-center gap-1.5">
        <Home className="w-3 h-3 text-zinc-400" />
        <span className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900">
          Dashboard
        </span>
      </div>
    );
  }

  const crumbs = segments.map((seg, idx) => {
    const href = "/" + segments.slice(0, idx + 1).join("/");
    const label = routeLabels[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1);
    const isLast = idx === segments.length - 1;
    return { href, label, isLast };
  });

  return (
    <div className="flex items-center gap-1.5">
      <Link href="/" className="text-zinc-400 hover:text-zinc-900 transition-colors">
        <Home className="w-3 h-3" />
      </Link>
      {crumbs.map((crumb) => (
        <span key={crumb.href} className="flex items-center gap-1.5">
          <ChevronRight className="w-3 h-3 text-zinc-300" />
          {crumb.isLast ? (
            <span className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900">
              {crumb.label}
            </span>
          ) : (
            <Link
              href={crumb.href}
              className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-zinc-900 transition-colors"
            >
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </div>
  );
}

export function DashboardNavbar() {
  return (
    <header className="h-16 border-b border-zinc-200 bg-white/80 backdrop-blur-xl flex items-center justify-between px-6 relative z-40">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="text-zinc-500 hover:text-zinc-900 transition-colors" />
        <Breadcrumbs />
      </div>

      <div className="flex items-center gap-2 sm:gap-6">
        <div className="flex items-center gap-1">
          <Link
            href="/activity"
            className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-all relative inline-flex"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-zinc-900 rounded-full border border-white" />
          </Link>
          <button className="hidden sm:flex p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-all">
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>

        <div className="h-6 w-px bg-zinc-200 hidden sm:block" />

        <Link href="/profile" className="flex items-center group">
          <div className="w-8 h-8 rounded-full overflow-hidden group-hover:ring-2 group-hover:ring-zinc-200 transition-all">
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop"
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </Link>
      </div>
    </header>
  );
}

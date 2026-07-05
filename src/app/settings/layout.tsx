"use client";

import { AppWindow, BriefcaseBusiness, Shield, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type React from "react";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { DashboardShell } from "@/components/dashboard/Shell";

const tabs = [
  { label: "Profile", href: "/settings/profile", icon: User },
  { label: "Career", href: "/settings/career", icon: BriefcaseBusiness },
  { label: "Security", href: "/settings/security", icon: Shield },
  { label: "Apps", href: "/settings/apps", icon: AppWindow },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <RouteGuard>
      <DashboardShell>
        <div className="max-w-7xl mx-auto pb-20 space-y-10">
          <div className="flex flex-col gap-2 border-b border-zinc-100 pb-8">
            <p className="font-mono text-xs font-medium text-zinc-400">Account</p>
            <h1 className="font-sans text-4xl font-bold tracking-tight text-zinc-950">Settings</h1>
            <p className="max-w-2xl font-mono text-base leading-7 text-zinc-500">
              Manage your profile, security, and connected app access.
            </p>
          </div>

          <div
            id="settings-tabs"
            className="flex overflow-x-auto overflow-y-hidden border-b border-zinc-200"
          >
            {tabs.map((tab) => {
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`flex items-center gap-2 px-5 py-3.5 font-mono text-sm font-medium border-b-2 -mb-px transition-all ${
                    isActive
                      ? "border-zinc-900 text-zinc-900"
                      : "border-transparent text-zinc-400 hover:text-zinc-700 hover:border-zinc-300"
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </Link>
              );
            })}
          </div>

          {children}
        </div>
      </DashboardShell>
    </RouteGuard>
  );
}

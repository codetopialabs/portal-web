"use client";

import { AppWindow, Shield, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type React from "react";
import { DashboardShell } from "@/components/dashboard/Shell";

const tabs = [
  { label: "Profile", href: "/settings/profile", icon: User },
  { label: "Security", href: "/settings/security", icon: Shield },
  { label: "Connected Apps", href: "/settings/apps", icon: AppWindow },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <DashboardShell>
      <div className="max-w-7xl mx-auto pb-20">
        <div className="flex flex-col gap-1 mb-8">
          <h1 className="text-3xl font-sans font-black uppercase tracking-tighter text-zinc-900">
            Settings
          </h1>
          <p className="font-mono text-sm text-zinc-500">
            Manage your profile, security, and connected apps
          </p>
        </div>

        <div className="flex border-b border-zinc-200 mb-8">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center gap-2 px-5 py-3 font-mono text-sm border-b-2 -mb-px transition-all ${
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
  );
}

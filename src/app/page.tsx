"use client";

import { DashboardShell } from "@/components/dashboard/Shell";
import {
  Shield,
  Key,
  Mail,
  MapPin,
  Calendar,
  ExternalLink,
  Edit3,
  Lock,
  ChevronRight,
  UserCheck,
  AppWindow,
  Clock,
} from "lucide-react";
import Link from "next/link";
import React from "react";

const quickActions = [
  {
    icon: Lock,
    label: "Change Password",
    description: "Update your security credentials",
    href: "/security",
  },
  {
    icon: Shield,
    label: "Two-Factor Auth",
    description: "Enable additional security",
    href: "/security",
  },
  {
    icon: Edit3,
    label: "Update Profile",
    description: "Edit your publicly visible data",
    href: "/profile",
  },
  {
    icon: UserCheck,
    label: "Authorized Apps",
    description: "Manage third-party access",
    href: "/apps",
  },
];

const connectedApps = [
  { name: "Codetopia Discord", scope: "Identity, Email", lastUsed: "2 hours ago" },
  { name: "Community Forum", scope: "Identity, Write", lastUsed: "Yesterday" },
  { name: "Dev Resources Portal", scope: "Identity, Read", lastUsed: "3 days ago" },
];

const userData = {
  name: "Kadin Vaccaro",
  email: "kadin.v@codetopia.com",
  location: "Toronto, Ontario, Canada",
  joinedDate: "Jan 2024",
  avatarUrl:
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop",
  bannerUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2064",
  roles: [
    { label: "Community Member" },
    { label: "Active Volunteer" },
    { label: "Core Delegate" },
    { label: "Beta Tester" },
  ],
  identityId: "#CT-7724-912A",
  phone: "+1 (555) 001-4920",
  address: "390 Market St, Toronto, CA",
};

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-7 h-7 bg-black text-white flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5" />
      </div>
      <h2 className="font-sans font-black uppercase text-sm tracking-widest text-zinc-900">
        {title}
      </h2>
    </div>
  );
}

function Divider() {
  return <div className="border-t border-zinc-100" />;
}

export default function UserDashboard() {
  return (
    <DashboardShell>
      <div className="space-y-8 max-w-6xl">
        {/* ── Profile Header ── */}
        <section className="relative overflow-hidden border border-zinc-200 bg-white">
          {/* Banner */}
          <div
            className="h-36 w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${userData.bannerUrl})` }}
          >
            <div className="h-full w-full bg-white/60 backdrop-blur-sm" />
          </div>

          {/* Content */}
          <div className="px-8 pb-8 relative z-10 flex flex-col md:flex-row items-start justify-between gap-8">
            <div className="flex flex-col md:flex-row items-start gap-6 w-full">
              {/* Avatar */}
              <div className="w-24 h-24 -mt-12 shrink-0 rounded-full overflow-hidden border-4 border-white shadow-lg relative z-20 bg-zinc-100">
                <img
                  src={userData.avatarUrl}
                  alt={userData.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex-1 pt-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-1">
                  <h1 className="text-3xl font-sans font-black uppercase tracking-tighter text-zinc-900 leading-none">
                    {userData.name}
                  </h1>
                </div>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-zinc-400 font-mono text-[9px] uppercase tracking-widest mb-4">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3 h-3" />
                    {userData.email}
                  </span>
                  <span className="text-zinc-200">·</span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3" />
                    {userData.location}
                  </span>
                  <span className="text-zinc-200">·</span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    Joined {userData.joinedDate}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {userData.roles.map((role) => (
                    <span
                      key={role.label}
                      className="font-mono text-[7px] font-bold uppercase tracking-[0.15em] leading-none px-2.5 py-1.5 rounded-full border border-zinc-200 text-zinc-500 bg-white"
                    >
                      {role.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1 shrink-0">
              <Link
                href="/profile"
                className="h-10 px-5 border border-zinc-200 text-zinc-600 font-mono text-[9px] uppercase tracking-widest hover:border-zinc-900 hover:text-zinc-900 transition-all flex items-center gap-2"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </Link>
              <button className="h-10 px-6 bg-black text-white font-mono text-[9px] uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center gap-2 group">
                Share{" "}
                <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </section>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left — Quick Actions + Identity Record */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <section className="space-y-4">
              <SectionHeader icon={Key} title="Quick Actions" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {quickActions.map((action) => (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="flex items-start text-left p-5 bg-white border border-zinc-200 hover:border-zinc-400 hover:shadow-sm transition-all group relative overflow-hidden"
                  >
                    <div className="relative z-10 w-full">
                      <div className="p-2 w-fit mb-3 bg-zinc-50 border border-zinc-100 group-hover:border-zinc-300 transition-colors">
                        <action.icon className="w-4 h-4 text-zinc-900" />
                      </div>
                      <h3 className="text-zinc-900 font-mono text-[10px] uppercase tracking-widest font-bold mb-1">
                        {action.label}
                      </h3>
                      <p className="text-zinc-400 font-mono text-[9px] uppercase tracking-wider leading-relaxed">
                        {action.description}
                      </p>
                    </div>
                    <ChevronRight className="absolute bottom-5 right-5 w-4 h-4 text-zinc-200 group-hover:text-zinc-900 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                ))}
              </div>
            </section>

            <Divider />

            {/* Identity Record */}
            <section className="space-y-4">
              <SectionHeader icon={UserCheck} title="Identity Record" />
              <div className="bg-white border border-zinc-200 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <DataField label="Community ID" value={userData.identityId} />
                  <DataField label="Full Name" value={userData.name} />
                  <DataField label="Phone" value={userData.phone} />
                  <DataField label="Address" value={userData.address} />
                </div>
              </div>
            </section>
          </div>

          {/* Right — Connected Apps + Node Status */}
          <div className="space-y-8">
            {/* Connected Apps */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <SectionHeader icon={AppWindow} title="Connected Apps" />
              </div>
              <div className="bg-white border border-zinc-200 divide-y divide-zinc-100 overflow-hidden">
                {connectedApps.map((app) => (
                  <div
                    key={app.name}
                    className="flex items-center gap-3 p-4 hover:bg-zinc-50 transition-all"
                  >
                    <div className="w-8 h-8 border border-zinc-200 bg-zinc-50 flex items-center justify-center shrink-0">
                      <AppWindow className="w-3.5 h-3.5 text-zinc-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-[10px] font-black uppercase tracking-widest text-zinc-900 truncate leading-none">
                        {app.name}
                      </p>
                      <p className="font-mono text-[8px] uppercase tracking-widest text-zinc-400 mt-0.5">
                        {app.scope}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Clock className="w-2.5 h-2.5 text-zinc-300" />
                      <span className="font-mono text-[8px] uppercase tracking-widest text-zinc-400 whitespace-nowrap">
                        {app.lastUsed}
                      </span>
                    </div>
                  </div>
                ))}
                <div className="p-3 bg-zinc-50">
                  <Link
                    href="/apps"
                    className="w-full flex items-center justify-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors h-7"
                  >
                    Manage Apps <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </section>

            {/* Node Status */}
            <section className="space-y-4">
              <SectionHeader icon={Shield} title="Account Status" />
              <div className="bg-white border border-zinc-200 p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-zinc-900 rounded-full animate-pulse" />
                  <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-900 font-bold">
                    Active
                  </span>
                </div>
                <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-400 leading-relaxed">
                  Your account is secure. Password last changed 4 days ago.
                </p>
                <Link
                  href="/activity"
                  className="font-mono text-[9px] uppercase tracking-widest text-zinc-900 border-b border-zinc-900 pb-px hover:text-zinc-400 hover:border-zinc-400 transition-all font-bold inline-block"
                >
                  View Activity Log
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

function DataField({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-5 border-zinc-100 odd:border-r border-b last:border-b-0 hover:bg-zinc-50 transition-all">
      <span className="block font-mono text-[8px] uppercase tracking-[0.3em] text-zinc-400 font-bold mb-1.5">
        {label}
      </span>
      <span className="block font-mono text-xs font-bold text-zinc-900 tracking-tight">
        {value}
      </span>
    </div>
  );
}

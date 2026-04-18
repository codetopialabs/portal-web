"use client";

import { DashboardShell } from "@/components/dashboard/Shell";
import {
  Shield,
  Key,
  Mail,
  MapPin,
  Phone,
  Calendar,
  ArrowRight,
  ExternalLink,
  Edit3,
  Lock,
  ChevronRight,
  UserCheck,
  AppWindow
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import Link from "next/link";

const quickActions = [
  { icon: Lock, label: "Change Password", description: "Update your security credentials" },
  { icon: Shield, label: "Two-Factor Auth", description: "Enable additional security" },
  { icon: Edit3, label: "Update Profile", description: "Edit your publicly visible data" },
  { icon: UserCheck, label: "Verify Identity", description: "Complete KYC verification" },
];

const connectedApps = [
  { name: "Codetopia Discord", scope: "Identify, Email", lastUsed: "2 hours ago" },
  { name: "Community Forum", scope: "Identify, Write", lastUsed: "Yesterday" },
  { name: "Dev Resources Portal", scope: "Identity, Read", lastUsed: "3 days ago" },
];

const userData = {
  name: "Kadin Vaccaro",
  email: "kadin.v@codetopia.com",
  location: "Toronto, Ontario, Canada",
  joinedDate: "Jan 2024",
  avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop",
  bannerUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2064",
  roles: [
    { label: "Community Member", variant: "outline", color: "emerald" },
    { label: "Active Volunteer", variant: "outline", color: "sky" },
    { label: "Core Delegate", variant: "outline", color: "indigo" },
    { label: "Beta Tester", variant: "outline", color: "rose" },
  ],
  identityId: "#CT-7724-912A",
  phone: "+1 (555) 001-4920",
  address: "390 Market St, Toronto, CA",
};

export default function UserDashboard() {
  return (
    <DashboardShell>
      <div className="space-y-12 max-w-6xl">

        {/* Profile Header Block (Inspo: Nasim Image) */}
        <section className="relative overflow-hidden border border-zinc-200 bg-white">
          <div
            className="h-32 w-full bg-cover bg-center opacity-20"
            style={{ backgroundImage: `url(${userData.bannerUrl})` }}
          />
          <div className="px-10 pb-10 relative z-10 flex flex-col md:flex-row items-start justify-between gap-12">
            <div className="flex flex-col md:flex-row items-start gap-8 w-full">
              <div className="w-28 h-28 -mt-14 bg-zinc-100 shrink-0 rounded-full overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.1)] border-4 border-white relative z-20">
                <img
                  src={userData.avatarUrl}
                  alt={userData.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 pt-2">
                <h1 className="text-4xl font-sans font-black uppercase tracking-tighter text-zinc-900 mb-1">{userData.name}</h1>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-zinc-500 font-mono text-[10px] uppercase tracking-widest mb-4">
                  <div className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> {userData.email}</div>
                  <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {userData.location}</div>
                  <div className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Joined {userData.joinedDate}</div>
                </div>

                <div className="flex flex-wrap gap-2 max-w-2xl">
                  {userData.roles.map((role, idx) => (
                    <RoleTag key={`${role.label}-${idx}`} label={role.label} variant={role.variant as any} color={role.color as any} />
                  ))}
                </div>
              </div>
            </div>
            <div className="pt-2 w-full md:w-auto">
              <button className="w-full md:w-auto px-8 h-12 bg-black text-white font-sans font-black uppercase tracking-widest text-xs hover:bg-zinc-800 transition-all flex items-center justify-center gap-3 group">
                Share Profile <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </section>

        {/* Action Tabs / Quick Links */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Left Column: Personal Data & Connected Apps */}
          <div className="lg:col-span-2 space-y-12">

            {/* Quick Actions Grid */}
            <div className="space-y-6">
              <h2 className="font-sans font-black uppercase text-xl tracking-tight flex items-center gap-3 text-zinc-900">
                <Key className="w-5 h-5 text-zinc-400" /> Quick Actions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickActions.map((action) => (
                  <button key={action.label} className="flex items-start text-left p-6 bg-white border border-zinc-200 hover:border-zinc-400 hover:shadow-sm transition-all group relative overflow-hidden">
                    <div className="relative z-10 w-full">
                      <div className={`p-2 w-fit mb-4 bg-zinc-50 border border-zinc-100 group-hover:border-zinc-300 transition-colors text-zinc-900`}>
                        <action.icon className="w-5 h-5" />
                      </div>
                      <h3 className="text-zinc-900 font-mono text-xs uppercase tracking-widest font-bold mb-1 group-hover:translate-x-1 transition-transform">{action.label}</h3>
                      <p className="text-zinc-500 font-mono text-[9px] uppercase tracking-wider leading-relaxed">{action.description}</p>
                    </div>
                    <ChevronRight className="absolute bottom-6 right-6 w-4 h-4 text-zinc-200 group-hover:text-zinc-900 transition-all transform group-hover:translate-x-1" />
                  </button>
                ))}
              </div>
            </div>

            {/* Profile Information (Inspo: Table Image) */}
            <Card className="bg-white border-zinc-200 rounded-none overflow-hidden shadow-none">
              <CardHeader className="bg-zinc-50 border-b border-zinc-200 py-6">
                <CardTitle className="font-sans font-black uppercase text-sm tracking-[0.1em] text-zinc-900">Identity Record Information</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <DataField label="Codeopia Community ID" value={userData.identityId} />
                  <DataField label="Full Legal Name" value={userData.name} />
                  <DataField label="Phone Contact" value={userData.phone} />
                  <DataField label="Primary Address" value={userData.address} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Recent Logins & Apps */}
          <div className="space-y-12">

            {/* Current Activity */}
            <div className="space-y-6">
              <h2 className="font-sans font-black uppercase text-sm tracking-widest text-zinc-400">Security Footprint</h2>
              <div className="space-y-4">
                {connectedApps.map((app) => (
                  <div key={app.name} className="flex items-center gap-4 p-4 border border-zinc-100 bg-white hover:bg-zinc-50 transition-all">
                    <div className="w-10 h-10 border border-zinc-200 flex items-center justify-center shrink-0">
                      <AppWindow className="w-5 h-5 text-zinc-300" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-zinc-900 font-mono text-[11px] font-bold truncate tracking-tight">{app.name}</span>
                      <span className="text-zinc-400 font-mono text-[8px] uppercase tracking-widest truncate mt-0.5">{app.scope}</span>
                    </div>
                    <div className="ml-auto flex flex-col items-end">
                      <span className="text-emerald-600 font-mono text-[8px] font-black uppercase tracking-tighter">Authorized</span>
                      <span className="text-zinc-500 font-mono text-[7px] uppercase mt-0.5">{app.lastUsed}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full py-3 border border-dashed border-zinc-200 text-zinc-400 font-mono text-[9px] uppercase tracking-widest hover:border-zinc-400 hover:text-zinc-600 transition-all">
                View All Managed Apps
              </button>
            </div>

            {/* Technical Node Info */}
            <div className="p-8 bg-zinc-50 border border-zinc-200 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-zinc-400 font-mono text-[8px] uppercase tracking-[0.3em]">Node Status: Active</span>
              </div>
              <p className="text-zinc-600 font-mono text-[10px] uppercase tracking-widest leading-relaxed">
                Your identity is protected by end-to-end sovereignty protocols. Last rotation: 4 days ago.
              </p>
              <button className="text-[10px] text-zinc-900 font-mono uppercase tracking-widest border-b border-zinc-900 pb-0.5 hover:text-zinc-500 hover:border-zinc-500 transition-all w-fit font-bold">
                Identity Audit
              </button>
            </div>

          </div>

        </div>

      </div>
    </DashboardShell>
  );
}

function RoleTag({ label, variant, color }: {
  label: string,
  variant: 'solid' | 'outline' | 'bold',
  color: 'emerald' | 'sky' | 'indigo' | 'rose' | 'zinc'
}) {
  const colorMap = {
    emerald: {
      solid: "bg-emerald-600 text-white border-emerald-600",
      outline: "border-emerald-200 text-emerald-600 bg-emerald-50/30",
      bold: "border-emerald-500 text-emerald-700 bg-emerald-50"
    },
    sky: {
      solid: "bg-sky-600 text-white border-sky-600",
      outline: "border-sky-200 text-sky-600 bg-sky-50/30",
      bold: "border-sky-500 text-sky-700 bg-sky-50"
    },
    indigo: {
      solid: "bg-indigo-600 text-white border-indigo-600",
      outline: "border-indigo-200 text-indigo-600 bg-indigo-50/30",
      bold: "border-indigo-500 text-indigo-700 bg-indigo-50"
    },
    rose: {
      solid: "bg-rose-600 text-white border-rose-600",
      outline: "border-rose-200 text-rose-600 bg-rose-50/30",
      bold: "border-rose-500 text-rose-700 bg-rose-50"
    },
    zinc: {
      solid: "bg-zinc-900 text-white border-zinc-900",
      outline: "border-zinc-200 text-zinc-600 bg-zinc-50/30",
      bold: "border-zinc-900 text-zinc-900 bg-zinc-50"
    }
  };

  const baseStyles = "font-mono text-[7px] font-bold uppercase tracking-[0.15em] leading-none px-2.5 py-1.5 rounded-full border transition-all";
  const variantStyles = colorMap[color][variant];
  const weightStyles = variant === 'bold' ? 'font-black' : '';

  return <span className={`${baseStyles} ${variantStyles} ${weightStyles}`}>{label}</span>;
}

function DataField({ label, value }: { label: string, value: string }) {
  return (
    <div className="p-6 border-zinc-100 odd:border-r border-b hover:bg-zinc-50 transition-all">
      <span className="block font-mono text-[8px] uppercase tracking-[0.3em] text-zinc-400 font-bold mb-2">{label}</span>
      <span className="block font-sans font-bold text-sm text-zinc-900 tracking-tight">{value}</span>
    </div>
  )
}

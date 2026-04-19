"use client";

import React from "react";
import { DashboardShell } from "@/components/dashboard/Shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Lock,
  ShieldCheck,
  Laptop,
  Smartphone,
  Mail,
  ShieldAlert,
  Fingerprint,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const inputStyles =
  "h-11 rounded-none border-zinc-200 bg-white px-3 font-mono text-xs placeholder:text-zinc-300 focus-visible:ring-0 focus-visible:border-zinc-900 transition-all";

const labelStyles = "font-mono text-[9px] uppercase tracking-widest text-zinc-400 font-bold";

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-7 h-7 bg-black text-white flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5" />
      </div>
      <h2 className="font-sans font-black uppercase text-sm tracking-widest text-zinc-900">{title}</h2>
    </div>
  );
}

function Divider() {
  return <div className="border-t border-zinc-100" />;
}

export default function SecurityPage() {
  const [mfaEnabled, setMfaEnabled] = React.useState(true);
  const [showCurrent, setShowCurrent] = React.useState(false);
  const [showNew, setShowNew] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [sessions, setSessions] = React.useState([
    { id: "1", device: "MacBook Pro M2", icon: Laptop, location: "Toronto, CA", browser: "Chrome", ip: "142.112.XX.XX", time: "Now", isCurrent: true },
    { id: "2", device: "iPhone 15 Pro", icon: Smartphone, location: "London, UK", browser: "Safari", ip: "82.44.XX.XX", time: "4 min ago", isCurrent: false },
  ]);

  function revokeSession(id: string) {
    setSessions((prev) => prev.filter((s) => s.id === id ? s.isCurrent : true));
  }

  return (
    <DashboardShell>
      <div className="max-w-3xl space-y-10 pb-20">

        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-sans font-black uppercase tracking-tighter text-zinc-900">
            Security
          </h1>
          <p className="font-mono text-xs uppercase tracking-widest text-zinc-400">
            Manage your password, two-factor auth, and active sessions
          </p>
        </div>

        {/* Password */}
        <section className="space-y-5">
          <SectionHeader icon={Lock} title="Change Password" />
          <div className="bg-white border border-zinc-200 p-6 space-y-5">
            <div className="space-y-2">
              <Label className={labelStyles}>Current Password</Label>
              <div className="relative">
                <Input
                  type={showCurrent ? "text" : "password"}
                  placeholder="Enter current password"
                  className={inputStyles + " pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-zinc-600 transition-colors"
                >
                  {showCurrent ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className={labelStyles}>New Password</Label>
                <div className="relative">
                  <Input
                    type={showNew ? "text" : "password"}
                    placeholder="Min 12 characters"
                    className={inputStyles + " pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-zinc-600 transition-colors"
                  >
                    {showNew ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className={labelStyles}>Confirm New Password</Label>
                <div className="relative">
                  <Input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repeat new password"
                    className={inputStyles + " pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-zinc-600 transition-colors"
                  >
                    {showConfirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-1">
              <Button className="h-10 rounded-none bg-black text-white font-mono text-[9px] uppercase tracking-widest px-6 hover:bg-zinc-800 transition-colors">
                Update Password
              </Button>
            </div>
          </div>
        </section>

        <Divider />

        {/* Two-Factor Auth */}
        <section className="space-y-5">
          <SectionHeader icon={ShieldCheck} title="Two-Factor Authentication" />
          <div className="bg-white border border-zinc-200 divide-y divide-zinc-100">

            {/* Authenticator App */}
            <div className="p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 border border-zinc-200 bg-zinc-50 flex items-center justify-center shrink-0">
                  <Fingerprint className="w-4 h-4 text-zinc-500" />
                </div>
                <div>
                  <p className="font-mono text-[10px] font-black uppercase tracking-widest text-zinc-900">
                    Authenticator App
                  </p>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-400 mt-0.5">
                    TOTP via Google Authenticator or similar
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {mfaEnabled ? (
                  <CheckCircle2 className="w-4 h-4 text-zinc-900" />
                ) : (
                  <XCircle className="w-4 h-4 text-zinc-300" />
                )}
                <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 hidden sm:inline">
                  {mfaEnabled ? "Enabled" : "Disabled"}
                </span>
                <Button
                  variant="outline"
                  className="h-8 rounded-none border-zinc-200 font-mono text-[9px] uppercase tracking-widest px-4 hover:border-zinc-900 hover:bg-zinc-50 transition-all"
                  onClick={() => setMfaEnabled((v) => !v)}
                >
                  {mfaEnabled ? "Disable" : "Enable"}
                </Button>
              </div>
            </div>

            {/* Recovery Email */}
            <div className="p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 border border-zinc-200 bg-zinc-50 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-zinc-500" />
                </div>
                <div>
                  <p className="font-mono text-[10px] font-black uppercase tracking-widest text-zinc-900">
                    Recovery Email
                  </p>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-400 mt-0.5">
                    kadin.recovery@proton.me
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="h-8 rounded-none border-zinc-200 font-mono text-[9px] uppercase tracking-widest px-4 hover:border-zinc-900 hover:bg-zinc-50 transition-all shrink-0"
              >
                Update
              </Button>
            </div>

          </div>
        </section>

        <Divider />

        {/* Active Sessions */}
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <SectionHeader icon={Laptop} title="Active Sessions" />
            <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-400">
              {sessions.length} session{sessions.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="bg-white border border-zinc-200 divide-y divide-zinc-100 overflow-hidden">
            {sessions.map((session) => (
              <div key={session.id} className="p-5 flex items-center gap-4 group">
                <div className="w-9 h-9 border border-zinc-200 bg-zinc-50 flex items-center justify-center shrink-0 relative">
                  <session.icon className="w-4 h-4 text-zinc-500" />
                  {session.isCurrent && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-zinc-900 border-2 border-white rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[10px] font-black uppercase tracking-widest text-zinc-900">
                      {session.device}
                    </span>
                    {session.isCurrent && (
                      <span className="font-mono text-[8px] uppercase tracking-widest bg-zinc-900 text-white px-1.5 py-0.5 font-bold">
                        This device
                      </span>
                    )}
                  </div>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-400 mt-0.5">
                    {session.browser} · {session.location} · {session.time}
                  </p>
                </div>
                {!session.isCurrent && (
                  <button
                    onClick={() => revokeSession(session.id)}
                    className="font-mono text-[8px] uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors border-b border-transparent hover:border-zinc-900 pb-px shrink-0"
                  >
                    Sign out
                  </button>
                )}
              </div>
            ))}

            <div className="p-4 bg-zinc-50 border-t border-zinc-100">
              <Button
                variant="outline"
                className="w-full h-9 rounded-none border-zinc-200 font-mono text-[9px] uppercase tracking-widest hover:bg-zinc-900 hover:text-white transition-all"
                onClick={() => setSessions((prev) => prev.filter((s) => s.isCurrent))}
              >
                Sign Out All Other Sessions
              </Button>
            </div>
          </div>
        </section>

        <Divider />

        {/* Danger Zone */}
        <section className="space-y-5">
          <SectionHeader icon={ShieldAlert} title="Danger Zone" />
          <div className="bg-white border border-zinc-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] font-black uppercase tracking-widest text-zinc-900">
                Delete Account
              </p>
              <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-400 mt-0.5 leading-relaxed">
                Permanently removes all your data. This cannot be undone.
              </p>
            </div>
            <Button
              variant="outline"
              className="h-9 rounded-none border-zinc-300 text-zinc-900 font-mono text-[9px] uppercase tracking-widest px-5 hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-all shrink-0"
            >
              Delete Account
            </Button>
          </div>
        </section>

      </div>
    </DashboardShell>
  );
}

"use client";

import {
  AlertTriangle,
  AppWindow,
  Filter,
  Key,
  LogIn,
  LogOut,
  Search,
  Shield,
  User,
} from "lucide-react";
import React from "react";
import { DashboardShell } from "@/components/dashboard/Shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ActivityType = "login" | "logout" | "security" | "password" | "app" | "profile" | "alert";

interface ActivityLog {
  id: string;
  type: ActivityType;
  title: string;
  detail: string;
  device: string;
  location: string;
  timestamp: string;
  ip: string;
}

const activityData: ActivityLog[] = [
  {
    id: "1",
    type: "login",
    title: "Successful Sign In",
    detail: "Authenticated via password + TOTP",
    device: "MacBook Pro M2",
    location: "Toronto, CA",
    timestamp: "Today, 9:14 AM",
    ip: "142.112.XX.XX",
  },
  {
    id: "2",
    type: "app",
    title: "App Access Granted",
    detail: "CommuniTrack accessed your public identity",
    device: "—",
    location: "API",
    timestamp: "Today, 8:02 AM",
    ip: "54.239.XX.XX",
  },
  {
    id: "3",
    type: "security",
    title: "Two-Factor Auth Enabled",
    detail: "TOTP authenticator app configured",
    device: "MacBook Pro M2",
    location: "Toronto, CA",
    timestamp: "Yesterday, 4:30 PM",
    ip: "142.112.XX.XX",
  },
  {
    id: "4",
    type: "password",
    title: "Password Changed",
    detail: "Account password was updated successfully",
    device: "MacBook Pro M2",
    location: "Toronto, CA",
    timestamp: "Yesterday, 4:28 PM",
    ip: "142.112.XX.XX",
  },
  {
    id: "5",
    type: "login",
    title: "Successful Sign In",
    detail: "Authenticated via password",
    device: "iPhone 15 Pro",
    location: "London, UK",
    timestamp: "Apr 17, 11:55 AM",
    ip: "82.44.XX.XX",
  },
  {
    id: "6",
    type: "alert",
    title: "Unrecognized Device",
    detail: "Sign-in attempt from a new device was flagged",
    device: "Unknown Device",
    location: "Amsterdam, NL",
    timestamp: "Apr 16, 3:22 PM",
    ip: "185.220.XX.XX",
  },
  {
    id: "7",
    type: "app",
    title: "App Access Revoked",
    detail: "Forge Engine authorization was removed",
    device: "MacBook Pro M2",
    location: "Toronto, CA",
    timestamp: "Apr 15, 10:10 AM",
    ip: "142.112.XX.XX",
  },
  {
    id: "8",
    type: "profile",
    title: "Profile Updated",
    detail: "Display name and location were changed",
    device: "MacBook Pro M2",
    location: "Toronto, CA",
    timestamp: "Apr 14, 2:45 PM",
    ip: "142.112.XX.XX",
  },
  {
    id: "9",
    type: "logout",
    title: "Signed Out",
    detail: "Session ended on iPhone 15 Pro",
    device: "iPhone 15 Pro",
    location: "London, UK",
    timestamp: "Apr 13, 9:00 PM",
    ip: "82.44.XX.XX",
  },
  {
    id: "10",
    type: "login",
    title: "Successful Sign In",
    detail: "Authenticated via password + TOTP",
    device: "MacBook Pro M2",
    location: "Toronto, CA",
    timestamp: "Apr 13, 8:30 AM",
    ip: "142.112.XX.XX",
  },
];

const typeConfig: Record<ActivityType, { icon: React.ElementType; label: string }> = {
  login: { icon: LogIn, label: "Sign In" },
  logout: { icon: LogOut, label: "Sign Out" },
  security: { icon: Shield, label: "Security" },
  password: { icon: Key, label: "Password" },
  app: { icon: AppWindow, label: "App" },
  profile: { icon: User, label: "Profile" },
  alert: { icon: AlertTriangle, label: "Alert" },
};

const filterOptions: { label: string; value: ActivityType | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Sign In", value: "login" },
  { label: "Sign Out", value: "logout" },
  { label: "Security", value: "security" },
  { label: "Password", value: "password" },
  { label: "Apps", value: "app" },
  { label: "Profile", value: "profile" },
  { label: "Alerts", value: "alert" },
];

const PAGE_SIZE = 6;

export default function ActivityPage() {
  const [search, setSearch] = React.useState("");
  const [activeFilter, setActiveFilter] = React.useState<ActivityType | "all">("all");
  const [page, setPage] = React.useState(1);

  const filtered = activityData.filter((log) => {
    const matchesFilter = activeFilter === "all" || log.type === activeFilter;
    const matchesSearch =
      search === "" ||
      log.title.toLowerCase().includes(search.toLowerCase()) ||
      log.detail.toLowerCase().includes(search.toLowerCase()) ||
      log.location.toLowerCase().includes(search.toLowerCase()) ||
      log.device.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  React.useEffect(() => {
    setPage(1);
  }, []);

  return (
    <DashboardShell>
      <div className="max-w-6xl mx-auto space-y-8 pb-20">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-sans font-black uppercase tracking-tighter text-zinc-900">
            Activity Log
          </h1>
          <p className="font-mono text-sm text-zinc-500">
            A full record of actions and events on your account
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
          <Input
            placeholder="Search activity..."
            className="h-11 rounded-none border-zinc-200 bg-white pl-9 font-mono text-sm focus-visible:ring-0 focus-visible:border-zinc-900 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setActiveFilter(f.value)}
              className={`font-mono text-sm px-3 py-1.5 border transition-all ${
                activeFilter === f.value
                  ? "bg-black text-white border-black"
                  : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-400 hover:text-zinc-900"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Log List */}
        {paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border border-zinc-200 bg-white">
            <div className="w-12 h-12 border border-zinc-200 bg-zinc-50 flex items-center justify-center mb-4">
              <Filter className="w-5 h-5 text-zinc-300" />
            </div>
            <p className="font-mono font-semibold text-sm text-zinc-900 mb-1">No results</p>
            <p className="font-mono text-xs text-zinc-500">Try adjusting your search or filter</p>
          </div>
        ) : (
          <div className="bg-white border border-zinc-200 divide-y divide-zinc-100 overflow-hidden">
            {paginated.map((log) => {
              const config = typeConfig[log.type];
              const isAlert = log.type === "alert";
              return (
                <div
                  key={log.id}
                  className={`flex items-start gap-4 p-5 group transition-all ${isAlert ? "bg-red-50 border-l-2 border-l-red-400 hover:bg-red-50/80" : "hover:bg-zinc-50"}`}
                >
                  {/* Icon */}
                  <div
                    className={`w-9 h-9 flex items-center justify-center shrink-0 border mt-0.5 ${
                      isAlert ? "border-red-200 bg-white" : "border-zinc-200 bg-zinc-50"
                    }`}
                  >
                    <config.icon
                      className={`w-4 h-4 ${isAlert ? "text-red-500" : "text-zinc-400"}`}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p
                            className={`font-mono font-semibold text-base leading-none ${isAlert ? "text-red-700" : "text-zinc-900"}`}
                          >
                            {log.title}
                          </p>
                          {isAlert && (
                            <span className="font-mono text-xs uppercase tracking-widest border border-red-300 bg-red-100 text-red-600 px-1.5 py-0.5 font-bold">
                              Review
                            </span>
                          )}
                        </div>
                        <p
                          className={`font-mono text-sm pt-0.5 ${isAlert ? "text-red-500/80" : "text-zinc-500"}`}
                        >
                          {log.detail}
                        </p>
                      </div>
                      <span className="font-mono text-sm text-zinc-400 whitespace-nowrap shrink-0">
                        {log.timestamp}
                      </span>
                    </div>

                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-3 mt-2.5 font-mono text-sm text-zinc-400">
                      <span className="border border-zinc-100 bg-zinc-50 px-2 py-0.5 text-zinc-500">
                        {config.label}
                      </span>
                      <span>{log.device}</span>
                      <span className="text-zinc-200">·</span>
                      <span>{log.location}</span>
                      <span className="text-zinc-200">·</span>
                      <span>{log.ip}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm text-zinc-500">
              {filtered.length} event{filtered.length !== 1 ? "s" : ""} · page {page} of{" "}
              {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="h-8 rounded-none border-zinc-200 font-mono text-xs px-4 hover:border-zinc-900 disabled:opacity-30"
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1}
              >
                Prev
              </Button>
              <Button
                variant="outline"
                className="h-8 rounded-none border-zinc-200 font-mono text-xs px-4 hover:border-zinc-900 disabled:opacity-30"
                onClick={() => setPage((p) => p + 1)}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

"use client";

import {
  ArrowRight,
  Eye,
  EyeOff,
  History,
  Laptop,
  Lock,
  Monitor,
  ShieldAlert,
  Smartphone,
  Tablet,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SensitiveText } from "@/components/ui/sensitive-text";
import { AuthService, SessionService, type UserSession } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { useUserStore } from "@/store/user.store";

const inputStyles =
  "h-11 rounded-none border-zinc-200 bg-white px-3 font-mono text-base placeholder:text-zinc-400 focus-visible:ring-0 focus-visible:border-zinc-900 transition-all";
const labelStyles = "font-mono text-sm text-zinc-500 font-medium";

function SectionHeader({
  icon: Icon,
  title,
  danger,
}: {
  icon: React.ElementType;
  title: string;
  danger?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-7 h-7 text-white flex items-center justify-center shrink-0 ${danger ? "bg-red-600" : "bg-black"}`}
      >
        <Icon className="w-3.5 h-3.5" />
      </div>
      <h2 className={`font-sans font-bold text-xl ${danger ? "text-red-700" : "text-zinc-900"}`}>
        {title}
      </h2>
    </div>
  );
}

function Divider() {
  return <div className="border-t border-zinc-100" />;
}

function deviceIcon(deviceName: string) {
  const d = deviceName.toLowerCase();
  if (d.includes("iphone") || d.includes("android")) return Smartphone;
  if (d.includes("ipad") || d.includes("tablet")) return Tablet;
  if (d.includes("mac") || d.includes("windows") || d.includes("linux")) return Monitor;
  return Laptop;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function formatSessionAgeLabel(createdAt: string, lastSeenAt: string | null): string {
  return `Last active ${timeAgo(lastSeenAt ?? createdAt)}`;
}

// ─── Change Password ──────────────────────────────────────────────────────────

interface PasswordFormValues {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

function ChangePasswordSection() {
  const [showCurrent, setShowCurrent] = React.useState(false);
  const [showNew, setShowNew] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormValues>();

  const newPassword = watch("new_password");

  async function onSubmit(data: PasswordFormValues) {
    try {
      await AuthService.changePassword(data.current_password, data.new_password);
      toast.success("Password changed successfully.");
      reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <section className="space-y-5">
      <SectionHeader icon={Lock} title="Change Password" />
      <div className="space-y-6">
        <div className="space-y-2">
          <Label className={labelStyles}>Current Password</Label>
          <div className="relative">
            <Input
              type={showCurrent ? "text" : "password"}
              placeholder="Enter current password"
              className={`${inputStyles} pr-10`}
              {...register("current_password", { required: "Required" })}
            />
            <button
              type="button"
              onClick={() => setShowCurrent((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              {showCurrent ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
          {errors.current_password && (
            <p className="text-red-500 text-xs font-mono">{errors.current_password.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label className={labelStyles}>New Password</Label>
            <div className="relative">
              <Input
                type={showNew ? "text" : "password"}
                placeholder="Min 8 chars, 1 number"
                className={`${inputStyles} pr-10`}
                {...register("new_password", {
                  required: "Required",
                  minLength: { value: 8, message: "Min 8 characters" },
                  validate: (v) => /\d/.test(v) || "Must contain at least one number",
                })}
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                {showNew ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            {errors.new_password && (
              <p className="text-red-500 text-xs font-mono">{errors.new_password.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label className={labelStyles}>Confirm New Password</Label>
            <div className="relative">
              <Input
                type={showConfirm ? "text" : "password"}
                placeholder="Repeat new password"
                className={`${inputStyles} pr-10`}
                {...register("confirm_password", {
                  required: "Required",
                  validate: (v) => v === newPassword || "Passwords do not match",
                })}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                {showConfirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            {errors.confirm_password && (
              <p className="text-red-500 text-xs font-mono">{errors.confirm_password.message}</p>
            )}
          </div>
        </div>

        <div className="pt-1">
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="h-10 px-6 bg-black text-white font-mono text-sm font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting
              ? [0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-white animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))
              : "Update Password"}
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── Active Sessions ──────────────────────────────────────────────────────────

function ActiveSessionsSection() {
  const [sessions, setSessions] = React.useState<UserSession[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [errorStatus, setErrorStatus] = React.useState<number | null>(null);
  const [revoking, setRevoking] = React.useState<number | null>(null);
  const [revokingAll, setRevokingAll] = React.useState(false);

  React.useEffect(() => {
    setLoading(true);
    setErrorStatus(null);
    SessionService.getSessions()
      .then(setSessions)
      .catch((err) => {
        setErrorStatus(err.status || 500);
      })
      .finally(() => setLoading(false));
  }, []);

  async function revokeSession(id: number) {
    setRevoking(id);
    try {
      await SessionService.revokeSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      toast.success("Session signed out.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to revoke session.");
    } finally {
      setRevoking(null);
    }
  }

  async function revokeAll() {
    setRevokingAll(true);
    try {
      await SessionService.revokeAllOtherSessions();
      setSessions((prev) => prev.filter((s) => s.isCurrent));
      toast.success("All other sessions signed out.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to revoke sessions.");
    } finally {
      setRevokingAll(false);
    }
  }

  const otherSessions = sessions.filter((s) => !s.isCurrent);

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <SectionHeader icon={Laptop} title="Active Sessions" />
        {!loading && (
          <span className="font-mono text-sm text-zinc-500">
            {sessions.length} session{sessions.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div className="bg-zinc-50 border border-zinc-200 p-4 font-mono text-xs text-zinc-500 space-y-1">
        <p>Sessions expire after 30 minutes of inactivity.</p>
        <p>Sessions also have a hard maximum lifetime of 7 days.</p>
      </div>

      <div className="bg-white border border-zinc-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-zinc-300 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        ) : errorStatus === 403 ? (
          <div className="py-12 px-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto border border-red-100">
              <Lock className="w-5 h-5 text-red-600" />
            </div>
            <div className="space-y-1">
              <p className="font-mono font-bold text-sm text-zinc-900">Access Restricted</p>
              <p className="font-mono text-xs text-zinc-500 max-w-60 mx-auto">
                Your account does not have clearance to view active session telemetry.
              </p>
            </div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="py-10 text-center">
            <p className="font-mono text-sm text-zinc-400">No active sessions found.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {sessions.map((session) => {
              const DeviceIcon = deviceIcon(session.deviceName);
              return (
                <div key={session.id} className="p-5 flex items-center gap-4">
                  <div className="w-9 h-9 border border-zinc-200 bg-zinc-50 flex items-center justify-center shrink-0 relative">
                    <DeviceIcon className="w-4 h-4 text-zinc-500" />
                    {session.isCurrent && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-semibold text-sm text-zinc-900">
                        {session.deviceName}
                      </span>
                      {session.isCurrent && (
                        <span className="font-mono text-[10px] uppercase tracking-widest bg-zinc-900 text-white px-1.5 py-0.5 font-bold">
                          This device
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-xs text-zinc-400 mt-0.5">
                      <SensitiveText value={session.ipAddress} kind="ip" fallback="Unknown IP" /> ·{" "}
                      {formatSessionAgeLabel(session.createdAt, session.lastSeenAt)} · Signed in{" "}
                      {timeAgo(session.createdAt)}
                    </p>
                  </div>
                  {!session.isCurrent && (
                    <button
                      type="button"
                      onClick={() => revokeSession(session.id)}
                      disabled={revoking === session.id}
                      className="font-mono text-xs text-zinc-400 hover:text-red-600 transition-colors border-b border-transparent hover:border-red-600 pb-px shrink-0 disabled:opacity-50"
                    >
                      {revoking === session.id ? "Signing out…" : "Sign out"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!loading && otherSessions.length > 0 && (
          <div className="p-4 bg-zinc-50 border-t border-zinc-100">
            <button
              type="button"
              onClick={revokeAll}
              disabled={revokingAll}
              className="w-full h-9 border border-red-200 text-red-500 font-mono text-sm font-medium hover:bg-red-600 hover:text-white hover:border-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {revokingAll ? "Signing out…" : "Sign Out All Other Sessions"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Delete Account ────────────────────────────────────────────────────────────

function DeleteAccountModal() {
  const router = useRouter();
  const clearSession = useAuthStore((s) => s.clearSession);
  const resetUser = useUserStore((s) => s.reset);

  const [open, setOpen] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setPassword("");
      setError(null);
    }
  }

  async function handleDelete() {
    setError(null);
    setIsDeleting(true);
    try {
      await AuthService.deleteAccount(password);
      clearSession();
      resetUser();
      router.replace("/login?reason=account_deleted");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="h-9 rounded-none border-red-300 text-red-600 font-mono text-xs px-5 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shrink-0"
      >
        Delete Account
      </Button>
      <DialogContent className="sm:max-w-md rounded-none">
        <DialogHeader>
          <DialogTitle className="font-sans text-lg font-bold text-red-700">
            Delete your account?
          </DialogTitle>
          <DialogDescription className="font-mono text-sm text-zinc-500 leading-relaxed">
            This permanently deletes your account and all associated data. This cannot be undone.
            Enter your password to confirm.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label className={labelStyles}>Password</Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${inputStyles} pr-10`}
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
          {error && <p className="text-red-500 text-xs font-mono">{error}</p>}
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isDeleting}
            className="rounded-none"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={isDeleting || !password}
            className="rounded-none bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? "Deleting…" : "Delete My Account"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsSecurityPage() {
  return (
    <div className="space-y-10">
      <ChangePasswordSection />

      <Divider />

      <ActiveSessionsSection />

      {/* Activity Log link */}
      <div className="flex items-center justify-between py-4 px-5 bg-white border border-zinc-200">
        <div className="flex items-center gap-3">
          <History className="w-4 h-4 text-zinc-400" />
          <div>
            <p className="font-mono font-semibold text-sm text-zinc-900">Activity Log</p>
            <p className="font-mono text-xs text-zinc-400">Full record of events on your account</p>
          </div>
        </div>
        <Link
          href="/activity"
          className="inline-flex items-center gap-1.5 font-mono text-sm text-zinc-500 hover:text-zinc-900 transition-colors border-b border-zinc-200 hover:border-zinc-900 pb-px shrink-0"
        >
          View log <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <Divider />

      {/* Danger Zone */}
      <section className="space-y-5">
        <SectionHeader icon={ShieldAlert} title="Danger Zone" danger />
        <div className="bg-red-50 border border-red-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="font-mono font-semibold text-sm text-red-700">Delete Account</p>
            <p className="font-mono text-xs text-red-500/80 mt-0.5 leading-relaxed">
              Permanently removes all your data. This cannot be undone.
            </p>
          </div>
          <DeleteAccountModal />
        </div>
      </section>
    </div>
  );
}

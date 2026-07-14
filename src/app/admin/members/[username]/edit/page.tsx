"use client";

import { Mail, MapPin, Shield } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminMember, useUpdateAdminMember } from "@/hooks/useAdmin";
import { getAvatarUrl } from "@/lib/utils";
import type { AdminMemberDetail } from "@/types/users.types";

function MemberEditForm({ identifier }: { identifier: string }) {
  const { data: member, isLoading, isError } = useAdminMember(identifier);

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-36 w-full rounded-none" />
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Skeleton className="h-96 w-full rounded-none" />
          <Skeleton className="h-64 w-full rounded-none" />
        </div>
      </div>
    );
  }

  if (isError || !member) {
    return (
      <div className="border border-error-200 bg-error-50 p-8">
        <p className="font-sans text-base font-black text-error-700">
          Member details could not be loaded.
        </p>
        <p className="mt-2 font-mono text-xs text-error-600">
          Please refresh the page and try again.
        </p>
      </div>
    );
  }

  return <MemberEditFields key={member.id} identifier={identifier} member={member} />;
}

function MemberEditFields({
  identifier,
  member,
}: {
  identifier: string;
  member: AdminMemberDetail;
}) {
  const router = useRouter();
  const { mutate: updateMember, isPending } = useUpdateAdminMember();

  const [username, setUsername] = useState(member.username ?? "");
  const [fullName, setFullName] = useState(member.fullName ?? "");
  const [bio, setBio] = useState(member.bio ?? "");
  const [location, setLocation] = useState(member.location ?? "");
  const [isEmailVerified, setIsEmailVerified] = useState(Boolean(member.isEmailVerified));
  const [isOnboarded, setIsOnboarded] = useState(Boolean(member.isOnboarded));
  const [memberStatus, setMemberStatus] = useState(member.memberStatus ?? "");
  const [currentRole, setCurrentRole] = useState(member.currentRole ?? "");
  const [errors, setErrors] = useState<{ fullName?: string; username?: string; form?: string }>({});

  function validate(): boolean {
    const next: typeof errors = {};
    if (!fullName.trim()) next.fullName = "Full name is required.";
    if (!username.trim()) next.username = "Username is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    updateMember(
      {
        id: identifier,
        data: {
          username: username.trim(),
          isEmailVerified,
          isOnboarded,
          fullName: fullName.trim(),
          bio: bio.trim() || undefined,
          location: location.trim() || undefined,
          memberStatus: memberStatus.trim() || undefined,
          currentRole: currentRole.trim() || undefined,
        },
      },
      {
        onSuccess: () => toast.success("Member updated successfully."),
        onError: (error: Error) => {
          setErrors((prev) => ({
            ...prev,
            form: error?.message || "Failed to update member. Please try again.",
          }));
        },
      }
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="border border-grey-200 bg-white">
        <div className="flex flex-col gap-5 p-5 md:flex-row md:items-start md:justify-between">
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start">
            <div className="h-20 w-20 shrink-0 overflow-hidden border border-grey-200 bg-grey-50">
              {/* biome-ignore lint/performance/noImgElement: user avatar */}
              <img
                src={getAvatarUrl(member.profilePictureUrl, member.fullName || member.username)}
                alt={member.fullName || member.username}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <h2 className="font-sans text-2xl font-black leading-tight text-text-primary">
                {member.fullName || member.username}
              </h2>
              <p className="mt-1 font-mono text-sm text-text-tertiary">@{member.username}</p>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 font-mono text-xs text-text-secondary">
                <span className="flex min-w-0 items-center gap-2">
                  <Mail className="h-3.5 w-3.5 shrink-0 text-icon-muted" />
                  <span className="break-all">{member.email}</span>
                </span>
                <span className="flex items-center gap-2">
                  <Shield className="h-3.5 w-3.5 text-icon-muted" />
                  {member.communityId || "No community ID"}
                </span>
              </div>
            </div>
          </div>

          <Link
            href={`/admin/members/${member.username}`}
            className="flex h-10 items-center justify-center border border-grey-200 bg-white px-4 font-mono text-xs font-bold text-text-secondary transition-colors hover:bg-grey-50"
          >
            View member
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <section className="border border-grey-200 bg-white">
            <SectionHeader title="Identity" />
            <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2">
              <Field label="Username" htmlFor="username" error={errors.username}>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errors.username) setErrors((prev) => ({ ...prev, username: undefined }));
                  }}
                  className="h-10 rounded-none border-grey-200 bg-white font-mono text-sm"
                  aria-invalid={!!errors.username}
                />
              </Field>

              <Field label="Full name" htmlFor="fullName" error={errors.fullName}>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
                  }}
                  className="h-10 rounded-none border-grey-200 bg-white font-sans text-sm"
                  aria-invalid={!!errors.fullName}
                />
              </Field>

              <Field label="Location" htmlFor="location">
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="h-10 rounded-none border-grey-200 bg-white font-mono text-sm"
                />
              </Field>

              <Field label="Current role" htmlFor="currentRole">
                <Input
                  id="currentRole"
                  value={currentRole}
                  onChange={(e) => setCurrentRole(e.target.value)}
                  className="h-10 rounded-none border-grey-200 bg-white font-mono text-sm"
                />
              </Field>
            </div>
          </section>

          <section className="border border-grey-200 bg-white">
            <SectionHeader title="Profile" />
            <div className="space-y-5 p-5">
              <Field label="Member status" htmlFor="memberStatus">
                <Input
                  id="memberStatus"
                  value={memberStatus}
                  onChange={(e) => setMemberStatus(e.target.value)}
                  className="h-10 rounded-none border-grey-200 bg-white font-mono text-sm"
                />
              </Field>

              <Field label="Bio" htmlFor="bio">
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={6}
                  className="w-full resize-none border border-grey-200 bg-white px-3 py-2 font-mono text-sm leading-6 text-text-secondary placeholder:text-text-muted focus:border-grey-900 focus:outline-none focus:ring-2 focus:ring-grey-900/10"
                />
              </Field>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="border border-grey-200 bg-white">
            <SectionHeader title="Account state" />
            <div className="space-y-4 p-5">
              <label className="flex cursor-pointer items-start justify-between gap-4 border border-grey-200 p-4">
                <div>
                  <p className="font-mono text-sm font-medium text-text-primary">Email verified</p>
                  <p className="mt-1 font-mono text-xs leading-5 text-text-tertiary">
                    Mark whether this member has verified their email address.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={isEmailVerified}
                  onChange={(e) => setIsEmailVerified(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 border-grey-300 accent-grey-900"
                />
              </label>

              <label className="flex cursor-pointer items-start justify-between gap-4 border border-grey-200 p-4">
                <div>
                  <p className="font-mono text-sm font-medium text-text-primary">Onboarded</p>
                  <p className="mt-1 font-mono text-xs leading-5 text-text-tertiary">
                    Manually finish onboarding for a member who's stuck -- they'll show up in the
                    community directory and their public profile once this is on.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={isOnboarded}
                  onChange={(e) => setIsOnboarded(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 border-grey-300 accent-grey-900"
                />
              </label>

              <div className="space-y-3 border border-grey-200 p-4 font-mono text-xs text-text-secondary">
                <SideFact
                  icon={Mail}
                  label="Email"
                  value={member.isEmailVerified ? "Verified" : "Pending"}
                />
                <SideFact icon={MapPin} label="Location" value={location || "Not set"} />
              </div>
            </div>
          </section>

          <section className="border border-grey-200 bg-grey-50 p-5">
            <p className="font-mono text-xs font-medium text-text-muted">Editing scope</p>
            <p className="mt-2 font-mono text-xs leading-6 text-text-tertiary">
              This page updates profile metadata only. Role assignment, sessions, suspension, and
              deletion stay on the member detail page.
            </p>
          </section>
        </aside>
      </div>

      {errors.form && (
        <div className="border border-error-200 bg-error-50 px-4 py-3">
          <p className="font-mono text-xs text-error-700">{errors.form}</p>
        </div>
      )}

      <div className="flex flex-col gap-3 border border-grey-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-xs text-text-tertiary">
          Changes are saved to{" "}
          <span className="font-bold text-text-primary">@{member.username}</span>.
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push(`/admin/members/${identifier}`)}
            className="h-10 px-4 font-mono text-xs font-bold text-text-tertiary transition-colors hover:text-text-primary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="h-10 border border-grey-900 bg-grey-900 px-5 font-mono text-xs font-bold text-white transition-colors hover:bg-grey-800 disabled:pointer-events-none disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </form>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="border-b border-grey-200 bg-grey-50 px-5 py-3">
      <h2 className="font-sans text-base font-bold text-text-primary">{title}</h2>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor} className="font-mono text-xs font-medium text-text-muted">
        {label}
      </Label>
      {children}
      {error && <p className="font-mono text-xs text-error-600">{error}</p>}
    </div>
  );
}

function SideFact({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 shrink-0 text-icon-tertiary" />
      <div className="min-w-0">
        <p className="font-mono text-xs font-medium text-text-muted">{label}</p>
        <p className="truncate font-mono text-xs text-text-secondary">{value}</p>
      </div>
    </div>
  );
}

function EditMemberPageContent({ username }: { username: string }) {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 md:px-0">
      <MemberEditForm identifier={username} />
    </div>
  );
}

export default function EditMemberPage() {
  const { username } = useParams<{ username: string }>();

  return (
    <RouteGuard permission="users.edit">
      <EditMemberPageContent username={username} />
    </RouteGuard>
  );
}

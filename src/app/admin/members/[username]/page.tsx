"use client";

import {
  AlertTriangle,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  Clock,
  KeyRound,
  Laptop,
  Mail,
  Shield,
  ShieldAlert,
  Trash2,
  UserMinus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { RouteGuard } from "@/components/auth/RouteGuard";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAdminMember,
  useAdminUserSessions,
  useAssignRole,
  useDeleteMember,
  useFlagMember,
  useGrantUserPermission,
  usePermissionList,
  useReactivateMember,
  useRevokeAdminUserSession,
  useRevokeAllAdminUserSessions,
  useRevokeRole,
  useRevokeUserPermission,
  useRoles,
  useSuspendMember,
  useUnflagMember,
} from "@/hooks/useAdmin";
import { usePermission } from "@/hooks/usePermission";
import {
  DISCIPLINES,
  EXPERIENCE_LEVELS,
  labelForOption,
  MEMBER_STATUSES,
} from "@/lib/profile-options";
import { getAvatarUrl } from "@/lib/utils";

type DangerAction =
  | { type: "revoke-role"; roleName: string }
  | { type: "revoke-session"; sessionId: number; deviceName: string }
  | { type: "revoke-all-sessions" }
  | { type: "suspend" }
  | { type: "reactivate" }
  | { type: "delete" };

function MemberDetailSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 pb-20 md:px-0">
      <Skeleton className="h-8 w-48 rounded-none" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        <Skeleton className="h-96 w-full rounded-none" />
        <div className="space-y-6">
          <Skeleton className="h-56 w-full rounded-none" />
          <Skeleton className="h-56 w-full rounded-none" />
        </div>
      </div>
    </div>
  );
}

function formatValue(value: string | null | undefined) {
  if (!value) return "-";
  return value;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Not recorded";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not recorded";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function DetailItem({
  label,
  value,
  isLongText,
  href,
}: {
  label: string;
  value: string | null | undefined;
  isLongText?: boolean;
  href?: string;
}) {
  return (
    <div className="min-w-0">
      <p className="mb-1.5 font-mono text-xs font-medium text-text-muted">{label}</p>
      {href && value ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="truncate font-mono text-sm text-text-secondary hover:text-text-primary hover:underline"
        >
          {value}
        </a>
      ) : (
        <p
          className={`font-mono text-sm text-text-secondary ${isLongText ? "leading-6" : "truncate"}`}
        >
          {formatValue(value)}
        </p>
      )}
    </div>
  );
}

function HeaderStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-grey-200 p-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
      <p className="truncate font-sans text-xl font-black text-text-primary">{value}</p>
      <p className="mt-1 font-mono text-xs font-medium text-text-muted">{label}</p>
    </div>
  );
}

function SideFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3">
      <p className="font-mono text-xs font-medium text-text-muted">{label}</p>
      <p className="truncate text-right font-mono text-xs text-text-secondary">{value}</p>
    </div>
  );
}

function StatusPill({
  active,
  isFlagged,
  underReview,
}: {
  active: boolean;
  isFlagged?: boolean;
  underReview?: boolean;
}) {
  if (isFlagged) {
    if (underReview) {
      return (
        <span className="inline-flex items-center gap-1.5 border border-amber-500 bg-amber-500 px-2.5 py-1 font-mono text-[11px] font-bold text-white">
          <Clock className="h-3 w-3" />
          Under review
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 border border-red-600 bg-red-600 px-2.5 py-1 font-mono text-[11px] font-bold text-white">
        <AlertTriangle className="h-3 w-3" />
        Flagged
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-2.5 py-1 font-mono text-[11px] font-bold ${
        active
          ? "border-emerald-600 bg-emerald-600 text-white"
          : "border-zinc-800 bg-zinc-800 text-white"
      }`}
    >
      {active ? <CheckCircle2 className="h-3 w-3" /> : <UserMinus className="h-3 w-3" />}
      {active ? "Active" : "Suspended"}
    </span>
  );
}

function humanizePermission(codename: string) {
  const [resource = "platform", action = "access"] = codename.split(".");
  const readableResource = resource.replaceAll("_", " ");
  const readableAction = action.replaceAll("_", " ");

  if (action === "*") return `Manage every ${readableResource} permission in this area.`;
  if (resource === "*") return `Perform ${readableAction} actions across the platform.`;

  const actionPhrases: Record<string, string> = {
    access: `Access ${readableResource}.`,
    assign: `Assign ${readableResource} to members.`,
    create: `Create new ${readableResource}.`,
    delete: `Delete ${readableResource}.`,
    edit: `Edit ${readableResource}.`,
    reactivate: `Reactivate ${readableResource}.`,
    revoke: `Revoke ${readableResource}.`,
    revoke_any: `Revoke ${readableResource} for other members.`,
    suspend: `Suspend ${readableResource}.`,
    view: `View ${readableResource}.`,
    view_any: `View ${readableResource} for other members.`,
  };

  return actionPhrases[action] ?? `Allows ${readableAction} access for ${readableResource}.`;
}

function permissionEffect(codename: string, descriptions: Map<string, string>) {
  return descriptions.get(codename) ?? humanizePermission(codename);
}

function dangerCopy(action: DangerAction | null, username: string, roleEffects: string[] = []) {
  if (!action) {
    return {
      title: "",
      description: "",
      warning: "",
      button: "",
      tone: "red",
    };
  }

  switch (action.type) {
    case "revoke-role":
      return {
        title: "Revoke role",
        description: `This will remove the "${action.roleName}" role from @${username}.`,
        warning:
          roleEffects.length > 0
            ? "This member will lose the permissions listed below unless another role still grants them."
            : "Role access changes take effect as soon as you confirm.",
        button: "Revoke role",
        tone: "red",
      };
    case "revoke-session":
      return {
        title: "Revoke session",
        description: `This will sign @${username} out from ${action.deviceName || "this device"}.`,
        warning: "The member will need to sign in again on that device.",
        button: "Revoke session",
        tone: "red",
      };
    case "revoke-all-sessions":
      return {
        title: "Revoke all sessions",
        description: `This will force @${username} out of every active session.`,
        warning: "The member will need to sign in again on every device.",
        button: "Revoke all sessions",
        tone: "red",
      };
    case "suspend":
      return {
        title: "Suspend account",
        description: `This will block @${username} from accessing the platform and revoke active sessions.`,
        warning: "Account data remains intact, but the member cannot sign in while suspended.",
        button: "Suspend account",
        tone: "red",
      };
    case "reactivate":
      return {
        title: "Reactivate account",
        description: `This will restore platform access for @${username}.`,
        warning: "The member will be able to sign in and use the portal again.",
        button: "Reactivate account",
        tone: "green",
      };
    case "delete":
      return {
        title: "Delete member",
        description: `This will permanently delete @${username} and their account data.`,
        warning: "This action cannot be undone.",
        button: "Delete member",
        tone: "red",
      };
  }
}

function MemberDetailContent({ username }: { username: string }) {
  const router = useRouter();
  const { data: member, isLoading, isError } = useAdminMember(username);
  const { data: roles } = useRoles();
  const { data: permissions } = usePermissionList();
  const { mutate: assignRole, isPending: isAssigning } = useAssignRole();
  const { mutate: revokeRole, isPending: isRevoking } = useRevokeRole();
  const { mutate: grantPermission, isPending: isGrantingPermission } = useGrantUserPermission();
  const { mutate: revokePermission, isPending: isRevokingPermission } = useRevokeUserPermission();
  const { mutate: suspendMember, isPending: isSuspending } = useSuspendMember();
  const { mutate: reactivateMember, isPending: isReactivating } = useReactivateMember();
  const { mutate: deleteMember, isPending: isDeleting } = useDeleteMember();
  const { mutate: revokeSession, isPending: isRevokingSession } = useRevokeAdminUserSession();
  const { mutate: revokeAllSessions, isPending: isRevokingAll } = useRevokeAllAdminUserSessions();
  const { mutate: flagMember, isPending: isFlagging } = useFlagMember();
  const { mutate: unflagMember, isPending: isUnflagging } = useUnflagMember();

  const canEdit = usePermission("users.edit");
  const canAssign = usePermission("roles.assign");
  const canRevoke = usePermission("roles.revoke");
  const canAssignPermission = usePermission("permissions.assign");
  const canRevokePermission = usePermission("permissions.revoke");
  const canSuspend = usePermission("users.suspend");
  const canReactivate = usePermission("users.reactivate");
  const canDelete = usePermission("users.delete");
  const canViewSessions = usePermission("sessions.view_any");
  const canRevokeSessions = usePermission("sessions.revoke_any");
  const canFlag = usePermission("users.flag");
  const canReviewFlag = usePermission("users.review_flag");

  const { data: sessions, isLoading: sessionsLoading } = useAdminUserSessions(
    username,
    canViewSessions
  );

  const [selectedRoleName, setSelectedRoleName] = useState("");
  const [selectedPermission, setSelectedPermission] = useState("");
  const [confirmAssignRole, setConfirmAssignRole] = useState(false);
  const [dangerAction, setDangerAction] = useState<DangerAction | null>(null);
  const [confirmationInput, setConfirmationInput] = useState("");
  const [flagDialogOpen, setFlagDialogOpen] = useState(false);
  const [flagReason, setFlagReason] = useState("");
  const [unflagDialogOpen, setUnflagDialogOpen] = useState(false);

  const permissionDescriptions = useMemo(() => {
    return new Map(
      (permissions ?? []).map((permission) => [permission.codename, permission.description])
    );
  }, [permissions]);

  const rolesByName = useMemo(() => {
    return new Map((roles ?? []).map((role) => [role.name, role]));
  }, [roles]);

  const selectedRole = selectedRoleName ? rolesByName.get(selectedRoleName) : undefined;

  const selectedRoleEffects = useMemo(() => {
    if (!selectedRole) return [];
    return selectedRole.permissions.map((permission) =>
      permissionEffect(permission, permissionDescriptions)
    );
  }, [selectedRole, permissionDescriptions]);

  const dangerRoleEffects = useMemo(() => {
    if (dangerAction?.type !== "revoke-role") return [];
    const role = rolesByName.get(dangerAction.roleName);
    return (role?.permissions ?? []).map((permission) =>
      permissionEffect(permission, permissionDescriptions)
    );
  }, [dangerAction, rolesByName, permissionDescriptions]);

  // Role identity is the slug (role.name). The API's `roles` field holds display
  // names, so assignment/revocation must key off `roleNames` (the slugs) instead.
  const assignedRoleSlugs = useMemo(
    () => (member?.roleNames ?? []).filter((slug) => slug.trim() !== ""),
    [member]
  );

  const directPermissions = useMemo(() => member?.directPermissions ?? [], [member]);

  const availableRoles = useMemo(() => {
    if (!roles || !member) return [];
    return roles.filter((role) => !assignedRoleSlugs.includes(role.name));
  }, [roles, member, assignedRoleSlugs]);

  const assignablePermissions = useMemo(() => {
    if (!permissions) return [];
    return permissions.filter((permission) => !directPermissions.includes(permission.codename));
  }, [permissions, directPermissions]);

  const pendingDangerAction =
    isRevoking ||
    isSuspending ||
    isReactivating ||
    isDeleting ||
    isRevokingSession ||
    isRevokingAll;

  if (isLoading) {
    return <MemberDetailSkeleton />;
  }

  if (isError || !member) {
    return (
      <div className="mx-auto max-w-6xl px-4 pb-20 md:px-0">
        <div className="border border-error-200 bg-error-50 p-8">
          <p className="font-sans text-base font-black text-error-700">
            Member details could not be loaded.
          </p>
          <p className="mt-2 font-mono text-xs text-error-600">
            Please refresh the page and try again.
          </p>
        </div>
      </div>
    );
  }

  function openDangerAction(action: DangerAction) {
    setConfirmationInput("");
    setDangerAction(action);
  }

  function closeDangerAction() {
    setDangerAction(null);
    setConfirmationInput("");
  }

  function handleAssignRole() {
    if (!member || !selectedRoleName) return;

    assignRole(
      { userId: member.id, roleName: selectedRoleName },
      {
        onSuccess: () => {
          toast.success("Role assigned successfully.");
          setSelectedRoleName("");
          setConfirmAssignRole(false);
        },
        onError: () => {
          toast.error("Failed to assign role. Please try again.");
        },
      }
    );
  }

  function handleGrantPermission() {
    if (!member || !selectedPermission) return;

    grantPermission(
      { userId: member.id, permission: selectedPermission },
      {
        onSuccess: () => {
          toast.success(`Permission "${selectedPermission}" granted.`);
          setSelectedPermission("");
        },
        onError: () => {
          toast.error("Failed to grant permission. Please try again.");
        },
      }
    );
  }

  function handleRevokePermission(permission: string) {
    if (!member) return;

    revokePermission(
      { userId: member.id, permission },
      {
        onSuccess: () => {
          toast.success(`Permission "${permission}" revoked.`);
        },
        onError: () => {
          toast.error("Failed to revoke permission. Please try again.");
        },
      }
    );
  }

  function handleConfirmedDangerAction() {
    if (!member || !dangerAction) return;
    if (confirmationInput !== member.username) {
      toast.error("Username does not match.");
      return;
    }

    if (dangerAction.type === "revoke-role") {
      revokeRole(
        { userId: member.id, roleName: dangerAction.roleName },
        {
          onSuccess: () => {
            toast.success(`Role "${dangerAction.roleName}" revoked.`);
            closeDangerAction();
          },
          onError: () => toast.error("Failed to revoke role. Please try again."),
        }
      );
      return;
    }

    if (dangerAction.type === "revoke-session") {
      revokeSession(
        { userId: member.id, sessionId: dangerAction.sessionId },
        {
          onSuccess: () => {
            toast.success("Session revoked.");
            closeDangerAction();
          },
          onError: () => toast.error("Failed to revoke session."),
        }
      );
      return;
    }

    if (dangerAction.type === "revoke-all-sessions") {
      revokeAllSessions(member.id, {
        onSuccess: () => {
          toast.success("All sessions revoked.");
          closeDangerAction();
        },
        onError: () => toast.error("Failed to revoke all sessions."),
      });
      return;
    }

    if (dangerAction.type === "suspend") {
      suspendMember(member.id, {
        onSuccess: () => {
          toast.success("Member suspended.");
          closeDangerAction();
        },
        onError: () => toast.error("Failed to suspend member. Please try again."),
      });
      return;
    }

    if (dangerAction.type === "reactivate") {
      reactivateMember(member.id, {
        onSuccess: () => {
          toast.success("Member reactivated.");
          closeDangerAction();
        },
        onError: () => toast.error("Failed to reactivate member."),
      });
      return;
    }

    deleteMember(member.id, {
      onSuccess: () => {
        toast.success("Member deleted.");
        closeDangerAction();
        router.push("/admin/members");
      },
      onError: () => toast.error("Failed to delete member."),
    });
  }

  function handleFlag() {
    if (!member || !flagReason.trim()) return;
    flagMember(
      { id: member.id, reason: flagReason.trim() },
      {
        onSuccess: () => {
          toast.success("Account flagged.");
          setFlagDialogOpen(false);
          setFlagReason("");
        },
        onError: () => toast.error("Failed to flag account."),
      }
    );
  }

  function handleUnflag() {
    if (!member) return;
    unflagMember(
      { id: member.id },
      {
        onSuccess: () => {
          toast.success("Flag resolved.");
          setUnflagDialogOpen(false);
        },
        onError: () => toast.error("Failed to resolve flag."),
      }
    );
  }

  const activeSessions = sessions ?? [];
  const modalCopy = dangerCopy(dangerAction, member.username, dangerRoleEffects);
  const canConfirmDangerAction = confirmationInput === member.username && !pendingDangerAction;
  const canShowDangerZone =
    (canRevokeSessions && activeSessions.length > 0) ||
    (member.isActive && canSuspend) ||
    (!member.isActive && canReactivate) ||
    canDelete;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 md:px-0">
      <div className="mb-6">
        <Link
          href="/admin/members"
          className="inline-flex items-center gap-1.5 font-mono text-xs font-medium text-text-muted transition-colors hover:text-text-primary"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Member Directory
        </Link>
      </div>

      <header className="mb-6 border border-grey-200 bg-white">
        <div className="flex flex-col gap-5 p-5 md:flex-row md:items-start md:justify-between">
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start">
            <div className="h-24 w-24 shrink-0 overflow-hidden border border-grey-200 bg-grey-50">
              {/* biome-ignore lint/performance/noImgElement: user avatar */}
              <img
                src={getAvatarUrl(member.profilePictureUrl, member.fullName || member.username)}
                alt={member.fullName || member.username}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-3">
                <h1 className="font-sans text-3xl font-black leading-tight text-text-primary">
                  {member.fullName || member.username}
                </h1>
                <StatusPill
                  active={member.isActive}
                  isFlagged={member.isFlagged}
                  underReview={member.activeFlag?.profileUpdatedAfterFlag}
                />
              </div>
              <p className="font-mono text-sm text-text-tertiary">@{member.username}</p>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 font-mono text-xs text-text-secondary">
                <span className="flex min-w-0 items-center gap-2">
                  <Mail className="h-3.5 w-3.5 shrink-0 text-icon-muted" />
                  <span className="break-all">{member.email}</span>
                </span>
                <span className="flex items-center gap-2">
                  <Shield className="h-3.5 w-3.5 text-icon-muted" />
                  {member.communityId || "No community ID"}
                </span>
                <span className="flex items-center gap-2">
                  <CalendarDays className="h-3.5 w-3.5 text-icon-muted" />
                  Joined {formatDate(member.joinedAt || member.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row md:justify-end">
            {canEdit && (
              <Link
                href={`/admin/members/${member.username}/edit`}
                className="flex h-10 items-center justify-center border border-grey-900 bg-grey-900 px-4 font-mono text-xs font-bold text-white transition-colors hover:bg-grey-800"
              >
                Edit profile
              </Link>
            )}
            {!member.isFlagged && canFlag && (
              <button
                type="button"
                onClick={() => setFlagDialogOpen(true)}
                className="flex h-10 items-center justify-center gap-2 border border-red-600 bg-red-600 px-4 font-mono text-xs font-bold text-white transition-colors hover:bg-red-700"
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                Flag account
              </button>
            )}
            {member.isFlagged && canReviewFlag && (
              <button
                type="button"
                onClick={() => setUnflagDialogOpen(true)}
                className="flex h-10 items-center justify-center gap-2 border border-emerald-600 bg-emerald-600 px-4 font-mono text-xs font-bold text-white transition-colors hover:bg-emerald-700"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Resolve flag
              </button>
            )}
            <Link
              href={`/@${member.username}`}
              target="_blank"
              className="flex h-10 items-center justify-center gap-2 border border-grey-200 bg-white px-4 font-mono text-xs font-bold text-text-secondary transition-colors hover:bg-grey-50"
            >
              Public profile
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 border-t border-grey-200 sm:grid-cols-4 lg:grid-cols-5">
          <HeaderStat label="Roles" value={String(member.roles.length)} />
          <HeaderStat label="Onboarded" value={member.isOnboarded ? "Yes" : "No"} />
          <HeaderStat label="Email" value={member.isEmailVerified ? "Verified" : "Pending"} />
          <HeaderStat label="Primary role" value={member.primaryRole || "None"} />
          <HeaderStat label="Last login" value={formatDate(member.lastLoginAt)} />
        </div>
      </header>

      {/* Flag banner */}
      {member.isFlagged && member.activeFlag && (
        <div
          className={`mb-6 border px-5 py-4 ${member.activeFlag.profileUpdatedAfterFlag ? "border-amber-300 bg-amber-50" : "border-red-300 bg-red-50"}`}
        >
          <div className="flex items-start gap-3">
            {member.activeFlag.profileUpdatedAfterFlag ? (
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            ) : (
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
            )}
            <div className="min-w-0 flex-1">
              <p
                className={`font-sans text-sm font-bold ${member.activeFlag.profileUpdatedAfterFlag ? "text-amber-700" : "text-red-700"}`}
              >
                {member.activeFlag.profileUpdatedAfterFlag
                  ? "Review submitted — awaiting resolution"
                  : "Account flagged"}
              </p>
              <p
                className={`mt-1 whitespace-pre-wrap font-mono text-sm ${member.activeFlag.profileUpdatedAfterFlag ? "text-amber-800" : "text-red-800"}`}
              >
                {member.activeFlag.reason}
              </p>
              <div className="mt-2 flex flex-wrap gap-4">
                <span
                  className={`font-mono text-[10px] ${member.activeFlag.profileUpdatedAfterFlag ? "text-amber-600" : "text-red-600"}`}
                >
                  Flagged by{" "}
                  <span className="font-bold">@{member.activeFlag.flaggedBy ?? "unknown"}</span>
                </span>
                {member.activeFlag.profileUpdatedAfterFlag && (
                  <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-amber-700">
                    <CheckCircle2 className="h-3 w-3" />
                    Member has updated their profile — review and resolve when satisfied
                  </span>
                )}
              </div>
            </div>
            {canReviewFlag && (
              <button
                type="button"
                onClick={() => setUnflagDialogOpen(true)}
                className="shrink-0 border border-emerald-600 bg-emerald-600 px-3 py-1.5 font-mono text-xs font-bold text-white hover:bg-emerald-700"
              >
                Resolve flag
              </button>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <main className="space-y-6">
          <section className="border border-grey-200 bg-white">
            <div className="border-b border-grey-200 bg-grey-50 px-5 py-3">
              <h2 className="font-sans text-base font-bold text-text-primary">
                Member information
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-x-8 gap-y-6 p-5 md:grid-cols-2">
              <DetailItem label="Full name" value={member.fullName} />
              <DetailItem label="Current role" value={member.currentRole} />
              <DetailItem
                label="Discipline"
                value={labelForOption(member.discipline, DISCIPLINES)}
              />
              <DetailItem
                label="Experience level"
                value={labelForOption(member.experienceLevel, EXPERIENCE_LEVELS)}
              />
              <DetailItem
                label="Member status"
                value={labelForOption(member.memberStatus, MEMBER_STATUSES)}
              />
              <DetailItem label="Location" value={member.location} />
              <DetailItem
                label="Discord"
                value={member.discordId ? `@${member.username}` : member.discordUsername}
                href={
                  member.discordId ? `https://discord.com/users/${member.discordId}` : undefined
                }
              />
              <DetailItem label="Primary goal" value={member.primaryGoal} />
              <div className="md:col-span-2">
                <DetailItem label="Bio" value={member.bio} isLongText />
              </div>
            </div>
          </section>

          <section className="border border-grey-200 bg-white">
            <div className="flex items-center justify-between gap-4 border-b border-grey-200 bg-grey-50 px-5 py-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-icon-tertiary" />
                <h2 className="font-sans text-base font-bold text-text-primary">Roles</h2>
              </div>
              <span className="font-mono text-xs text-text-tertiary">
                {member.roles.length} assigned
              </span>
            </div>
            <div className="space-y-5 p-5">
              {assignedRoleSlugs.length === 0 ? (
                <p className="font-mono text-sm text-text-tertiary">No roles assigned.</p>
              ) : (
                <div className="divide-y divide-grey-200 border border-grey-200">
                  {assignedRoleSlugs.map((roleSlug) => {
                    const role = rolesByName.get(roleSlug);
                    return (
                      <div
                        key={roleSlug}
                        className="flex items-center justify-between gap-4 px-4 py-3"
                      >
                        <div>
                          <p className="font-mono text-sm font-bold text-text-primary">
                            {role?.displayName ?? roleSlug}
                          </p>
                          <p className="mt-1 font-mono text-xs text-text-muted">
                            {role?.permissions.length ?? 0} permissions currently granted by this
                            role.
                          </p>
                        </div>
                        {canRevoke && (
                          <button
                            type="button"
                            onClick={() =>
                              openDangerAction({ type: "revoke-role", roleName: roleSlug })
                            }
                            className="inline-flex h-8 items-center gap-2 border border-error-200 px-3 font-mono text-xs font-bold text-error-700 transition-colors hover:bg-error-50"
                          >
                            <UserMinus className="h-3.5 w-3.5" />
                            Revoke
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {canAssign && (
                <div className="border-t border-grey-200 pt-5">
                  <p className="mb-3 font-mono text-xs font-medium text-text-muted">Assign role</p>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Select value={selectedRoleName} onValueChange={setSelectedRoleName}>
                      <SelectTrigger className="h-10 w-full rounded-none border-grey-200 bg-white font-mono text-sm sm:w-80">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent className="rounded-none">
                        {availableRoles.length === 0 && (
                          <SelectItem value="none" disabled>
                            No roles available
                          </SelectItem>
                        )}
                        {availableRoles.map((role) => (
                          <SelectItem key={role.name} value={role.name}>
                            {role.displayName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <button
                      type="button"
                      onClick={() => {
                        if (!selectedRoleName) return;
                        setConfirmAssignRole(true);
                      }}
                      disabled={isAssigning || !selectedRoleName}
                      className="h-10 border border-grey-900 bg-grey-900 px-5 font-mono text-xs font-bold text-white transition-colors hover:bg-grey-800 disabled:opacity-50"
                    >
                      Review assignment
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="border border-grey-200 bg-white">
            <div className="flex items-center justify-between gap-4 border-b border-grey-200 bg-grey-50 px-5 py-3">
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-icon-tertiary" />
                <h2 className="font-sans text-base font-bold text-text-primary">
                  Direct permissions
                </h2>
              </div>
              <span className="font-mono text-xs text-text-tertiary">
                {directPermissions.length} granted
              </span>
            </div>
            <div className="space-y-5 p-5">
              <p className="font-mono text-xs leading-6 text-text-tertiary">
                Permissions granted here apply to this member directly, on top of anything their
                roles already grant. Use them for one-off access without creating a new role.
              </p>

              {directPermissions.length === 0 ? (
                <p className="font-mono text-sm text-text-tertiary">
                  No direct permissions granted.
                </p>
              ) : (
                <div className="divide-y divide-grey-200 border border-grey-200">
                  {directPermissions.map((permission) => (
                    <div
                      key={permission}
                      className="flex items-center justify-between gap-4 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="font-mono text-sm font-bold text-text-primary">
                          {permission}
                        </p>
                        <p className="mt-1 font-mono text-xs leading-5 text-text-muted">
                          {permissionEffect(permission, permissionDescriptions)}
                        </p>
                      </div>
                      {canRevokePermission && (
                        <button
                          type="button"
                          onClick={() => handleRevokePermission(permission)}
                          disabled={isRevokingPermission}
                          className="inline-flex h-8 shrink-0 items-center gap-2 border border-error-200 px-3 font-mono text-xs font-bold text-error-700 transition-colors hover:bg-error-50 disabled:opacity-50"
                        >
                          <UserMinus className="h-3.5 w-3.5" />
                          Revoke
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {canAssignPermission && (
                <div className="border-t border-grey-200 pt-5">
                  <p className="mb-3 font-mono text-xs font-medium text-text-muted">
                    Grant permission
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Select value={selectedPermission} onValueChange={setSelectedPermission}>
                      <SelectTrigger className="h-10 w-full rounded-none border-grey-200 bg-white font-mono text-sm sm:w-80">
                        <SelectValue placeholder="Select a permission" />
                      </SelectTrigger>
                      <SelectContent className="rounded-none">
                        {assignablePermissions.length === 0 && (
                          <SelectItem value="none" disabled>
                            No permissions available
                          </SelectItem>
                        )}
                        {assignablePermissions.map((permission) => (
                          <SelectItem key={permission.codename} value={permission.codename}>
                            {permission.codename}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <button
                      type="button"
                      onClick={handleGrantPermission}
                      disabled={isGrantingPermission || !selectedPermission}
                      className="h-10 border border-grey-900 bg-grey-900 px-5 font-mono text-xs font-bold text-white transition-colors hover:bg-grey-800 disabled:opacity-50"
                    >
                      {isGrantingPermission ? "Granting..." : "Grant permission"}
                    </button>
                  </div>
                  {selectedPermission && (
                    <p className="mt-3 font-mono text-xs leading-5 text-text-tertiary">
                      {permissionEffect(selectedPermission, permissionDescriptions)}
                    </p>
                  )}
                </div>
              )}
            </div>
          </section>
        </main>

        <aside className="space-y-6">
          <section className="border border-grey-200 bg-white">
            <div className="border-b border-grey-200 bg-grey-50 px-5 py-3">
              <h2 className="font-sans text-base font-bold text-text-primary">Account</h2>
            </div>
            <div className="divide-y divide-grey-200">
              <SideFact label="Status" value={member.isActive ? "Active" : "Suspended"} />
              <SideFact
                label="Email verification"
                value={member.isEmailVerified ? "Verified" : "Pending"}
              />
              <SideFact label="Onboarding" value={member.isOnboarded ? "Completed" : "Pending"} />
              <SideFact label="Last updated" value={formatDate(member.updatedAt)} />
            </div>
          </section>

          {canViewSessions && (
            <section className="border border-grey-200 bg-white">
              <div className="flex items-center justify-between gap-4 border-b border-grey-200 bg-grey-50 px-5 py-3">
                <div className="flex items-center gap-2">
                  <Laptop className="h-4 w-4 text-icon-tertiary" />
                  <h2 className="font-sans text-base font-bold text-text-primary">Sessions</h2>
                </div>
                <span className="font-mono text-xs text-text-tertiary">
                  {activeSessions.length} active
                </span>
              </div>
              <div className="p-5">
                {sessionsLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-14 w-full rounded-none" />
                    <Skeleton className="h-14 w-full rounded-none" />
                  </div>
                ) : activeSessions.length === 0 ? (
                  <p className="font-mono text-sm text-text-tertiary">No active sessions.</p>
                ) : (
                  <div className="divide-y divide-grey-200 border border-grey-200">
                    {activeSessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="font-mono text-sm font-bold text-text-primary">
                            {session.deviceName}
                          </p>
                          <p className="mt-1 font-mono text-xs text-text-muted">
                            {session.ipAddress || "Unknown IP"} · Started{" "}
                            {formatDate(session.createdAt)}
                          </p>
                        </div>
                        {canRevokeSessions && (
                          <button
                            type="button"
                            onClick={() =>
                              openDangerAction({
                                type: "revoke-session",
                                sessionId: session.id,
                                deviceName: session.deviceName,
                              })
                            }
                            className="h-8 border border-error-200 px-3 font-mono text-xs font-bold text-error-700 transition-colors hover:bg-error-50"
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}
        </aside>
      </div>

      {canShowDangerZone && (
        <section className="mt-8 border border-error-300 bg-error-50">
          <div className="border-b border-error-300 px-5 py-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-error-700" />
              <h2 className="font-sans text-base font-bold text-error-700">Danger zone</h2>
            </div>
          </div>
          <div className="divide-y divide-error-200">
            {canRevokeSessions && activeSessions.length > 0 && (
              <DangerRow
                title="Revoke all sessions"
                description="Force this member out of every active browser and device session."
                buttonLabel="Revoke sessions"
                onClick={() => openDangerAction({ type: "revoke-all-sessions" })}
                disabled={isRevokingAll}
              />
            )}
            {member.isActive && canSuspend && (
              <DangerRow
                title="Suspend this account"
                description="Block sign-in and prevent this member from using the portal."
                buttonLabel="Suspend account"
                onClick={() => openDangerAction({ type: "suspend" })}
                disabled={isSuspending}
              />
            )}
            {!member.isActive && canReactivate && (
              <DangerRow
                title="Reactivate this account"
                description="Restore access for a currently suspended member."
                buttonLabel="Reactivate account"
                onClick={() => openDangerAction({ type: "reactivate" })}
                disabled={isReactivating}
              />
            )}
            {canDelete && (
              <DangerRow
                title="Delete this member"
                description="Permanently remove this member and account data."
                buttonLabel="Delete member"
                onClick={() => openDangerAction({ type: "delete" })}
                disabled={isDeleting}
                severe
              />
            )}
          </div>
        </section>
      )}

      <Sheet open={confirmAssignRole} onOpenChange={setConfirmAssignRole}>
        <SheetContent className="w-full border-grey-200 bg-white p-0 sm:max-w-xl">
          <SheetHeader className="border-b border-grey-200 p-5 pr-12">
            <SheetTitle className="font-sans text-2xl font-bold text-text-primary">
              Review role assignment
            </SheetTitle>
            <SheetDescription className="pt-2 font-mono text-xs leading-6 text-text-secondary">
              Assigning a role changes what this member can access and manage in the portal.
            </SheetDescription>
          </SheetHeader>

          <div className="min-h-0 flex-1 overflow-y-auto p-5">
            <div className="border border-grey-200 bg-grey-50 p-4">
              <p className="font-mono text-xs font-medium text-text-muted">Role</p>
              <h3 className="mt-2 font-sans text-2xl font-black text-text-primary">
                {selectedRole?.displayName ?? selectedRoleName}
              </h3>
              <p className="mt-1 font-mono text-xs text-text-tertiary">
                {selectedRole?.name ?? selectedRoleName} · {selectedRole?.permissions.length ?? 0}{" "}
                permissions
              </p>
              {selectedRole?.description && (
                <p className="mt-3 font-mono text-xs leading-6 text-text-secondary">
                  {selectedRole.description}
                </p>
              )}
            </div>

            <div className="mt-5 border border-grey-200 bg-white p-4">
              <p className="font-mono text-xs font-medium text-text-muted">Member</p>
              <p className="mt-2 font-sans text-lg font-black text-text-primary">
                {member.fullName || member.username}
              </p>
              <p className="mt-1 font-mono text-xs text-text-tertiary">@{member.username}</p>
            </div>

            <RolePermissionSummary
              title="This role will allow the member to:"
              permissions={selectedRole?.permissions ?? []}
              effects={selectedRoleEffects}
            />
          </div>

          <SheetFooter className="border-t border-grey-200 bg-grey-50 p-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmAssignRole(false)}
              className="h-10 rounded-none font-mono text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAssignRole}
              disabled={isAssigning || !selectedRoleName}
              className="h-10 rounded-none font-mono text-xs font-bold"
            >
              {isAssigning ? "Assigning..." : "Assign role"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Sheet
        open={dangerAction?.type === "revoke-role"}
        onOpenChange={(open) => !open && closeDangerAction()}
      >
        <SheetContent className="w-full border-grey-200 bg-white p-0 sm:max-w-xl">
          <SheetHeader className="border-b border-grey-200 p-5 pr-12">
            <SheetTitle className="font-sans text-2xl font-bold text-error-700">
              Revoke role
            </SheetTitle>
            <SheetDescription className="pt-2 font-mono text-xs leading-6 text-text-secondary">
              This will remove{" "}
              <span className="font-bold text-text-primary">
                {dangerAction?.type === "revoke-role"
                  ? (rolesByName.get(dangerAction.roleName)?.displayName ?? dangerAction.roleName)
                  : ""}
              </span>{" "}
              from <span className="font-bold text-text-primary">@{member.username}</span>.
            </SheetDescription>
          </SheetHeader>

          <div className="min-h-0 flex-1 overflow-y-auto p-5">
            <div className="border border-error-200 bg-error-50 px-3 py-2 font-mono text-xs font-bold text-error-700">
              This member may lose the permissions listed below unless another role still grants
              them.
            </div>

            {dangerAction?.type === "revoke-role" && (
              <RolePermissionSummary
                title="Revoking this role may prevent the member from:"
                permissions={rolesByName.get(dangerAction.roleName)?.permissions ?? []}
                effects={dangerRoleEffects}
                tone="red"
              />
            )}

            <div className="mt-5 space-y-2">
              <p className="font-mono text-xs text-text-tertiary">
                Type <span className="font-bold text-text-primary">{member.username}</span> to
                confirm.
              </p>
              <Input
                value={confirmationInput}
                onChange={(event) => setConfirmationInput(event.target.value)}
                placeholder="Type username"
                className="h-10 rounded-none border-grey-300 font-mono text-sm"
                onKeyDown={(event) => {
                  if (event.key === "Enter" && canConfirmDangerAction) {
                    handleConfirmedDangerAction();
                  }
                }}
              />
            </div>
          </div>

          <SheetFooter className="border-t border-grey-200 bg-grey-50 p-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={closeDangerAction}
              className="h-10 rounded-none font-mono text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmedDangerAction}
              disabled={!canConfirmDangerAction}
              className="h-10 rounded-none font-mono text-xs font-bold"
            >
              {pendingDangerAction ? "Working..." : "Revoke role"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Dialog
        open={!!dangerAction && dangerAction.type !== "revoke-role"}
        onOpenChange={(open) => !open && closeDangerAction()}
      >
        <DialogContent className="max-w-md rounded-none border-grey-900 bg-white">
          <DialogHeader>
            <DialogTitle
              className={`font-sans text-xl font-bold ${
                modalCopy.tone === "green" ? "text-success-700" : "text-error-700"
              }`}
            >
              {modalCopy.title}
            </DialogTitle>
            <DialogDescription className="pt-2 font-mono text-xs leading-6 text-text-secondary">
              {modalCopy.description}
            </DialogDescription>
            <div
              className={`border px-3 py-2 font-mono text-xs font-bold ${
                modalCopy.tone === "green"
                  ? "border-success-200 bg-success-50 text-success-700"
                  : "border-error-200 bg-error-50 text-error-700"
              }`}
            >
              {modalCopy.warning}
            </div>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <p className="font-mono text-xs text-text-tertiary">
              Type <span className="font-bold text-text-primary">{member.username}</span> to
              confirm.
            </p>
            <Input
              value={confirmationInput}
              onChange={(event) => setConfirmationInput(event.target.value)}
              placeholder="Type username"
              className="h-10 rounded-none border-grey-300 font-mono text-sm"
              onKeyDown={(event) => {
                if (event.key === "Enter" && canConfirmDangerAction) {
                  handleConfirmedDangerAction();
                }
              }}
            />
          </div>

          <DialogFooter className="mt-2 gap-2 rounded-none border-grey-200 sm:gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={closeDangerAction}
              className="h-10 rounded-none font-mono text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant={modalCopy.tone === "green" ? "default" : "destructive"}
              onClick={handleConfirmedDangerAction}
              disabled={!canConfirmDangerAction}
              className="h-10 rounded-none font-mono text-xs font-bold"
            >
              {pendingDangerAction ? "Working..." : modalCopy.button}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Flag dialog */}
      <Dialog open={flagDialogOpen} onOpenChange={setFlagDialogOpen}>
        <DialogContent className="max-w-md rounded-none border-grey-900 bg-white">
          <DialogHeader>
            <DialogTitle className="font-sans text-xl font-bold text-red-700">
              Flag account
            </DialogTitle>
            <DialogDescription className="pt-2 font-mono text-xs leading-6 text-text-secondary">
              The member will see this reason and be prompted to fix their profile. Admins will be
              notified when they update their profile.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <label htmlFor="flag-reason" className="font-mono text-xs font-medium text-text-muted">
              Reason
            </label>
            <textarea
              id="flag-reason"
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
              placeholder="e.g. Profile picture does not appear professional. Please upload a clear headshot."
              rows={4}
              className="w-full resize-none border border-grey-300 bg-white px-3 py-2.5 font-mono text-sm text-text-primary placeholder:text-text-muted focus:border-grey-900 focus:outline-none"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFlagDialogOpen(false);
                setFlagReason("");
              }}
              className="h-10 rounded-none font-mono text-xs font-bold"
            >
              Cancel
            </Button>
            <button
              type="button"
              onClick={handleFlag}
              disabled={!flagReason.trim() || isFlagging}
              className="h-10 border border-red-600 bg-red-600 px-4 font-mono text-xs font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
            >
              {isFlagging ? "Flagging..." : "Flag account"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unflag dialog */}
      <Dialog open={unflagDialogOpen} onOpenChange={setUnflagDialogOpen}>
        <DialogContent className="max-w-md rounded-none border-grey-900 bg-white">
          <DialogHeader>
            <DialogTitle className="font-sans text-xl font-bold text-emerald-700">
              Resolve flag
            </DialogTitle>
            <DialogDescription className="pt-2 font-mono text-xs leading-6 text-text-secondary">
              This will clear the active flag on{" "}
              <span className="font-bold text-text-primary">@{member.username}</span>'s account. The
              member will be notified that their account is in good standing.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setUnflagDialogOpen(false)}
              className="h-10 rounded-none font-mono text-xs font-bold"
            >
              Cancel
            </Button>
            <button
              type="button"
              onClick={handleUnflag}
              disabled={isUnflagging}
              className="h-10 border border-emerald-600 bg-emerald-600 px-4 font-mono text-xs font-bold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
            >
              {isUnflagging ? "Resolving..." : "Resolve flag"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DangerRow({
  title,
  description,
  buttonLabel,
  onClick,
  disabled,
  severe,
}: {
  title: string;
  description: string;
  buttonLabel: string;
  onClick: () => void;
  disabled?: boolean;
  severe?: boolean;
}) {
  return (
    <div className="flex flex-col gap-4 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-sans text-sm font-black text-error-800">{title}</p>
        <p className="mt-1 font-mono text-xs leading-5 text-error-700">{description}</p>
      </div>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`h-9 shrink-0 border px-4 font-mono text-xs font-bold transition-colors disabled:opacity-50 ${
          severe
            ? "border-error-700 bg-error-700 text-white hover:bg-error-600"
            : "border-error-300 bg-white text-error-700 hover:bg-error-50"
        }`}
      >
        {severe && <Trash2 className="mr-2 inline h-3.5 w-3.5" />}
        {buttonLabel}
      </button>
    </div>
  );
}

function RolePermissionSummary({
  title,
  permissions,
  effects,
  tone = "neutral",
}: {
  title: string;
  permissions: string[];
  effects: string[];
  tone?: "neutral" | "red";
}) {
  const borderClass =
    tone === "red" ? "border-error-200 bg-error-50" : "border-grey-200 bg-grey-50";
  const textClass = tone === "red" ? "text-error-800" : "text-text-secondary";

  return (
    <div className={`mt-4 border ${borderClass} p-4`}>
      <p className={`font-sans text-sm font-bold ${textClass}`}>{title}</p>
      {effects.length === 0 ? (
        <p className="mt-3 font-mono text-xs leading-6 text-text-tertiary">
          This role does not currently list any permissions.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {effects.map((effect, index) => (
            <li
              // biome-ignore lint/suspicious/noArrayIndexKey: permission summaries are static text from role permissions
              key={`${permissions[index] ?? effect}-${index}`}
              className="border border-white bg-white px-3 py-2 font-mono text-xs leading-5 text-text-secondary"
            >
              <span className="font-bold text-text-primary">{permissions[index]}</span>
              <span className="mx-2 text-text-muted">-</span>
              {effect}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MemberDetailPageContent({ username }: { username: string }) {
  return (
    <RouteGuard permission="users.view">
      <MemberDetailContent username={username} />
    </RouteGuard>
  );
}

export default function MemberDetailPage() {
  const { username } = useParams<{ username: string }>();
  return <MemberDetailPageContent username={username} />;
}

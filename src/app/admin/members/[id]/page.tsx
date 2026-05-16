"use client";

import { ChevronLeft, ShieldCheck, User, UserMinus, Users } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { DashboardShell } from "@/components/dashboard/Shell";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
    useAdminMember,
    useAssignRole,
    useDeactivateMember,
    useRevokeRole,
    useRoles,
} from "@/hooks/useAdmin";
import { usePermission } from "@/hooks/usePermission";

// ─── Skeleton loader ──────────────────────────────────────────────────────────

function MemberDetailSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-80" />
            <Skeleton className="h-56 w-full" />
            <Skeleton className="h-48 w-full" />
        </div>
    );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatValue(value: string | null | undefined) {
    if (!value) return "—";
    return value;
}

// ─── Page content ─────────────────────────────────────────────────────────────

function MemberDetailContent({ id }: { id: string }) {
    const { data: member, isLoading, isError } = useAdminMember(id);
    const { data: roles } = useRoles();
    const { mutate: assignRole, isPending: isAssigning } = useAssignRole();
    const { mutate: revokeRole, isPending: isRevoking } = useRevokeRole();
    const { mutate: deactivateMember, isPending: isDeactivating } = useDeactivateMember();

    const canEdit = usePermission("members.edit");
    const canAssign = usePermission("roles.assign");
    const canRevoke = usePermission("roles.revoke");
    const canDeactivate = usePermission("members.deactivate");

    const [selectedRoleId, setSelectedRoleId] = useState("");
    const [confirmDeactivate, setConfirmDeactivate] = useState(false);

    const availableRoles = useMemo(() => {
        if (!roles || !member) return [];
        return roles.filter((role) => !member.roles.includes(role.name));
    }, [roles, member]);

    if (isLoading) {
        return <MemberDetailSkeleton />;
    }

    if (isError || !member) {
        return (
            <p className="font-mono text-xs text-red-500">
                Failed to load member details. Please refresh the page.
            </p>
        );
    }

    function handleAssignRole() {
        if (!member) {
            toast.error("Member data not available yet.");
            return;
        }
        if (!selectedRoleId) {
            toast.error("Select a role to assign.");
            return;
        }
        assignRole(
            { userId: member.id, roleId: selectedRoleId },
            {
                onSuccess: () => {
                    toast.success("Role assigned successfully.");
                    setSelectedRoleId("");
                },
                onError: () => {
                    toast.error("Failed to assign role. Please try again.");
                },
            }
        );
    }

    function handleRevokeRole(roleId: string, roleName: string) {
        if (!member) {
            toast.error("Member data not available yet.");
            return;
        }
        revokeRole(
            { userId: member.id, roleId },
            {
                onSuccess: () => {
                    toast.success(`Role "${roleName}" revoked.`);
                },
                onError: () => {
                    toast.error("Failed to revoke role. Please try again.");
                },
            }
        );
    }

    function handleDeactivate() {
        if (!member) {
            toast.error("Member data not available yet.");
            return;
        }
        if (!confirmDeactivate) {
            setConfirmDeactivate(true);
            return;
        }
        deactivateMember(member.id, {
            onSuccess: () => {
                toast.success("Member deactivated.");
                setConfirmDeactivate(false);
            },
            onError: () => {
                toast.error("Failed to deactivate member. Please try again.");
                setConfirmDeactivate(false);
            },
        });
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-start justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <User className="w-5 h-5 text-zinc-400" />
                        <h1 className="font-sans font-black uppercase tracking-widest text-xl text-zinc-900">
                            {member.fullName}
                        </h1>
                    </div>
                    <p className="font-mono text-xs text-zinc-400">
                        {member.communityId} · {member.email}
                    </p>
                </div>
                {canEdit && (
                    <Link
                        href={`/admin/members/${member.id}/edit`}
                        className="font-mono text-xs uppercase tracking-widest text-zinc-900 border border-zinc-200 px-4 py-2 hover:bg-zinc-50 transition-colors"
                    >
                        Edit Member
                    </Link>
                )}
            </div>

            {/* Profile details */}
            <div className="bg-white border border-zinc-200">
                <div className="px-6 py-4 border-b border-zinc-200">
                    <h2 className="font-sans font-black uppercase tracking-widest text-sm text-zinc-900">
                        Profile
                    </h2>
                </div>
                <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p className="font-mono text-xs text-zinc-400 uppercase tracking-widest">
                            Bio
                        </p>
                        <p className="font-sans text-sm text-zinc-700">
                            {formatValue(member.bio)}
                        </p>
                    </div>
                    <div>
                        <p className="font-mono text-xs text-zinc-400 uppercase tracking-widest">
                            Discipline
                        </p>
                        <p className="font-sans text-sm text-zinc-700">
                            {formatValue(member.discipline)}
                        </p>
                    </div>
                    <div>
                        <p className="font-mono text-xs text-zinc-400 uppercase tracking-widest">
                            Experience Level
                        </p>
                        <p className="font-sans text-sm text-zinc-700">
                            {formatValue(member.experienceLevel)}
                        </p>
                    </div>
                    <div>
                        <p className="font-mono text-xs text-zinc-400 uppercase tracking-widest">
                            Location
                        </p>
                        <p className="font-sans text-sm text-zinc-700">
                            {formatValue(member.location)}
                        </p>
                    </div>
                    <div>
                        <p className="font-mono text-xs text-zinc-400 uppercase tracking-widest">
                            Skills
                        </p>
                        {member.skills.length === 0 ? (
                            <p className="font-sans text-sm text-zinc-700">—</p>
                        ) : (
                            <div className="flex flex-wrap gap-2 mt-1">
                                {member.skills.map((skill) => (
                                    <Badge key={skill} variant="outline" className="text-[10px]">
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>
                    <div>
                        <p className="font-mono text-xs text-zinc-400 uppercase tracking-widest">
                            Current Role
                        </p>
                        <p className="font-sans text-sm text-zinc-700">
                            {formatValue(member.currentRole)}
                        </p>
                    </div>
                    <div>
                        <p className="font-mono text-xs text-zinc-400 uppercase tracking-widest">
                            Primary Goal
                        </p>
                        <p className="font-sans text-sm text-zinc-700">
                            {formatValue(member.primaryGoal)}
                        </p>
                    </div>
                    <div>
                        <p className="font-mono text-xs text-zinc-400 uppercase tracking-widest">
                            Community Goals
                        </p>
                        {member.communityGoals.length === 0 ? (
                            <p className="font-sans text-sm text-zinc-700">—</p>
                        ) : (
                            <div className="flex flex-wrap gap-2 mt-1">
                                {member.communityGoals.map((goal) => (
                                    <Badge key={goal} variant="outline" className="text-[10px]">
                                        {goal}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Roles */}
            <div className="bg-white border border-zinc-200">
                <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-zinc-400" />
                        <h2 className="font-sans font-black uppercase tracking-widest text-sm text-zinc-900">
                            Roles ({member.roles.length})
                        </h2>
                    </div>
                </div>

                <div className="px-6 py-6 space-y-4">
                    <div className="flex flex-wrap gap-2">
                        {member.roles.length === 0 ? (
                            <p className="font-mono text-xs text-zinc-400">No roles assigned.</p>
                        ) : (
                            member.roles.map((roleName) => (
                                <Badge key={roleName} variant="outline" className="text-[10px]">
                                    {roleName}
                                </Badge>
                            ))
                        )}
                    </div>

                    {canAssign && (
                        <div className="flex flex-col md:flex-row md:items-center gap-3">
                            <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                                <SelectTrigger className="w-full md:w-72 font-mono text-xs rounded-none border-zinc-200">
                                    <SelectValue placeholder="Assign a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableRoles.length === 0 && (
                                        <SelectItem value="none" disabled>
                                            No roles available
                                        </SelectItem>
                                    )}
                                    {availableRoles.map((role) => (
                                        <SelectItem key={role.id} value={String(role.id)}>
                                            {role.displayName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <button
                                type="button"
                                onClick={handleAssignRole}
                                disabled={isAssigning}
                                className="font-mono text-xs uppercase tracking-widest text-zinc-900 border border-zinc-200 px-4 py-2 hover:bg-zinc-50 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                            >
                                Assign Role
                            </button>
                        </div>
                    )}

                    {canRevoke && member.roles.length > 0 && (
                        <div className="space-y-2">
                            <p className="font-mono text-xs text-zinc-400 uppercase tracking-widest">
                                Revoke Role
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {member.roles.map((roleName) => {
                                    const role = roles?.find((item) => item.name === roleName);
                                    const roleId = role ? String(role.id) : "";
                                    return (
                                        <button
                                            key={roleName}
                                            type="button"
                                            disabled={!roleId || isRevoking}
                                            onClick={() => roleId && handleRevokeRole(roleId, roleName)}
                                            className="font-mono text-xs uppercase tracking-widest px-3 py-1.5 border border-zinc-200 text-zinc-500 hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                                        >
                                            <UserMinus className="w-3 h-3 inline-block mr-1" />
                                            {roleId ? `Revoke ${roleName}` : `Role ${roleName}`}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Deactivate */}
            {canDeactivate && (
                <div className="bg-white border border-red-200 p-6">
                    <div className="flex items-start gap-3">
                        <ShieldCheck className="w-5 h-5 text-red-400" />
                        <div className="flex-1">
                            <h3 className="font-sans font-black uppercase tracking-widest text-sm text-red-600">
                                Deactivate Member
                            </h3>
                            <p className="font-mono text-xs text-zinc-500 mt-1">
                                Deactivated members are immediately signed out and cannot sign back in.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={handleDeactivate}
                            disabled={isDeactivating}
                            className={`font-mono text-xs uppercase tracking-widest px-4 py-2 border transition-colors disabled:opacity-50 disabled:pointer-events-none ${confirmDeactivate
                                ? "border-red-300 text-red-600 hover:bg-red-50"
                                : "border-zinc-200 text-zinc-500 hover:border-red-300 hover:text-red-600 hover:bg-red-50"
                                }`}
                        >
                            {confirmDeactivate ? "Confirm" : "Deactivate"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function MemberDetailPageContent({ id }: { id: string }) {
    return (
        <div className="max-w-6xl mx-auto pb-20">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 mb-6">
                <Link
                    href="/admin/members"
                    className="font-mono text-xs text-zinc-400 hover:text-zinc-900 transition-colors flex items-center gap-1"
                >
                    <ChevronLeft className="w-3 h-3" />
                    Members
                </Link>
            </div>

            <MemberDetailContent id={id} />
        </div>
    );
}

export default function MemberDetailPage({ params }: { params: { id: string } }) {
    return (
        <RouteGuard permission="members.view">
            <DashboardShell>
                <MemberDetailPageContent id={params.id} />
            </DashboardShell>
        </RouteGuard>
    );
}

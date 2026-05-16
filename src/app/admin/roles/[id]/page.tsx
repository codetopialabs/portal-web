"use client";

import { ChevronLeft, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { DashboardShell } from "@/components/dashboard/Shell";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useRole as useAdminRole } from "@/hooks/useAdmin";
import { usePermission } from "@/hooks/usePermission";

// ─── Skeleton loader ──────────────────────────────────────────────────────────

function RoleDetailSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-80" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
        </div>
    );
}

// ─── Role detail content ─────────────────────────────────────────────────────

function RoleDetailContent({ id }: { id: string }) {
    const { data: role, isLoading, isError } = useAdminRole(id);
    const canEdit = usePermission("roles.edit");

    if (isLoading) {
        return <RoleDetailSkeleton />;
    }

    if (isError || !role) {
        return (
            <p className="font-mono text-xs text-red-500">
                Failed to load role details. Please refresh the page.
            </p>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-start justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <ShieldCheck className="w-5 h-5 text-zinc-400" />
                        <h1 className="font-sans font-black uppercase tracking-widest text-xl text-zinc-900">
                            {role.displayName}
                        </h1>
                        {role.isSystem && (
                            <Badge variant="secondary" className="text-[10px]">
                                System
                            </Badge>
                        )}
                    </div>
                    <p className="font-mono text-xs text-zinc-400">{role.name}</p>
                    {role.description && (
                        <p className="font-mono text-xs text-zinc-500 mt-2 max-w-2xl">
                            {role.description}
                        </p>
                    )}
                </div>

                {canEdit && (
                    <Link
                        href={`/admin/roles/${role.id}/edit`}
                        className="font-mono text-xs uppercase tracking-widest text-zinc-900 border border-zinc-200 px-4 py-2 hover:bg-zinc-50 transition-colors"
                    >
                        Edit Role
                    </Link>
                )}
            </div>

            {/* Permissions */}
            <div className="bg-white border border-zinc-200">
                <div className="px-6 py-4 border-b border-zinc-200">
                    <h2 className="font-sans font-black uppercase tracking-widest text-sm text-zinc-900">
                        Permissions ({role.permissions.length})
                    </h2>
                </div>
                <div className="px-6 py-6">
                    {role.permissions.length === 0 ? (
                        <p className="font-mono text-xs text-zinc-400">
                            No permissions assigned to this role.
                        </p>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {role.permissions.map((perm) => (
                                <Badge key={perm} variant="outline" className="font-mono text-[10px]">
                                    {perm}
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Members */}
            <div className="bg-white border border-zinc-200">
                <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-zinc-400" />
                        <h2 className="font-sans font-black uppercase tracking-widest text-sm text-zinc-900">
                            Members ({role.members.length})
                        </h2>
                    </div>
                </div>

                {role.members.length === 0 ? (
                    <div className="px-6 py-6">
                        <p className="font-mono text-xs text-zinc-400">
                            No members assigned to this role yet.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-zinc-100">
                        <div className="grid grid-cols-[2fr_2fr_2fr_auto] gap-4 px-6 py-3 bg-zinc-50">
                            <span className="font-mono text-xs text-zinc-400 uppercase tracking-widest">
                                Name
                            </span>
                            <span className="font-mono text-xs text-zinc-400 uppercase tracking-widest">
                                Community ID
                            </span>
                            <span className="font-mono text-xs text-zinc-400 uppercase tracking-widest">
                                Username
                            </span>
                            <span className="sr-only">Actions</span>
                        </div>
                        {role.members.map((member) => (
                            <div
                                key={member.id}
                                className="grid grid-cols-[2fr_2fr_2fr_auto] gap-4 px-6 py-4 items-center"
                            >
                                <span className="font-sans text-sm text-zinc-900 truncate">
                                    {member.fullName}
                                </span>
                                <span className="font-mono text-xs text-zinc-500 truncate">
                                    {member.communityId}
                                </span>
                                <span className="font-mono text-xs text-zinc-500 truncate">
                                    @{member.username}
                                </span>
                                <Link
                                    href={`/admin/members/${member.id}`}
                                    className="font-mono text-xs uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-colors"
                                >
                                    View
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function RoleDetailPageContent({ id }: { id: string }) {
    return (
        <div className="max-w-6xl mx-auto pb-20">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 mb-6">
                <Link
                    href="/admin/roles"
                    className="font-mono text-xs text-zinc-400 hover:text-zinc-900 transition-colors flex items-center gap-1"
                >
                    <ChevronLeft className="w-3 h-3" />
                    Roles
                </Link>
            </div>

            <RoleDetailContent id={id} />
        </div>
    );
}

export default function RoleDetailPage({ params }: { params: { id: string } }) {
    return (
        <RouteGuard permission="roles.view">
            <DashboardShell>
                <RoleDetailPageContent id={params.id} />
            </DashboardShell>
        </RouteGuard>
    );
}

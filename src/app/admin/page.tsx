"use client";

import {
    BookOpen,
    Calendar,
    Code2,
    FileText,
    Key,
    ShieldCheck,
    Star,
    Users,
    Zap,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { DashboardShell } from "@/components/dashboard/Shell";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { Badge } from "@/components/ui/badge";

// ─── Coming Soon card ─────────────────────────────────────────────────────────

function ComingSoonCard({
    icon: Icon,
    name,
    description,
}: {
    icon: React.ElementType;
    name: string;
    description: string;
}) {
    return (
        <div className="bg-white border border-zinc-200 p-6 flex flex-col items-start gap-3">
            <Icon className="w-5 h-5 text-zinc-400" />
            <div className="space-y-1">
                <p className="font-sans font-black uppercase tracking-widest text-sm text-zinc-900">
                    {name}
                </p>
                <p className="font-mono text-xs text-zinc-400">{description}</p>
            </div>
            <Badge variant="outline">Coming Soon</Badge>
        </div>
    );
}

// ─── Tab navigation ───────────────────────────────────────────────────────────

const TABS = [
    { id: "roles", label: "Roles" },
    { id: "members", label: "Members" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function AdminTabs({ activeTab }: { activeTab: TabId }) {
    return (
        <div className="flex border-b border-zinc-200 mb-8">
            {TABS.map((tab) => (
                <Link
                    key={tab.id}
                    href={`/admin?tab=${tab.id}`}
                    className={`px-5 py-3 font-mono text-xs uppercase tracking-widest transition-colors border-b-2 -mb-px ${activeTab === tab.id
                            ? "border-zinc-900 text-zinc-900"
                            : "border-transparent text-zinc-400 hover:text-zinc-700"
                        }`}
                >
                    {tab.label}
                </Link>
            ))}
        </div>
    );
}

// ─── Coming Soon sections ─────────────────────────────────────────────────────

const COMING_SOON_SECTIONS = [
    {
        icon: FileText,
        name: "Application Management",
        description: "Review and manage community membership applications.",
    },
    {
        icon: BookOpen,
        name: "Form Builder",
        description: "Create custom forms for applications and surveys.",
    },
    {
        icon: Calendar,
        name: "Event Management",
        description: "Create and manage community events and registrations.",
    },
    {
        icon: Users,
        name: "Mentorship Management",
        description: "Manage mentorship pairings and program cohorts.",
    },
    {
        icon: Star,
        name: "XP Management",
        description: "Award and manage community experience points.",
    },
    {
        icon: Key,
        name: "API Key Management",
        description: "Create and revoke API keys for external integrations.",
    },
    {
        icon: Code2,
        name: "OAuth Client Management",
        description: "Manage OAuth clients and application authorizations.",
    },
];

// ─── Admin page content ───────────────────────────────────────────────────────

function AdminPageContent() {
    const searchParams = useSearchParams();
    const activeTab = (searchParams.get("tab") as TabId) ?? "roles";

    return (
        <div className="max-w-6xl mx-auto pb-20">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <ShieldCheck className="w-5 h-5 text-zinc-400" />
                    <h1 className="font-sans font-black uppercase tracking-widest text-xl text-zinc-900">
                        Admin Panel
                    </h1>
                </div>
                <p className="font-mono text-xs text-zinc-400">
                    Manage roles, permissions, and community members.
                </p>
            </div>

            {/* Tab navigation */}
            <AdminTabs activeTab={activeTab} />

            {/* Tab content */}
            {activeTab === "roles" && (
                <div className="space-y-8">
                    {/* Roles tab — links to roles list */}
                    <div className="flex items-center justify-between">
                        <p className="font-mono text-xs text-zinc-400">
                            Manage community roles and their permissions.
                        </p>
                        <Link
                            href="/admin/roles"
                            className="font-mono text-xs uppercase tracking-widest text-zinc-900 border border-zinc-200 px-4 py-2 hover:bg-zinc-50 transition-colors"
                        >
                            View All Roles →
                        </Link>
                    </div>

                    {/* Coming Soon sections */}
                    <div>
                        <h2 className="font-sans font-black uppercase tracking-widest text-sm text-zinc-900 mb-4">
                            Coming Soon
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {COMING_SOON_SECTIONS.map((section) => (
                                <ComingSoonCard
                                    key={section.name}
                                    icon={section.icon}
                                    name={section.name}
                                    description={section.description}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "members" && (
                <div className="space-y-8">
                    {/* Members tab — links to members list */}
                    <div className="flex items-center justify-between">
                        <p className="font-mono text-xs text-zinc-400">
                            View and manage community members.
                        </p>
                        <Link
                            href="/admin/members"
                            className="font-mono text-xs uppercase tracking-widest text-zinc-900 border border-zinc-200 px-4 py-2 hover:bg-zinc-50 transition-colors"
                        >
                            View All Members →
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminPage() {
    return (
        <RouteGuard permission="admin.panel.access">
            <DashboardShell>
                <Suspense>
                    <AdminPageContent />
                </Suspense>
            </DashboardShell>
        </RouteGuard>
    );
}

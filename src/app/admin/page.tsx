"use client";

import {
  ArrowUpRight,
  BookOpen,
  Calendar,
  Code2,
  FileText,
  Key,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { DashboardShell } from "@/components/dashboard/Shell";
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

function AdminPageContent() {
  return (
    <div className="max-w-6xl mx-auto pb-20">
      {/* Coming Soon sections */}
      <div>
        <h2 className="font-sans font-black uppercase tracking-widest text-sm text-zinc-900 mb-4">
          Quick Actions
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
      {/* Management */}
      <div className="mt-8">
        <h2 className="font-sans font-black uppercase tracking-widest text-sm text-zinc-900 mb-4">
          Management
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/admin/members"
            className="group relative bg-white border border-zinc-200 p-6 flex flex-col items-start gap-3 hover:bg-zinc-50 transition-colors"
          >
            <ArrowUpRight className="absolute top-4 right-4 w-4 h-4 text-zinc-300 group-hover:text-zinc-600 transition-colors" />
            <Users className="w-5 h-5 text-zinc-400" />
            <div className="space-y-1">
              <p className="font-sans font-black uppercase tracking-widest text-sm text-zinc-900">
                Members
              </p>
              <p className="font-mono text-xs text-zinc-400">View and manage community members.</p>
            </div>
          </Link>
          <Link
            href="/admin/roles"
            className="group relative bg-white border border-zinc-200 p-6 flex flex-col items-start gap-3 hover:bg-zinc-50 transition-colors"
          >
            <ArrowUpRight className="absolute top-4 right-4 w-4 h-4 text-zinc-300 group-hover:text-zinc-600 transition-colors" />
            <ShieldCheck className="w-5 h-5 text-zinc-400" />
            <div className="space-y-1">
              <p className="font-sans font-black uppercase tracking-widest text-sm text-zinc-900">
                Roles
              </p>
              <p className="font-mono text-xs text-zinc-400">Create and manage permission roles.</p>
            </div>
          </Link>
        </div>
      </div>
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

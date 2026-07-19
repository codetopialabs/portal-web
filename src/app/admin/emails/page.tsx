"use client";

import { Mail, Users } from "lucide-react";
import Link from "next/link";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { Skeleton } from "@/components/ui/skeleton";
import { useEmailCampaigns } from "@/hooks/useEmails";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function EmailHistoryContent() {
  const { data: campaigns = [], isLoading, isError } = useEmailCampaigns();

  return (
    <div className="pb-20 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-5 border-b border-zinc-200 pb-6">
        <div>
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
            Communications
          </p>
          <h1 className="mt-1 font-sans text-3xl font-black uppercase tracking-widest text-zinc-950">
            Emails
          </h1>
          <p className="mt-2 max-w-xl font-mono text-xs leading-6 text-zinc-500">
            History of every email sent from the portal. Compose a new one from the{" "}
            <Link href="/admin/members" className="underline hover:text-zinc-950">
              Members
            </Link>{" "}
            page — filter down to an audience, then "Email members".
          </p>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-px">
          {Array.from({ length: 4 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton rows
            <Skeleton key={i} className="h-20 w-full rounded-none" />
          ))}
        </div>
      )}

      {isError && (
        <div className="border border-red-200 bg-red-50 p-10 text-center">
          <p className="font-sans text-base font-black text-red-700">
            Email history could not be loaded.
          </p>
        </div>
      )}

      {!isLoading && !isError && campaigns.length === 0 && (
        <div className="border border-dashed border-zinc-300 bg-white p-14 text-center">
          <Mail className="mx-auto h-8 w-8 text-zinc-300" />
          <p className="mt-3 font-sans text-base font-black text-zinc-950">No emails sent yet</p>
          <p className="mt-1 font-mono text-xs text-zinc-400">
            Compose one from the Members page to see it here.
          </p>
        </div>
      )}

      {!isLoading && !isError && campaigns.length > 0 && (
        <div className="overflow-hidden border border-zinc-200 bg-white">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-100 p-5 last:border-b-0"
            >
              <div className="min-w-0 flex-1">
                <p className="font-sans text-sm font-black uppercase tracking-wide text-zinc-950">
                  {campaign.subject}
                </p>
                <p className="mt-1 line-clamp-2 font-mono text-xs leading-5 text-zinc-500">
                  {campaign.body}
                </p>
                <p className="mt-2 font-mono text-[10px] text-zinc-400">
                  Sent by <span className="font-bold text-zinc-600">{campaign.sentByName}</span>
                  {campaign.audienceSummary && ` · ${campaign.audienceSummary}`}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5 text-right">
                <span className="inline-flex items-center gap-1.5 border border-zinc-200 bg-zinc-50 px-2.5 py-1 font-mono text-[10px] font-bold text-zinc-600">
                  <Users className="h-3 w-3" />
                  {campaign.recipientCount} recipient{campaign.recipientCount === 1 ? "" : "s"}
                </span>
                <span className="font-mono text-[10px] text-zinc-400">
                  {formatDate(campaign.sentAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminEmailsPage() {
  return (
    <RouteGuard permission="emails.view">
      <EmailHistoryContent />
    </RouteGuard>
  );
}

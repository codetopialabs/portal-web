"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAcceptInvite, useDeclineInvite, useMyInvites } from "@/hooks/useTeams";
import type { TeamInvite } from "@/services/teams.service";
import { useInviteBannerStore } from "@/store/invite-banner.store";

function InviteRow({ invite }: { invite: TeamInvite }) {
  const teamSlug = invite.teamSlug;
  const { mutate: accept, isPending: accepting } = useAcceptInvite(teamSlug);
  const { mutate: decline, isPending: declining } = useDeclineInvite(teamSlug);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-1">
      <p className="font-mono text-xs text-zinc-700 flex-1 min-w-0">
        <span className="font-bold text-zinc-900">{invite.invitedBy?.fullName ?? "Someone"}</span>
        {" invited you to join "}
        <span className="font-bold text-zinc-900 uppercase tracking-wide">
          {invite.teamName ?? invite.teamSlug}
        </span>
      </p>
      <div className="flex items-center gap-2 shrink-0">
        <Button
          size="sm"
          className="h-7 bg-zinc-900 px-3 font-mono text-[10px] uppercase tracking-widest"
          disabled={accepting || declining}
          onClick={() => accept(invite.id)}
        >
          Accept
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-7 px-3 font-mono text-[10px] uppercase tracking-widest"
          disabled={accepting || declining}
          onClick={() => decline(invite.id)}
        >
          Decline
        </Button>
      </div>
    </div>
  );
}

export function InviteBanner() {
  const { data: invites } = useMyInvites();
  const { dismissed, dismiss } = useInviteBannerStore();

  const pending = invites?.filter((i) => i.status === "pending") ?? [];

  if (dismissed || pending.length === 0) return null;

  return (
    <div className="bg-white border-b border-zinc-200 px-5 py-3 relative">
      <button
        type="button"
        onClick={dismiss}
        className="absolute right-4 top-3 text-zinc-400 hover:text-zinc-700 transition-colors"
        aria-label="Dismiss invite banner"
      >
        <X className="h-4 w-4" />
      </button>
      <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">
        Pending Invitations
      </p>
      <div className="divide-y divide-zinc-100 pr-6">
        {pending.map((invite) => (
          <InviteRow key={invite.id} invite={invite} />
        ))}
      </div>
    </div>
  );
}

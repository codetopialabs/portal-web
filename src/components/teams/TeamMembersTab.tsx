// biome-ignore-all lint/suspicious/noExplicitAny: community search API response items are not generically typed at this component layer
"use client";

import { Check, Crown, Loader2, Mail, Plus, Trash2, UserPlus, Users, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useCommunityMembers } from "@/hooks/useCommunityMembers";
import {
  useRemoveMember,
  useReviewJoinRequest,
  useRevokeInvite,
  useSendInvite,
  useTeamInvites,
  useTeamJoinRequests,
  useTeamMembers,
  useUpdateMemberRole,
} from "@/hooks/useTeams";
import { getAvatarUrl } from "@/lib/utils";

interface InviteeUser {
  id: string;
  username: string;
  fullName: string;
  profilePictureUrl: string | null;
}

interface TeamMembersTabProps {
  teamSlug: string;
  isLead: boolean;
  isOwner: boolean;
}

export function TeamMembersTab({ teamSlug, isLead, isOwner }: TeamMembersTabProps) {
  // All data-fetching moved inside this component — it only runs when Members tab is visible
  const { data: members, isLoading: membersLoading } = useTeamMembers(teamSlug);
  const { data: pendingInvites } = useTeamInvites(teamSlug);
  const { data: joinRequests } = useTeamJoinRequests(teamSlug);
  const { mutate: sendInvite, isPending: invitePending } = useSendInvite(teamSlug);
  const { mutate: removeMember, isPending: removePending } = useRemoveMember(teamSlug);
  const { mutate: revokeInvite, isPending: revokePending } = useRevokeInvite(teamSlug);
  const { mutate: reviewJoinRequest, isPending: reviewPending } = useReviewJoinRequest(teamSlug);
  const { mutate: updateRole, isPending: roleUpdatePending } = useUpdateMemberRole(teamSlug);

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [invitees, setInvitees] = useState<InviteeUser[]>([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data: searchResults } = useCommunityMembers(debouncedSearch || undefined);

  const filteredResults = searchResults?.filter(
    (u: any) => !invitees.some((inv) => inv.id === u.id)
  );

  function addInvitee(user: InviteeUser) {
    if (invitees.some((inv) => inv.id === user.id)) return;
    setInvitees((prev) => [...prev, user]);
    setSearchInput("");
    setDebouncedSearch("");
    setShowDropdown(false);
  }

  function removeInvitee(userId: string) {
    setInvitees((prev) => prev.filter((u) => u.id !== userId));
  }

  async function handleSendInvites(e: React.FormEvent) {
    e.preventDefault();
    if (invitees.length === 0) return;
    setSending(true);
    await Promise.allSettled(
      invitees.map(
        (u) =>
          new Promise<void>((resolve) => {
            sendInvite(u.username, { onSuccess: () => resolve(), onError: () => resolve() });
          })
      )
    );
    setInvitees([]);
    setSending(false);
  }

  const isBusy = invitePending || sending;

  return (
    <div className="space-y-8">
      {/* Invite Form — leads only */}
      {isLead && (
        <div className="bg-grey-50 border border-grey-200 p-5">
          <h3 className="font-sans font-black uppercase tracking-tight text-text-primary mb-4">
            Invite Members
          </h3>
          <form onSubmit={handleSendInvites} className="space-y-3">
            <div className="relative max-w-sm">
              <Input
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                placeholder="Search by name or username…"
                className="w-full h-10 font-mono text-sm rounded-none bg-white"
                autoComplete="off"
              />
              {showDropdown && searchInput && filteredResults && filteredResults.length > 0 && (
                <div className="absolute top-full left-0 w-full mt-1 bg-white border border-grey-200 shadow-xl z-50 max-h-60 overflow-y-auto">
                  {filteredResults.map((user: any) => (
                    <button
                      key={user.id}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => addInvitee(user)}
                      className="w-full text-left px-4 py-3 hover:bg-grey-50 border-b border-grey-100 last:border-0 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Image
                          src={getAvatarUrl(user.profilePictureUrl, user.fullName)}
                          alt=""
                          width={32}
                          height={32}
                          className="h-8 w-8 rounded-none object-cover border border-grey-200 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="font-sans text-sm font-black text-text-primary truncate">
                            {user.fullName}
                          </div>
                          <div className="font-mono text-[10px] text-text-tertiary truncate">
                            @{user.username}
                          </div>
                        </div>
                        <Plus className="h-3.5 w-3.5 text-text-muted shrink-0" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {invitees.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {invitees.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-2 bg-white border border-grey-200 pl-1 pr-2 py-1"
                  >
                    <Image
                      src={getAvatarUrl(user.profilePictureUrl, user.fullName)}
                      alt=""
                      width={24}
                      height={24}
                      className="h-6 w-6 rounded-none object-cover border border-grey-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="font-sans text-xs font-black text-text-primary truncate block leading-tight">
                        {user.fullName}
                      </span>
                      <span className="font-mono text-[9px] text-text-muted block leading-tight">
                        @{user.username}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeInvitee(user.id)}
                      className="ml-1 text-text-muted hover:text-text-secondary transition-colors"
                      aria-label={`Remove ${user.fullName}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div>
              <Button
                type="submit"
                disabled={isBusy || invitees.length === 0}
                className="h-10 shrink-0 font-mono text-[11px] uppercase tracking-widest rounded-none bg-grey-900 text-white hover:bg-grey-800"
              >
                {isBusy ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="mr-2 h-4 w-4" />
                )}
                {invitees.length > 1 ? `Send ${invitees.length} Invites` : "Send Invite"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Roster */}
      <div>
        <h3 className="font-sans font-black uppercase tracking-tight text-text-primary mb-4">
          Team Roster
        </h3>
        <div className="border border-grey-200 bg-white divide-y divide-grey-100 overflow-hidden">
          {membersLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-none" />
              ))}
            </div>
          ) : !members || members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center px-4">
              <Users className="h-5 w-5 text-text-muted mb-2" />
              <p className="font-mono text-[10px] text-text-muted">No members yet.</p>
            </div>
          ) : (
            members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between px-5 py-4 hover:bg-grey-50 transition-colors group"
              >
                <Link href={`/@${member.user.username}`} className="flex items-center gap-4 flex-1">
                  <Image
                    src={getAvatarUrl(member.user.profilePictureUrl, member.user.fullName)}
                    alt={member.user.fullName}
                    width={40}
                    height={40}
                    className="h-10 w-10 border border-grey-200 object-cover rounded-none"
                  />
                  <div className="min-w-0">
                    <p className="font-sans text-sm font-black text-text-primary group-hover:underline truncate">
                      {member.user.fullName}
                    </p>
                    <p className="font-mono text-[10px] text-text-muted mt-0.5">
                      @{member.user.username}
                    </p>
                  </div>
                </Link>
                <div className="flex items-center gap-4">
                  {member.role === "owner" ? (
                    <Badge className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest border-amber-300 bg-amber-50 text-amber-700">
                      <Crown className="h-3 w-3" />
                      Owner
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="font-mono text-[10px] uppercase tracking-widest bg-white"
                    >
                      {member.role === "lead" ? "Lead" : "Member"}
                    </Badge>
                  )}
                  {isOwner && member.role !== "owner" && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={roleUpdatePending}
                      onClick={() =>
                        updateRole({
                          userId: member.user.id,
                          role: member.role === "lead" ? "member" : "lead",
                        })
                      }
                      className="h-8 font-mono text-[10px] uppercase tracking-widest rounded-none"
                    >
                      {member.role === "lead" ? "Demote" : "Promote to Lead"}
                    </Button>
                  )}
                  {isLead && member.role !== "lead" && member.role !== "owner" && (
                    <ConfirmModal
                      title="Remove Member"
                      description={`Are you sure you want to remove ${member.user.fullName} from the team?`}
                      confirmText="Remove"
                      onConfirm={() => removeMember(member.user.id)}
                      isLoading={removePending}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={removePending}
                        className="h-8 w-8 text-text-muted hover:text-white hover:bg-red-600"
                        title="Remove Member"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </ConfirmModal>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Join requests — leads only */}
      {isLead && joinRequests && joinRequests.length > 0 && (
        <div>
          <h3 className="font-sans font-black uppercase tracking-tight text-text-primary mb-4 flex items-center gap-2">
            Join Requests
            <span className="inline-flex items-center justify-center px-1.5 py-0.5 font-mono text-[9px] bg-zinc-800 text-white">
              {joinRequests.length}
            </span>
          </h3>
          <div className="border border-grey-200 bg-white divide-y divide-grey-100 overflow-hidden">
            {joinRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between px-5 py-4 bg-grey-50/50"
              >
                <div className="flex items-center gap-4">
                  <Image
                    src={getAvatarUrl(request.user.profilePictureUrl, request.user.fullName)}
                    alt={request.user.fullName}
                    width={40}
                    height={40}
                    className="h-10 w-10 border border-grey-200 object-cover rounded-none"
                  />
                  <div className="min-w-0">
                    <p className="font-sans text-sm font-black text-text-primary truncate">
                      {request.user.fullName}
                    </p>
                    <p className="font-mono text-[10px] text-text-tertiary mt-0.5">
                      @{request.user.username}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    disabled={reviewPending}
                    onClick={() => reviewJoinRequest({ requestId: request.id, action: "approve" })}
                    className="h-8 font-mono text-[10px] uppercase tracking-widest rounded-none bg-grey-900 text-white hover:bg-grey-800"
                  >
                    <Check className="mr-1.5 h-3.5 w-3.5" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={reviewPending}
                    onClick={() => reviewJoinRequest({ requestId: request.id, action: "decline" })}
                    className="h-8 font-mono text-[10px] uppercase tracking-widest rounded-none"
                  >
                    <X className="mr-1.5 h-3.5 w-3.5" />
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending invites — leads only */}
      {isLead && pendingInvites && pendingInvites.length > 0 && (
        <div>
          <h3 className="font-sans font-black uppercase tracking-tight text-text-primary mb-4 flex items-center gap-2">
            Pending Invites
            <span className="inline-flex items-center justify-center px-1.5 py-0.5 font-mono text-[9px] bg-zinc-800 text-white">
              {pendingInvites.length}
            </span>
          </h3>
          <div className="border border-grey-200 bg-white divide-y divide-grey-100 overflow-hidden">
            {pendingInvites.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between px-5 py-4 bg-grey-50/50"
              >
                <div className="flex items-center gap-4 opacity-70">
                  <Image
                    src={getAvatarUrl(invite.user.profilePictureUrl, invite.user.fullName)}
                    alt={invite.user.fullName}
                    width={40}
                    height={40}
                    className="h-10 w-10 border border-grey-200 object-cover rounded-none grayscale"
                  />
                  <div className="min-w-0">
                    <p className="font-sans text-sm font-black text-text-primary truncate">
                      {invite.user.fullName}
                    </p>
                    <p className="font-mono text-[10px] text-text-tertiary mt-0.5">
                      @{invite.user.username}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    Sent
                  </span>
                  <ConfirmModal
                    title="Revoke Invite"
                    description={`Are you sure you want to revoke the invite sent to ${invite.user.fullName}?`}
                    confirmText="Revoke"
                    onConfirm={() => revokeInvite(invite.id)}
                    isLoading={revokePending}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={revokePending}
                      className="h-8 font-mono text-[10px] uppercase tracking-widest bg-red-600 text-white border-red-600 hover:bg-red-700"
                    >
                      Revoke
                    </Button>
                  </ConfirmModal>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

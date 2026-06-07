"use client";

import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Circle,
  FileText,
  Loader2,
  Mail,
  Plus,
  Trash2,
  UserPlus,
  Users,
  X,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { DashboardShell } from "@/components/dashboard/Shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useCommunityMembers } from "@/hooks/useCommunityMembers";
import {
  useAcceptInvite,
  useDeclineInvite,
  useMyInvites,
  useMyMembership,
  useRemoveMember,
  useRevokeInvite,
  useSendInvite,
  useTeam,
  useTeamInvites,
  useTeamMembers,
  useTeamReviews,
} from "@/hooks/useTeams";
import { getAvatarUrl } from "@/lib/utils";

export default function TeamWorkspacePage() {
  return (
    <RouteGuard>
      <TeamWorkspaceContent />
    </RouteGuard>
  );
}

function TeamWorkspaceContent() {
  const { teamSlug } = useParams<{ teamSlug: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const tab = searchParams.get("tab") || "overview";

  const { data: team, isLoading: teamLoading, isError: teamError } = useTeam(teamSlug);
  const { data: members, isLoading: membersLoading } = useTeamMembers(teamSlug);
  const { data: membership } = useMyMembership(teamSlug);
  const { data: reviews, isLoading: reviewsLoading } = useTeamReviews(teamSlug);
  const { data: pendingInvites } = useTeamInvites(teamSlug);
  const { data: myInvites } = useMyInvites();

  const isLead = membership?.role === "lead";
  const myInvite = myInvites?.find((invite) => invite.team === team?.id);

  const { mutate: sendInvite, isPending: invitePending } = useSendInvite(teamSlug);
  const { mutate: acceptInvite, isPending: acceptPending } = useAcceptInvite(teamSlug);
  const { mutate: declineInvite, isPending: declinePending } = useDeclineInvite(teamSlug);
  const { mutate: removeMember, isPending: removePending } = useRemoveMember(teamSlug);
  const { mutate: revokeInvite, isPending: revokePending } = useRevokeInvite(teamSlug);

  function setTab(newTab: string) {
    router.push(`${pathname}?tab=${newTab}`);
  }

  if (teamLoading) {
    return (
      <DashboardShell>
        <div className="w-full max-w-none space-y-6 pb-20">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-10 w-full" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (teamError || !team) {
    return (
      <DashboardShell>
        <div className="flex flex-col items-center justify-center py-24 border border-zinc-200 bg-white text-center">
          <p className="font-mono text-sm text-zinc-500">
            Team not found or you don't have access.
          </p>
          <Link
            href="/teams"
            className="mt-4 font-mono text-xs uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors"
          >
            ← Back to Teams
          </Link>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="w-full max-w-none space-y-8 pb-20">
        {/* Back */}
        <Link
          href="/teams"
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-zinc-400 transition-colors hover:text-zinc-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All Teams
        </Link>

        {/* Header */}
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-zinc-400">
              Team Workspace
            </p>
            {membership && (
              <Badge
                variant="outline"
                className="font-mono text-[10px] uppercase tracking-widest rounded-none"
              >
                {isLead ? "Lead" : "Member"}
              </Badge>
            )}
          </div>
          <div className="flex items-end justify-between gap-4 mt-2">
            <div>
              <h1 className="font-sans text-3xl font-black uppercase tracking-tight text-zinc-950">
                {team.name}
              </h1>
              {team.description && (
                <p className="mt-2 max-w-2xl font-mono text-sm leading-6 text-zinc-500">
                  {team.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Horizontal Tab Bar */}
        <div className="border-b border-zinc-200 flex items-center gap-6">
          <button
            type="button"
            onClick={() => setTab("overview")}
            className={`pb-3 font-mono text-xs uppercase tracking-widest transition-colors relative ${
              tab === "overview" ? "text-zinc-950 font-bold" : "text-zinc-400 hover:text-zinc-900"
            }`}
          >
            Overview
            {tab === "overview" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-950" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setTab("reviews")}
            className={`pb-3 font-mono text-xs uppercase tracking-widest transition-colors relative flex items-center gap-2 ${
              tab === "reviews" ? "text-zinc-950 font-bold" : "text-zinc-400 hover:text-zinc-900"
            }`}
          >
            Reviews
            {reviews && (
              <span className="inline-flex items-center justify-center rounded-full bg-zinc-100 px-2 py-0.5 text-[9px] font-bold text-zinc-600">
                {reviews.length}
              </span>
            )}
            {tab === "reviews" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-950" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setTab("members")}
            className={`pb-3 font-mono text-xs uppercase tracking-widest transition-colors relative flex items-center gap-2 ${
              tab === "members" ? "text-zinc-950 font-bold" : "text-zinc-400 hover:text-zinc-900"
            }`}
          >
            Members
            {members && (
              <span className="inline-flex items-center justify-center rounded-full bg-zinc-100 px-2 py-0.5 text-[9px] font-bold text-zinc-600">
                {members.length}
              </span>
            )}
            {tab === "members" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-950" />
            )}
          </button>
        </div>

        {/* Tab Contents */}
        <div className="mt-6">
          {tab === "overview" && (
            <OverviewTab
              team={team}
              reviews={reviews}
              reviewsLoading={reviewsLoading}
              myInvite={myInvite}
              acceptInvite={acceptInvite}
              declineInvite={declineInvite}
              acceptPending={acceptPending}
              declinePending={declinePending}
              teamSlug={teamSlug}
            />
          )}
          {tab === "reviews" && (
            <ReviewsTab teamSlug={teamSlug} reviews={reviews} reviewsLoading={reviewsLoading} />
          )}
          {tab === "members" && (
            <MembersTab
              members={members}
              membersLoading={membersLoading}
              pendingInvites={pendingInvites}
              isLead={isLead}
              sendInvite={sendInvite}
              invitePending={invitePending}
              removeMember={removeMember}
              removePending={removePending}
              revokeInvite={revokeInvite}
              revokePending={revokePending}
            />
          )}
        </div>
      </div>
    </DashboardShell>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({
  team,
  reviews,
  reviewsLoading,
  myInvite,
  acceptInvite,
  declineInvite,
  acceptPending,
  declinePending,
  teamSlug,
}: any) {
  const recentReviews = reviews?.slice(0, 5) ?? [];

  return (
    <div className="space-y-8">
      {myInvite && (
        <div className="border border-emerald-200 bg-emerald-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-sans font-bold text-emerald-900">You've been invited!</h3>
            <p className="font-mono text-xs text-emerald-700 mt-1">
              {myInvite.invited_by?.fullName} invited you to join {team.name}.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => declineInvite(myInvite.id)}
              disabled={declinePending || acceptPending}
              className="font-mono text-[10px] uppercase tracking-widest border-emerald-200 text-emerald-700 hover:bg-emerald-100"
            >
              <X className="mr-1.5 h-3 w-3" />
              Decline
            </Button>
            <Button
              size="sm"
              onClick={() => acceptInvite(myInvite.id)}
              disabled={acceptPending || declinePending}
              className="font-mono text-[10px] uppercase tracking-widest bg-emerald-600 text-white hover:bg-emerald-700"
            >
              <Check className="mr-1.5 h-3 w-3" />
              Accept
            </Button>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-sans font-black uppercase tracking-tight text-zinc-950">
            Recent Activity
          </h2>
        </div>

        <div className="border border-zinc-200 bg-white divide-y divide-zinc-100 overflow-hidden rounded-none">
          {reviewsLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-none" />
              ))}
            </div>
          ) : recentReviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <div className="mb-3 flex h-12 w-12 items-center justify-center border border-zinc-100 bg-zinc-50 rounded-none">
                <FileText className="h-5 w-5 text-zinc-300" />
              </div>
              <p className="font-mono text-xs text-zinc-400">No activity yet.</p>
            </div>
          ) : (
            recentReviews.map((review: any) => (
              <Link
                key={review.id}
                href={`/teams/${teamSlug}/reviews/${review.id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-zinc-50 transition-colors"
              >
                <div className="shrink-0">
                  {review.status === "open" ? (
                    <Circle className="h-4 w-4 text-emerald-500" />
                  ) : review.status === "approved" ? (
                    <CheckCircle2 className="h-4 w-4 text-violet-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-zinc-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm font-semibold text-zinc-900 truncate">
                    {review.title}
                  </p>
                  <p className="font-mono text-[10px] text-zinc-400 mt-0.5">
                    by {review.author.fullName}
                    {review.category ? ` · ${review.category}` : ""}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={`shrink-0 font-mono text-[10px] uppercase tracking-widest rounded-none ${
                    review.status === "open"
                      ? "border-emerald-200 text-emerald-700"
                      : review.status === "approved"
                        ? "border-violet-200 text-violet-700"
                        : "border-zinc-200 text-zinc-400"
                  }`}
                >
                  {review.status}
                </Badge>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Reviews Tab ──────────────────────────────────────────────────────────────

function ReviewsTab({ teamSlug, reviews, reviewsLoading }: any) {
  const [filter, setFilter] = useState<"all" | "open" | "approved" | "closed">("all");

  const filteredReviews = reviews?.filter((r: any) => filter === "all" || r.status === filter);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 pb-4">
        <div className="flex items-center gap-2">
          {(["all", "open", "approved", "closed"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 font-mono text-[11px] uppercase tracking-widest transition-colors rounded-none ${
                filter === f
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900"
              }`}
            >
              {f}
              {f !== "all" && reviews && (
                <span className="ml-2 opacity-50">
                  ({reviews.filter((r: any) => r.status === f).length})
                </span>
              )}
            </button>
          ))}
        </div>
        <Link
          href={`/teams/${teamSlug}/reviews/new`}
          className="inline-flex h-9 items-center justify-center bg-zinc-900 px-5 font-mono text-[11px] font-black uppercase tracking-[0.16em] text-white hover:bg-zinc-800 transition-colors"
        >
          <Plus className="mr-2 h-4 w-4" />
          Open Review
        </Link>
      </div>

      <div className="border border-zinc-200 bg-white divide-y divide-zinc-100 overflow-hidden">
        {reviewsLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : !filteredReviews || filteredReviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center px-6">
            <div className="mb-4 flex h-14 w-14 items-center justify-center border border-zinc-200 bg-zinc-50">
              <FileText className="h-6 w-6 text-zinc-300" />
            </div>
            <h3 className="font-sans font-black uppercase tracking-tight text-zinc-900">
              No reviews found
            </h3>
            <p className="mt-1 font-mono text-xs text-zinc-400">
              {filter === "all"
                ? "Be the first to open a review in this team."
                : `There are no ${filter} reviews in this team.`}
            </p>
          </div>
        ) : (
          filteredReviews.map((review: any) => (
            <Link
              key={review.id}
              href={`/teams/${teamSlug}/reviews/${review.id}`}
              className="group flex items-center gap-4 px-6 py-5 hover:bg-zinc-50 transition-colors"
            >
              <div className="shrink-0">
                {review.status === "open" ? (
                  <Circle className="h-5 w-5 text-emerald-500" />
                ) : review.status === "approved" ? (
                  <CheckCircle2 className="h-5 w-5 text-violet-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-zinc-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-sans font-black uppercase tracking-tight text-zinc-950 group-hover:text-zinc-700 truncate">
                    {review.title}
                  </h3>
                  {review.category && (
                    <Badge
                      variant="secondary"
                      className="font-mono text-[9px] uppercase tracking-widest bg-zinc-100 text-zinc-500"
                    >
                      {review.category}
                    </Badge>
                  )}
                  {review.labels?.map((label: any) => (
                    <span
                      key={label.id}
                      className="font-mono text-[9px] uppercase tracking-widest px-1.5 py-0.5 border text-zinc-700"
                      style={{
                        borderColor: label.color,
                        backgroundColor: `${label.color}15`,
                      }}
                    >
                      {label.name}
                    </span>
                  ))}
                </div>
                <p className="font-mono text-[11px] text-zinc-400 mt-1">
                  #{review.id.slice(0, 8)} opened by {review.author.fullName}
                </p>
              </div>
              <div className="flex items-center gap-6">
                {review.assignees && review.assignees.length > 0 && (
                  <div className="hidden sm:flex -space-x-2">
                    {review.assignees.slice(0, 3).map((assignee: any) => (
                      <Image
                        key={assignee.id}
                        src={getAvatarUrl(assignee.profilePictureUrl, assignee.fullName)}
                        alt={assignee.fullName}
                        width={24}
                        height={24}
                        className="h-6 w-6 rounded-none border-2 border-white object-cover"
                        title={`Reviewer: ${assignee.fullName}`}
                      />
                    ))}
                    {review.assignees.length > 3 && (
                      <span className="flex h-6 w-6 items-center justify-center border-2 border-white bg-zinc-100 font-mono text-[9px] font-bold text-zinc-600">
                        +{review.assignees.length - 3}
                      </span>
                    )}
                  </div>
                )}
                <div className="hidden sm:flex flex-col items-end">
                  <span className="font-mono text-[10px] font-bold text-zinc-900">
                    {review.commentsCount}
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-400">
                    Comments
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className={`shrink-0 font-mono text-[10px] uppercase tracking-widest ${
                    review.status === "open"
                      ? "border-emerald-200 text-emerald-700"
                      : review.status === "approved"
                        ? "border-violet-200 text-violet-700"
                        : "border-zinc-200 text-zinc-400"
                  }`}
                >
                  {review.status}
                </Badge>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Members Tab ──────────────────────────────────────────────────────────────

// Invitee chip type
interface InviteeUser {
  id: string;
  username: string;
  fullName: string;
  profilePictureUrl: string | null;
}

function MembersTab({
  members,
  membersLoading,
  pendingInvites,
  isLead,
  sendInvite,
  invitePending,
  removeMember,
  removePending,
  revokeInvite,
  revokePending,
}: any) {
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

  // Filter out already-queued users from dropdown
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
    // Fire all invites in parallel; individual toasts handled by hook
    await Promise.allSettled(
      invitees.map(
        (u) =>
          new Promise<void>((resolve) => {
            sendInvite(u.username, { onSuccess: resolve, onError: resolve });
          })
      )
    );
    setInvitees([]);
    setSending(false);
  }

  const isBusy = invitePending || sending;

  return (
    <div className="space-y-8">
      {isLead && (
        <div className="bg-zinc-50 border border-zinc-200 p-5">
          <h3 className="font-sans font-black uppercase tracking-tight text-zinc-950 mb-4">
            Invite Members
          </h3>
          <form onSubmit={handleSendInvites} className="space-y-3">
            {/* Search input + dropdown */}
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
                <div className="absolute top-full left-0 w-full mt-1 bg-white border border-zinc-200 shadow-xl z-50 max-h-60 overflow-y-auto">
                  {filteredResults.map((user: any) => (
                    <button
                      key={user.id}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => addInvitee(user)}
                      className="w-full text-left px-4 py-3 hover:bg-zinc-50 border-b border-zinc-100 last:border-0 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Image
                          src={getAvatarUrl(user.profilePictureUrl, user.fullName)}
                          alt=""
                          width={32}
                          height={32}
                          className="h-8 w-8 rounded-none object-cover border border-zinc-200 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="font-sans text-sm font-black text-zinc-900 truncate">
                            {user.fullName}
                          </div>
                          <div className="font-mono text-[10px] text-zinc-500 truncate">
                            @{user.username}
                          </div>
                        </div>
                        <Plus className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Queued invitee chips */}
            {invitees.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {invitees.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-2 bg-white border border-zinc-200 pl-1 pr-2 py-1"
                  >
                    <Image
                      src={getAvatarUrl(user.profilePictureUrl, user.fullName)}
                      alt=""
                      width={24}
                      height={24}
                      className="h-6 w-6 rounded-none object-cover border border-zinc-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="font-sans text-xs font-black text-zinc-900 truncate block leading-tight">
                        {user.fullName}
                      </span>
                      <span className="font-mono text-[9px] text-zinc-400 block leading-tight">
                        @{user.username}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeInvitee(user.id)}
                      className="ml-1 text-zinc-400 hover:text-zinc-700 transition-colors"
                      aria-label={`Remove ${user.fullName}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Send button */}
            <div>
              <Button
                type="submit"
                disabled={isBusy || invitees.length === 0}
                className="h-10 shrink-0 font-mono text-[11px] uppercase tracking-widest rounded-none bg-zinc-900 text-white hover:bg-zinc-800"
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

      <div>
        <h3 className="font-sans font-black uppercase tracking-tight text-zinc-950 mb-4">
          Team Roster
        </h3>
        <div className="border border-zinc-200 bg-white divide-y divide-zinc-100 overflow-hidden">
          {membersLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-none" />
              ))}
            </div>
          ) : !members || members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center px-4">
              <Users className="h-5 w-5 text-zinc-300 mb-2" />
              <p className="font-mono text-[10px] text-zinc-400">No members yet.</p>
            </div>
          ) : (
            members.map((member: any) => (
              <div
                key={member.id}
                className="flex items-center justify-between px-5 py-4 hover:bg-zinc-50 transition-colors group"
              >
                <Link href={`/@${member.user.username}`} className="flex items-center gap-4 flex-1">
                  <Image
                    src={getAvatarUrl(member.user.profilePictureUrl, member.user.fullName)}
                    alt={member.user.fullName}
                    width={40}
                    height={40}
                    className="h-10 w-10 border border-zinc-200 object-cover rounded-none"
                  />
                  <div className="min-w-0">
                    <p className="font-sans text-sm font-black text-zinc-900 group-hover:underline truncate">
                      {member.user.fullName}
                    </p>
                    <p className="font-mono text-[10px] text-zinc-400 mt-0.5">
                      @{member.user.username}
                    </p>
                  </div>
                </Link>
                <div className="flex items-center gap-4">
                  <Badge
                    variant="outline"
                    className="font-mono text-[10px] uppercase tracking-widest bg-white"
                  >
                    {member.role === "lead" ? "Lead" : "Member"}
                  </Badge>
                  {isLead && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeMember(member.user.id)}
                      disabled={removePending}
                      className="h-8 w-8 text-zinc-400 hover:text-red-600 hover:bg-red-50"
                      title="Remove Member"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {isLead && pendingInvites && pendingInvites.length > 0 && (
        <div>
          <h3 className="font-sans font-black uppercase tracking-tight text-zinc-950 mb-4 flex items-center gap-2">
            Pending Invites
            <Badge variant="secondary" className="font-mono text-[9px] bg-zinc-100 text-zinc-500">
              {pendingInvites.length}
            </Badge>
          </h3>
          <div className="border border-zinc-200 bg-white divide-y divide-zinc-100 overflow-hidden">
            {pendingInvites.map((invite: any) => (
              <div
                key={invite.id}
                className="flex items-center justify-between px-5 py-4 bg-zinc-50/50"
              >
                <div className="flex items-center gap-4 opacity-70">
                  <Image
                    src={getAvatarUrl(invite.user.profilePictureUrl, invite.user.fullName)}
                    alt={invite.user.fullName}
                    width={40}
                    height={40}
                    className="h-10 w-10 border border-zinc-200 object-cover rounded-none grayscale"
                  />
                  <div className="min-w-0">
                    <p className="font-sans text-sm font-black text-zinc-900 truncate">
                      {invite.user.fullName}
                    </p>
                    <p className="font-mono text-[10px] text-zinc-500 mt-0.5">
                      @{invite.user.username}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400 flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    Sent
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => revokeInvite(invite.id)}
                    disabled={revokePending}
                    className="h-8 font-mono text-[10px] uppercase tracking-widest text-red-600 border-red-200 hover:bg-red-50"
                  >
                    Revoke
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

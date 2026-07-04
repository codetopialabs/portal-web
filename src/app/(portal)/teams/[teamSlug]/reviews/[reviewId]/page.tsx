// biome-ignore-all lint/suspicious/noExplicitAny: API response shapes for labels, assignees, and timeline items are not fully typed yet
"use client";

import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  Circle,
  Loader2,
  MessageSquare,
  MoreVertical,
  Pencil,
  ShieldCheck,
  Tag,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { DashboardShell } from "@/components/dashboard/Shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useMe } from "@/hooks/useMe";
import { usePermission } from "@/hooks/usePermission";
import {
  useAddReviewAssignee,
  useAddReviewLabel,
  useApproveReview,
  useCloseReview,
  useCreateComment,
  useCreateTeamLabel,
  useDeleteComment,
  useEditComment,
  useEditReview,
  useMyMembership,
  useRemoveReviewAssignee,
  useRemoveReviewLabel,
  useReopenReview,
  useReview,
  useReviewComments,
  useTeam,
  useTeamLabels,
  useTeamMembers,
} from "@/hooks/useTeams";
import { getAvatarUrl } from "@/lib/utils";

export default function ReviewDetailPage() {
  return (
    <RouteGuard>
      <ReviewDetailContent />
    </RouteGuard>
  );
}

function ReviewDetailContent() {
  const { teamSlug, reviewId } = useParams<{ teamSlug: string; reviewId: string }>();
  const { profile: user } = useMe();

  const { data: team, isLoading: teamLoading } = useTeam(teamSlug);
  const { data: review, isLoading: reviewLoading, isError } = useReview(teamSlug, reviewId);
  const { data: comments, isLoading: commentsLoading } = useReviewComments(teamSlug, reviewId);
  useMyMembership(teamSlug);
  const { data: teamLabels } = useTeamLabels(teamSlug);
  const { data: teamMembers } = useTeamMembers(teamSlug);

  const [commentText, setCommentText] = useState("");
  const { mutate: createComment, isPending: commentPending } = useCreateComment(teamSlug, reviewId);
  const { mutate: approveReview, isPending: approvePending } = useApproveReview(teamSlug, reviewId);
  const { mutate: closeReview, isPending: closePending } = useCloseReview(teamSlug, reviewId);
  const { mutate: reopenReview, isPending: reopenPending } = useReopenReview(teamSlug, reviewId);
  const { mutate: editReview, isPending: editReviewPending } = useEditReview(teamSlug, reviewId);

  const { mutate: editComment } = useEditComment(teamSlug, reviewId);
  const { mutate: deleteComment } = useDeleteComment(teamSlug, reviewId);

  const { mutate: addAssignee } = useAddReviewAssignee(teamSlug, reviewId);
  const { mutate: removeAssignee } = useRemoveReviewAssignee(teamSlug, reviewId);
  const { mutate: addLabel } = useAddReviewLabel(teamSlug, reviewId);
  const { mutate: removeLabel } = useRemoveReviewLabel(teamSlug, reviewId);
  const { mutate: createLabel } = useCreateTeamLabel(teamSlug);

  const canApprove = usePermission(`teams.approve_review:${team?.id}`);
  const canClose = usePermission(`teams.close_review:${team?.id}`);
  const isLead = usePermission(`teams.manage:${team?.id}`);
  const isOpen = review?.status === "open";
  const isAuthor = user?.id === review?.author.id;
  const canEditReview = isAuthor || isLead;

  // Review Edit State
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Comment Edit State
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState("");

  // Label Creation State
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("#3b82f6");

  // Timeline Merger
  const timeline = useMemo(() => {
    if (!review || !comments) return [];
    const events = (review.events || []).map((e) => ({ ...e, type: "event" }));
    const cmts = comments.map((c) => ({ ...c, type: "comment" }));
    return [...events, ...cmts].sort(
      (a, b) => new Date(a.createdAt || "").getTime() - new Date(b.createdAt || "").getTime()
    );
  }, [review, comments]);

  function handleComment(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!commentText.trim()) return;
    const text = commentText.trim();
    setCommentText(""); // Clear immediately for instant UX
    createComment({ text });
  }

  function handleSaveReview() {
    if (!editTitle.trim() || !editDescription.trim()) return;
    editReview(
      { title: editTitle.trim(), description: editDescription.trim() },
      { onSuccess: () => setIsEditingReview(false) }
    );
  }

  function handleSaveComment(commentId: string) {
    if (!editCommentText.trim()) return;
    editComment(
      { commentId, text: editCommentText.trim() },
      { onSuccess: () => setEditingCommentId(null) }
    );
  }

  if (reviewLoading || teamLoading) {
    return (
      <DashboardShell>
        <div className="w-full max-w-none space-y-6 pb-20">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-20 w-full" />
        </div>
      </DashboardShell>
    );
  }

  if (isError || !review) {
    return (
      <DashboardShell>
        <div className="flex flex-col items-center justify-center py-24 border border-grey-200 bg-white text-center">
          <p className="font-mono text-sm text-text-tertiary">Review not found.</p>
          <Link
            href={`/teams/${teamSlug}?tab=reviews`}
            className="mt-4 font-mono text-sm font-medium text-text-muted hover:text-text-primary transition-colors"
          >
            ← Back to Reviews
          </Link>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="w-full max-w-none space-y-6 pb-20">
        <Link
          href={`/teams/${teamSlug}?tab=reviews`}
          className="inline-flex items-center gap-2 font-mono text-sm font-medium text-text-muted transition-colors hover:text-text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Reviews
        </Link>

        {/* Header */}
        <div className="border-b border-grey-200 pb-8">
          <div className="flex flex-wrap items-center gap-3">
            <Badge
              variant="outline"
              className={`font-mono text-[10px] uppercase tracking-widest border-0 ${review.status === "open" ? "bg-zinc-900 text-white" : review.status === "approved" ? "bg-zinc-600 text-white" : "bg-zinc-400 text-white"}`}
            >
              {review.status}
            </Badge>
            {review.labels?.map((label: any) => (
              <span
                key={label.id}
                className="font-mono text-xs px-2 py-0.5 border text-text-secondary"
                style={{ borderColor: label.color, backgroundColor: `${label.color}15` }}
              >
                {label.name}
              </span>
            ))}
          </div>

          <div className="mt-3 flex items-start justify-between">
            <h1 className="font-sans text-3xl font-bold text-text-primary">
              {review.title}{" "}
              <span className="font-mono text-text-muted font-normal">
                #{review.id.slice(0, 8)}
              </span>
            </h1>
            {canEditReview && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditTitle(review.title);
                  setEditDescription(review.description);
                  setIsEditingReview(true);
                }}
                className="font-mono text-xs font-medium"
              >
                <Pencil className="h-3 w-3 mr-2" /> Edit
              </Button>
            )}
          </div>

          <div className="mt-4 flex items-center gap-3">
            <Image
              src={getAvatarUrl(review.author.profilePictureUrl, review.author.fullName)}
              alt={review.author.fullName}
              width={24}
              height={24}
              className="h-6 w-6 border border-grey-200 object-cover"
            />
            <p className="font-mono text-xs text-text-tertiary">
              <span className="font-bold text-text-primary">{review.author.fullName}</span>{" "}
              <span className="text-text-muted">·</span>{" "}
              <span className="text-text-muted">
                {new Date(review.createdAt).toLocaleDateString()}
              </span>
            </p>
          </div>

          {review.assignees && review.assignees.length > 0 && (
            <div className="hidden lg:flex items-center gap-2 mt-3">
              <span className="font-mono text-xs font-medium text-text-muted">Reviewers</span>
              <div className="flex items-center">
                {review.assignees.slice(0, 3).map((assignee: any, i: number) => (
                  <Image
                    key={assignee.id}
                    src={getAvatarUrl(assignee.profilePictureUrl, assignee.fullName)}
                    alt={assignee.fullName}
                    title={assignee.fullName}
                    width={20}
                    height={20}
                    className="h-5 w-5 border border-white object-cover"
                    style={{ marginLeft: i > 0 ? "-6px" : 0, zIndex: 3 - i }}
                  />
                ))}
                {review.assignees.length > 3 && (
                  <span
                    className="flex h-5 min-w-5 items-center justify-center bg-zinc-800 border border-white font-mono text-[9px] font-bold text-white px-1"
                    style={{ marginLeft: "-6px" }}
                  >
                    +{review.assignees.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Discussion */}
          <div className="lg:col-span-3 space-y-8">
            {/* Description Card */}
            {isEditingReview ? (
              <div className="border border-grey-200 bg-white p-4 space-y-4">
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full font-sans text-lg font-bold border border-grey-200 p-2 outline-none"
                  placeholder="Review Title"
                />
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={6}
                  className="w-full font-mono text-sm border border-grey-200 p-2 outline-none resize-none"
                  placeholder="Description"
                />
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" size="sm" onClick={() => setIsEditingReview(false)}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveReview}
                    disabled={editReviewPending}
                    className="bg-grey-900"
                  >
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border border-grey-200 bg-white">
                <div className="bg-grey-50 px-5 py-3 border-b border-grey-200 flex items-center justify-between">
                  <span className="font-mono text-sm font-bold text-text-tertiary">
                    Initial Contribution
                  </span>
                </div>
                <div className="p-6">
                  <p className="font-mono text-sm leading-relaxed text-text-primary whitespace-pre-wrap">
                    {review.description}
                  </p>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="space-y-6 relative before:absolute before:left-4 before:top-0 before:bottom-0 before:w-px before:bg-grey-200">
              {commentsLoading ? (
                <div className="pl-12 space-y-4">
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : timeline.length === 0 ? (
                <div className="pl-12 flex flex-col items-start gap-1 py-6">
                  <p className="font-sans font-bold text-text-primary text-sm">No activity yet</p>
                  <p className="font-mono text-xs text-text-muted">
                    Comments and status changes will appear here.
                  </p>
                </div>
              ) : (
                timeline.map((item: any) => {
                  if (item.type === "event") {
                    let icon = <Activity className="h-3 w-3 text-text-muted" />;
                    let text = "";
                    if (item.eventType === "status_changed") {
                      icon =
                        item.context.to === "approved" ? (
                          <CheckCircle2 className="h-3 w-3 text-info-500" />
                        ) : (
                          <Circle className="h-3 w-3 text-text-muted" />
                        );
                      text = `changed status to ${item.context.to}`;
                    } else if (item.eventType === "assigned") {
                      icon = <Users className="h-3 w-3 text-success-500" />;
                      text = `assigned ${item.context.username}`;
                    } else if (item.eventType === "unassigned") {
                      icon = <Users className="h-3 w-3 text-text-muted" />;
                      text = `unassigned ${item.context.username}`;
                    } else if (item.eventType === "labeled") {
                      icon = <Tag className="h-3 w-3" style={{ color: item.context.color }} />;
                      text = `added ${item.context.label} label`;
                    } else if (item.eventType === "unlabeled") {
                      icon = <Tag className="h-3 w-3 text-text-muted" />;
                      text = `removed ${item.context.label} label`;
                    } else if (item.eventType === "review_edited") {
                      icon = <Pencil className="h-3 w-3 text-text-muted" />;
                      text = `edited the review`;
                    }
                    return (
                      <div key={item.id} className="relative pl-12 py-1 flex items-center gap-3">
                        <div className="absolute left-[8px] top-1/2 -translate-y-1/2 h-4 w-4 bg-white border border-grey-200 rounded-full flex items-center justify-center z-10">
                          {icon}
                        </div>
                        <Image
                          src={getAvatarUrl(item.actor.profilePictureUrl, item.actor.fullName)}
                          alt=""
                          width={20}
                          height={20}
                          className="h-5 w-5 rounded-none border border-grey-200 object-cover"
                        />
                        <p className="font-mono text-[10px] text-text-tertiary">
                          <span className="font-bold text-text-primary">{item.actor.fullName}</span>{" "}
                          {text}{" "}
                          <span className="text-text-muted ml-1">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </p>
                      </div>
                    );
                  }

                  // Comment
                  const isOptimistic = (item as any)._optimistic;
                  const isCommentAuthor = !isOptimistic && user?.id === item.author?.id;
                  const isEditing = editingCommentId === item.id;

                  return (
                    <div key={item.id} className="relative pl-12">
                      <div className="absolute left-0 top-0">
                        <Image
                          src={getAvatarUrl(
                            item.author?.profilePictureUrl ?? null,
                            item.author?.fullName ?? "…"
                          )}
                          alt=""
                          width={32}
                          height={32}
                          className="h-8 w-8 border border-grey-200 object-cover bg-white"
                        />
                      </div>
                      <div
                        className={`border border-grey-200 bg-white shadow-sm group ${isOptimistic ? "opacity-60" : ""}`}
                      >
                        <div className="bg-grey-50 px-4 py-2 border-b border-grey-200 flex items-center justify-between">
                          <div className="flex gap-2 items-center">
                            <span className="font-mono text-[10px] font-bold text-text-primary">
                              {isOptimistic ? "Sending…" : item.author?.fullName}
                            </span>
                            <span className="font-mono text-[9px] text-text-muted">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                            {item.isEdited && (
                              <span className="font-mono text-[9px] text-text-muted">(edited)</span>
                            )}
                          </div>
                          {(isCommentAuthor || isLead) && !isEditing && !isOptimistic && (
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <MoreVertical className="h-3 w-3" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent align="end" className="w-32 p-1">
                                {isCommentAuthor && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start text-xs font-mono"
                                    onClick={() => {
                                      setEditingCommentId(item.id);
                                      setEditCommentText(item.text);
                                    }}
                                  >
                                    <Pencil className="h-3 w-3 mr-2" /> Edit
                                  </Button>
                                )}
                                <ConfirmModal
                                  title="Delete Comment"
                                  description="Are you sure you want to delete this comment? This action cannot be undone."
                                  confirmText="Delete"
                                  onConfirm={() => deleteComment(item.id)}
                                >
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start text-xs font-mono text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-3 w-3 mr-2" /> Delete
                                  </Button>
                                </ConfirmModal>
                              </PopoverContent>
                            </Popover>
                          )}
                        </div>
                        <div className="p-4">
                          {isEditing ? (
                            <div className="space-y-3">
                              <textarea
                                value={editCommentText}
                                onChange={(e) => setEditCommentText(e.target.value)}
                                rows={3}
                                className="w-full font-mono text-xs border border-grey-200 p-2 outline-none resize-none"
                              />
                              <div className="flex gap-2 justify-end">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 text-[10px]"
                                  onClick={() => {
                                    setEditCommentText(item.text);
                                    setEditingCommentId(null);
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  size="sm"
                                  className="h-6 text-[10px] bg-grey-900"
                                  disabled={!editCommentText.trim()}
                                  onClick={() => handleSaveComment(item.id)}
                                >
                                  Save
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p className="font-mono text-xs text-text-secondary whitespace-pre-wrap">
                              {item.text}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Add Comment */}
              <div className="relative pl-12 mt-6">
                <div className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center border border-dashed border-grey-200 bg-grey-50 z-10">
                  <MessageSquare className="h-4 w-4 text-text-muted" />
                </div>
                <div className="border border-grey-200 bg-white shadow-sm">
                  <form onSubmit={handleComment}>
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add a comment..."
                      rows={4}
                      className="block w-full border-0 p-4 font-mono text-xs text-text-primary outline-none rounded-none placeholder:text-text-muted focus:ring-0 resize-none"
                    />
                    <div className="flex items-center justify-between border-t border-grey-100 bg-grey-50/50 p-3">
                      <span className="font-mono text-[10px] text-text-muted">
                        {commentText.length} characters
                      </span>
                      <Button
                        type="submit"
                        disabled={commentPending || !commentText.trim()}
                        className="h-8 bg-grey-900 px-4 font-mono text-xs font-medium"
                      >
                        {commentPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Comment"}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-0">
            {/* Assignees */}
            <div className="pb-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-sans text-sm font-bold text-text-muted">Reviewers</h3>
                {canEditReview && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-5 w-5 text-text-muted">
                        <Pencil className="h-3 w-3" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-56 p-2">
                      <div className="font-mono text-xs font-bold text-text-tertiary mb-2 px-2">
                        Assign members
                      </div>
                      {teamMembers?.map((m) => {
                        const isAssigned = review.assignees?.some((a: any) => a.id === m.user.id);
                        return (
                          <button
                            type="button"
                            key={m.id}
                            className="w-full flex items-center justify-between p-2 hover:bg-grey-50 cursor-pointer"
                            onClick={() =>
                              isAssigned ? removeAssignee(m.user.id) : addAssignee(m.user.id)
                            }
                          >
                            <div className="flex items-center gap-2">
                              <Image
                                src={getAvatarUrl(m.user.profilePictureUrl, m.user.fullName)}
                                alt=""
                                width={16}
                                height={16}
                                className="h-4 w-4 rounded-none border border-grey-200 object-cover"
                              />
                              <span className="font-mono text-xs">{m.user.fullName}</span>
                            </div>
                            {isAssigned && <CheckCircle2 className="h-3 w-3 text-text-primary" />}
                          </button>
                        );
                      })}
                    </PopoverContent>
                  </Popover>
                )}
              </div>
              {review.assignees && review.assignees.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {review.assignees.map((user: any) => (
                    <div key={user.id} className="flex items-center gap-2">
                      <Image
                        src={getAvatarUrl(user.profilePictureUrl, user.fullName)}
                        alt=""
                        width={20}
                        height={20}
                        className="h-5 w-5 rounded-none border border-grey-200 object-cover"
                      />
                      <span className="font-mono text-xs text-text-secondary">{user.fullName}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="font-mono text-xs text-text-muted">No reviewers assigned yet.</p>
              )}
            </div>

            <Separator />

            {/* Labels */}
            <div className="py-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-sans text-sm font-bold text-text-muted">Labels</h3>
                {canEditReview && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-5 w-5 text-text-muted">
                        <Pencil className="h-3 w-3" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-56 p-2">
                      <div className="font-mono text-xs font-bold text-text-tertiary mb-2 px-2">
                        Apply labels
                      </div>
                      {teamLabels?.map((label) => {
                        const hasLabel = review.labels?.some((l: any) => l.id === label.id);
                        return (
                          <button
                            type="button"
                            key={label.id}
                            className="w-full flex items-center justify-between p-2 hover:bg-grey-50 cursor-pointer"
                            onClick={() => (hasLabel ? removeLabel(label.id) : addLabel(label.id))}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: label.color }}
                              />
                              <span className="font-mono text-xs">{label.name}</span>
                            </div>
                            {hasLabel && <CheckCircle2 className="h-3 w-3 text-text-primary" />}
                          </button>
                        );
                      })}
                      {isLead && (
                        <div className="mt-2 pt-2 border-t border-grey-100 space-y-2">
                          <input
                            value={newLabelName}
                            onChange={(e) => setNewLabelName(e.target.value)}
                            placeholder="New label name"
                            className="w-full text-xs font-mono p-1 border"
                          />
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={newLabelColor}
                              onChange={(e) => setNewLabelColor(e.target.value)}
                              className="h-6 w-6 p-0 border-0"
                            />
                            <Button
                              size="sm"
                              className="h-6 w-full text-[10px]"
                              onClick={() => {
                                if (newLabelName) {
                                  createLabel({ name: newLabelName, color: newLabelColor });
                                  setNewLabelName("");
                                }
                              }}
                            >
                              Create
                            </Button>
                          </div>
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                )}
              </div>
              {review.labels && review.labels.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {review.labels.map((label: any) => (
                    <span
                      key={label.id}
                      className="font-mono text-xs px-2 py-0.5 border text-text-secondary flex items-center gap-1"
                      style={{ borderColor: label.color, backgroundColor: `${label.color}15` }}
                    >
                      {label.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="font-mono text-xs text-text-muted">No labels applied.</p>
              )}
            </div>

            <Separator />

            {/* Status */}
            <div className="pt-5">
              <h3 className="font-sans text-sm font-bold text-text-muted mb-3">Status</h3>
              <div className="flex items-center gap-2 mb-4">
                {review.status === "open" ? (
                  <Circle className="h-4 w-4 text-zinc-900" />
                ) : review.status === "approved" ? (
                  <CheckCircle2 className="h-4 w-4 text-zinc-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-text-muted" />
                )}
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-text-primary">
                  {review.status}
                </span>
              </div>
              {isOpen ? (
                <div className="flex flex-col gap-2">
                  {canApprove && (
                    <Button
                      onClick={() => approveReview()}
                      disabled={approvePending}
                      variant="outline"
                      className="w-full justify-start border-0 bg-zinc-900 font-mono text-xs font-medium text-white hover:bg-zinc-800"
                    >
                      <ShieldCheck className="mr-2 h-3.5 w-3.5" /> Approve
                    </Button>
                  )}
                  {canClose && (
                    <ConfirmModal
                      title="Close Review"
                      description="Are you sure you want to close this review? You can reopen it later if needed."
                      confirmText="Close Review"
                      onConfirm={() => closeReview()}
                      isLoading={closePending}
                    >
                      <Button
                        disabled={closePending}
                        variant="ghost"
                        className="w-full justify-start font-mono text-xs font-medium text-text-tertiary hover:text-red-600 hover:bg-red-50"
                      >
                        <XCircle className="mr-2 h-3.5 w-3.5" /> Close
                      </Button>
                    </ConfirmModal>
                  )}
                </div>
              ) : (
                canEditReview && (
                  <Button
                    onClick={() => reopenReview()}
                    disabled={reopenPending}
                    variant="outline"
                    className="w-full justify-start font-mono text-xs font-medium"
                  >
                    <CheckCircle2 className="mr-2 h-3.5 w-3.5" /> Reopen Review
                  </Button>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

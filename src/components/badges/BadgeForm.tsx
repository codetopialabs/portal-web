"use client";

import {
  AlertTriangle,
  ArrowLeft,
  Award,
  Eye,
  ImagePlus,
  Plus,
  RefreshCw,
  Save,
  ShieldOff,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import NextImage from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
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
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAwardBadge,
  useBadgeAwards,
  useBadgeCriteria,
  useCreateBadge,
  useDeleteBadge,
  useReconcileBadge,
  useRevokeBadge,
  useUpdateBadge,
} from "@/hooks/useBadges";
import { usePermission } from "@/hooks/usePermission";
import { getAvatarUrl } from "@/lib/utils";
import { BadgesService } from "@/services/badges.service";
import type {
  Badge,
  BadgeCondition,
  BadgeInput,
  BadgeMatch,
  BadgeOperator,
  BadgeRuleGroup,
  CriteriaDefinition,
  MemberLookupResult,
  MemberSummary,
} from "@/types/badges.types";

const OPERATORS: Record<BadgeOperator, string> = {
  eq: "is",
  neq: "is not",
  gte: "at least",
  lte: "at most",
  before: "before",
  after: "after",
};

const uid = () => crypto.randomUUID();
const newCondition = (field = "profile.completion"): BadgeCondition => ({
  id: uid(),
  type: "condition",
  field,
  operator: field === "profile.completion" ? "gte" : "eq",
  value: field === "profile.completion" ? 100 : true,
});
const newGroup = (): BadgeRuleGroup => ({
  id: uid(),
  type: "group",
  logic: "all",
  children: [newCondition()],
});

function optionsFor(def: CriteriaDefinition, catalog: ReturnType<typeof useBadgeCriteria>["data"]) {
  if (def.valueType === "role")
    return catalog?.roles.map((r) => ({ value: r.name, label: r.displayName })) ?? [];
  if (def.valueType === "team")
    return catalog?.teams.map((team) => ({ value: team.slug, label: team.name })) ?? [];
  if (def.valueType === "teamRole") return catalog?.teamRoles ?? [];
  if (def.valueType === "badge")
    return catalog?.badges.map((b) => ({ value: b.slug, label: b.name })) ?? [];
  if (def.valueType === "boolean")
    return [
      { value: "true", label: "Yes" },
      { value: "false", label: "No" },
    ];
  return null;
}

function RuleGroupEditor({
  group,
  onChange,
  definitions,
  catalog,
  depth = 0,
}: {
  group: BadgeRuleGroup;
  onChange: (group: BadgeRuleGroup) => void;
  definitions: CriteriaDefinition[];
  catalog: ReturnType<typeof useBadgeCriteria>["data"];
  depth?: number;
}) {
  const updateChild = (index: number, child: BadgeCondition | BadgeRuleGroup) => {
    const children = [...group.children];
    children[index] = child;
    onChange({ ...group, children });
  };
  const removeChild = (index: number) =>
    onChange({ ...group, children: group.children.filter((_, i) => i !== index) });

  return (
    <div className={depth ? "border-l-2 border-zinc-200 bg-zinc-50 p-4 space-y-3" : "space-y-4"}>
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-mono text-[10px] font-black uppercase tracking-widest text-zinc-400">
          Match
        </span>
        <div className="inline-flex border border-zinc-200 bg-white p-0.5">
          {(["all", "any"] as const).map((logic) => (
            <button
              key={logic}
              type="button"
              onClick={() => onChange({ ...group, logic })}
              className={`h-7 px-4 font-mono text-[10px] font-black uppercase tracking-widest transition-colors ${
                group.logic === logic
                  ? "bg-zinc-950 text-white"
                  : "text-zinc-400 hover:text-zinc-950"
              }`}
            >
              {logic}
            </button>
          ))}
        </div>
        <span className="font-mono text-[10px] text-zinc-400">of the following</span>
      </div>

      <div className="space-y-2">
        {group.children.map((child, index) =>
          child.type === "group" ? (
            <div key={child.id} className="relative">
              <RuleGroupEditor
                group={child}
                onChange={(value) => updateChild(index, value)}
                definitions={definitions}
                catalog={catalog}
                depth={depth + 1}
              />
              <button
                type="button"
                title="Remove group"
                onClick={() => removeChild(index)}
                className="absolute right-3 top-3 text-zinc-300 hover:text-red-500 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <ConditionRow
              key={child.id}
              condition={child}
              definitions={definitions}
              catalog={catalog}
              onChange={(value) => updateChild(index, value)}
              onRemove={() => removeChild(index)}
            />
          )
        )}
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange({ ...group, children: [...group.children, newCondition()] })}
          className="h-8 rounded-none font-mono text-xs"
        >
          <Plus className="h-3 w-3" /> Add condition
        </Button>
        {depth < 2 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onChange({ ...group, children: [...group.children, newGroup()] })}
            className="h-8 rounded-none font-mono text-xs"
          >
            <Plus className="h-3 w-3" /> Add group
          </Button>
        )}
      </div>
    </div>
  );
}

function ConditionRow({
  condition,
  definitions,
  catalog,
  onChange,
  onRemove,
}: {
  condition: BadgeCondition;
  definitions: CriteriaDefinition[];
  catalog: ReturnType<typeof useBadgeCriteria>["data"];
  onChange: (condition: BadgeCondition) => void;
  onRemove: () => void;
}) {
  const def = definitions.find((d) => d.key === condition.field) ?? definitions[0];
  const options = optionsFor(def, catalog);
  const setField = (field: string) => {
    const next = definitions.find((d) => d.key === field) ?? definitions[0];
    const nextOpts = optionsFor(next, catalog);
    onChange({
      ...condition,
      field,
      operator: next.operators[0],
      value: nextOpts?.[0]?.value ?? (next.valueType === "number" ? 1 : ""),
    });
  };

  const selectClass =
    "h-9 border border-zinc-200 bg-white px-3 font-mono text-xs text-zinc-700 outline-none focus:border-zinc-950 hover:border-zinc-400 transition-colors";

  return (
    <div className="grid gap-2 border border-zinc-200 bg-white p-3 md:grid-cols-[1.5fr_0.8fr_1fr_auto] md:items-center">
      <select
        value={condition.field}
        onChange={(e) => setField(e.target.value)}
        className={selectClass}
      >
        {Array.from(new Set(definitions.map((d) => d.category))).map((cat) => (
          <optgroup key={cat} label={cat}>
            {definitions
              .filter((d) => d.category === cat)
              .map((d) => (
                <option key={d.key} value={d.key}>
                  {d.label}
                </option>
              ))}
          </optgroup>
        ))}
      </select>
      <select
        value={condition.operator}
        onChange={(e) => onChange({ ...condition, operator: e.target.value as BadgeOperator })}
        className={selectClass}
      >
        {def.operators.map((op) => (
          <option key={op} value={op}>
            {OPERATORS[op]}
          </option>
        ))}
      </select>
      {options ? (
        <select
          value={String(condition.value)}
          onChange={(e) =>
            onChange({
              ...condition,
              value: def.valueType === "boolean" ? e.target.value === "true" : e.target.value,
            })
          }
          className={selectClass}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <Input
          type={def.valueType === "date" ? "date" : "number"}
          min={def.valueType === "number" ? 0 : undefined}
          value={String(condition.value)}
          onChange={(e) =>
            onChange({
              ...condition,
              value: def.valueType === "number" ? Number(e.target.value) : e.target.value,
            })
          }
          className="h-9 rounded-none font-mono text-xs"
        />
      )}
      <button
        type="button"
        title="Remove"
        onClick={onRemove}
        className="flex h-9 w-9 items-center justify-center text-zinc-300 hover:text-red-500 transition-colors"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ─── Image preview with pending file state ─────────────────────────────────

function ArtworkPreview({ imageUrl, pendingFile }: { imageUrl: string; pendingFile: File | null }) {
  const src = pendingFile ? URL.createObjectURL(pendingFile) : imageUrl;
  if (!src) {
    return <ImagePlus className="h-12 w-12 text-zinc-200" />;
  }
  return <img src={src} alt="Badge preview" className="h-full w-full object-contain p-6" />;
}

// ─── Manual Award Panel ────────────────────────────────────────────────────

function ManualAwardPanel({ slug }: { slug: string }) {
  const award = useAwardBadge();
  const [identifier, setIdentifier] = useState("");
  const [reason, setReason] = useState("");
  const [resolving, setResolving] = useState(false);
  const [resolvedMember, setResolvedMember] = useState<MemberLookupResult | null>(null);

  // Step 1: resolve the typed username/Community ID to a real member and
  // show their profile before anything is actually awarded.
  const handleLookup = async () => {
    if (!identifier.trim() || !reason.trim()) {
      toast.error("Enter a username or Community ID, and a reason.");
      return;
    }
    setResolving(true);
    try {
      const member = await BadgesService.lookupMember(identifier.trim());
      setResolvedMember(member);
    } catch {
      /* axios interceptor already showed the toast */
    } finally {
      setResolving(false);
    }
  };

  // Step 2: admin has seen who it is — actually award it.
  const handleConfirmAward = async () => {
    try {
      await award.mutateAsync({ slug, identifier: identifier.trim(), reason: reason.trim() });
      toast.success("Badge awarded.");
      setIdentifier("");
      setReason("");
      setResolvedMember(null);
    } catch {
      /* axios interceptor already showed the toast */
    }
  };

  return (
    <section className="border border-zinc-200 bg-white p-5">
      <h2 className="font-mono text-[10px] font-black uppercase tracking-widest text-zinc-400">
        Manual award
      </h2>
      <p className="mt-1 font-mono text-xs text-zinc-500">
        Award this badge directly to a member by their username or Community ID.
      </p>
      <div className="mt-4 space-y-3">
        <label htmlFor="award-identifier" className="block space-y-1.5">
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            Username or Community ID
          </span>
          <Input
            id="award-identifier"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="e.g. jane_doe or CC-26-A1B2C3"
            className="h-9 rounded-none font-mono text-xs"
          />
        </label>
        <label htmlFor="award-reason" className="block space-y-1.5">
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            Reason
          </span>
          <Input
            id="award-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Outstanding contribution at hackathon"
            className="h-9 rounded-none font-mono text-xs"
          />
        </label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 rounded-none font-mono text-xs font-bold"
          disabled={resolving}
          onClick={handleLookup}
        >
          <Award className="h-3.5 w-3.5" />
          {resolving ? "Looking up…" : "Award badge"}
        </Button>
      </div>

      {/* Confirmation — shows exactly who this is before the award actually
          submits, since a typo'd identifier could otherwise resolve to the
          wrong person. */}
      <Dialog open={resolvedMember !== null} onOpenChange={(v) => !v && setResolvedMember(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm award</DialogTitle>
            <DialogDescription>Double-check this is the right person.</DialogDescription>
          </DialogHeader>
          {resolvedMember && (
            <div className="border border-zinc-200 bg-zinc-50 p-3">
              <MemberIdentity member={resolvedMember} size={48} />
              <p className="mt-2 truncate font-mono text-[10px] text-zinc-400">
                {resolvedMember.email}
              </p>
              {resolvedMember.primaryRole && (
                <p className="mt-1.5 inline-block bg-zinc-900 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wide text-white">
                  {resolvedMember.primaryRole}
                </p>
              )}
            </div>
          )}
          <p className="font-mono text-[10px] text-zinc-500">
            Reason: <span className="text-zinc-700">{reason}</span>
          </p>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-none font-mono text-xs"
              onClick={() => setResolvedMember(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              className="rounded-none font-mono text-xs font-bold bg-emerald-700 hover:bg-emerald-800"
              onClick={handleConfirmAward}
              disabled={award.isPending}
            >
              {award.isPending ? "Awarding…" : "Confirm — award badge"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

// ─── Member identity — avatar + name linking to their public profile.
// Shared by every badges confirmation surface (manual award, preview
// matches, reconcile, current holders) so they all show the same detail. ──

function MemberIdentity({ member, size = 32 }: { member: MemberSummary; size?: number }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <NextImage
        src={getAvatarUrl(member.profilePictureUrl, member.fullName)}
        alt={member.fullName}
        width={size}
        height={size}
        className="border border-zinc-200 object-cover shrink-0"
      />
      <div className="min-w-0">
        <a
          href={`/@${member.username}`}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-xs font-bold text-zinc-900 hover:underline"
        >
          {member.fullName}
        </a>
        <p className="mt-0.5 truncate font-mono text-[10px] text-zinc-400">
          @{member.username} · {member.communityId}
        </p>
      </div>
    </div>
  );
}

// ─── Match list — shared between "Preview matches" and the Reconcile confirm ──

function MatchList({ count, members }: { count: number; members: BadgeMatch[] }) {
  const shown = members.length;
  return (
    <ul className="mt-2 max-h-64 space-y-2 overflow-y-auto">
      {members.map((m) => (
        <li key={m.id} className="border border-emerald-100 bg-emerald-50 p-2">
          <MemberIdentity member={m} size={28} />
        </li>
      ))}
      {count > shown && (
        <li className="font-mono text-xs italic text-emerald-600">
          +{count - shown} more not shown
        </li>
      )}
    </ul>
  );
}

// ─── Current holders — revoke a badge from a specific member ─────────────────

function CurrentHoldersPanel({ slug }: { slug: string }) {
  const { data: holders = [], isLoading, isError, error } = useBadgeAwards(slug);
  const revoke = useRevokeBadge();
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const startRevoke = (id: string) => {
    setRevokingId(id);
    setReason("");
  };

  const confirmRevoke = async () => {
    if (!revokingId) return;
    try {
      await revoke.mutateAsync({ awardId: revokingId, reason: reason.trim() });
      toast.success("Badge revoked — it's been removed from their profile.");
      setRevokingId(null);
      setReason("");
    } catch {
      /* axios interceptor already showed the toast */
    }
  };

  return (
    <section className="border border-zinc-200 bg-white p-5">
      <h2 className="font-mono text-[10px] font-black uppercase tracking-widest text-zinc-400">
        Current holders
      </h2>
      <p className="mt-1 font-mono text-xs text-zinc-500">
        Members who currently have this badge. Revoking removes it from their dashboard and public
        profile immediately.
      </p>

      <div className="mt-4 space-y-2">
        {isLoading ? (
          <Skeleton className="h-9 w-full rounded-none" />
        ) : isError ? (
          <div className="flex items-start gap-2 border border-red-200 bg-red-50 p-3">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-600" />
            <p className="font-mono text-xs font-bold text-red-700">
              Couldn't load current holders — {(error as Error)?.message || "try refreshing."}
            </p>
          </div>
        ) : holders.length === 0 ? (
          <p className="font-mono text-xs text-zinc-400">Nobody has this badge yet.</p>
        ) : (
          holders.map((holder) => (
            <div key={holder.id} className="border border-zinc-200 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <MemberIdentity member={holder} />
                  <p className="mt-1.5 font-mono text-[10px] text-zinc-400">
                    {holder.source === "manual" ? "Manually awarded" : "Auto-awarded"}
                    {" · "}
                    {new Date(holder.awardedAt).toLocaleDateString()}
                  </p>
                </div>
                {revokingId !== holder.id && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-none font-mono text-xs font-bold text-red-600 border-red-200 hover:bg-red-50 hover:border-red-400"
                    onClick={() => startRevoke(holder.id)}
                  >
                    <ShieldOff className="h-3.5 w-3.5" />
                    Revoke
                  </Button>
                )}
              </div>
              {revokingId === holder.id && (
                <div className="mt-3 space-y-2 border-t border-zinc-100 pt-3">
                  <Input
                    autoFocus
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Reason for revoking (optional, shown in the badge's history)…"
                    className="h-9 rounded-none font-mono text-xs"
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      className="h-8 rounded-none font-mono text-xs font-bold bg-red-600 hover:bg-red-700"
                      onClick={confirmRevoke}
                      disabled={revoke.isPending}
                    >
                      {revoke.isPending ? "Revoking…" : "Confirm revoke"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-none font-mono text-xs"
                      onClick={() => setRevokingId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}

// ─── Main BadgeForm ────────────────────────────────────────────────────────

export function BadgeForm({ badge }: { badge?: Badge }) {
  const router = useRouter();
  const {
    data: catalog,
    isLoading: criteriaLoading,
    isError: criteriaError,
    error,
  } = useBadgeCriteria();
  const create = useCreateBadge();
  const update = useUpdateBadge();
  const deleteBadge = useDeleteBadge();
  const reconcile = useReconcileBadge();
  const canDelete = usePermission("badges.delete");
  const canAward = usePermission("badges.award");
  const canRevoke = usePermission("badges.revoke");

  const [name, setName] = useState(badge?.name ?? "");
  const [description, setDescription] = useState(badge?.description ?? "");
  const [imageUrl, setImageUrl] = useState(badge?.imageUrl ?? "");
  const [status, setStatus] = useState<BadgeInput["status"]>(badge?.status ?? "draft");
  const [criteria, setCriteria] = useState<BadgeRuleGroup>(badge?.criteria ?? newGroup());

  // Holds a pending file — only uploaded when Save is clicked.
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [matchCount, setMatchCount] = useState<number | null>(null);
  const [matchMembers, setMatchMembers] = useState<BadgeMatch[]>([]);
  const [matchLoading, setMatchLoading] = useState(false);

  // Reconcile confirmation — who it's about to award to, fetched before the
  // admin commits, not after.
  const [reconcilePreview, setReconcilePreview] = useState<{
    count: number;
    members: BadgeMatch[];
  } | null>(null);
  const [reconcilePreviewLoading, setReconcilePreviewLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasRequiredFields = Boolean(name.trim() && description.trim() && (imageUrl || pendingFile));
  const hasCriteria = criteria.children.length > 0;
  const criteriaStatus = (error as (Error & { status?: number }) | undefined)?.status;

  // Reconcile runs against what's saved on the server, not this form's live
  // state — surface that distinction so an admin doesn't assume Reconcile
  // just used the rules they're currently looking at.
  const hasUnsavedChanges = Boolean(
    badge &&
      (name !== badge.name ||
        description !== badge.description ||
        imageUrl !== badge.imageUrl ||
        status !== badge.status ||
        pendingFile ||
        JSON.stringify(criteria) !== JSON.stringify(badge.criteria))
  );

  const validateFile = (file: File): boolean => {
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Badge artwork must be 2 MB or smaller.");
      return false;
    }
    if (!["image/png", "image/webp"].includes(file.type)) {
      toast.error("Use a PNG or WebP image.");
      return false;
    }
    return true;
  };

  const selectFile = (file?: File) => {
    if (!file) return;
    if (!validateFile(file)) return;
    // Check aspect ratio before accepting
    const img = new Image();
    img.onload = () => {
      if (img.width !== img.height) {
        toast.error("Badge artwork must be a 1:1 square.");
        return;
      }
      setPendingFile(file);
    };
    img.src = URL.createObjectURL(file);
  };

  const submit = async () => {
    if (!hasRequiredFields) return toast.error("Add a name, description, and badge artwork.");
    if (!hasCriteria) return toast.error("Add at least one badge condition.");

    let finalImageUrl = imageUrl;

    // Upload pending file now — only on save
    if (pendingFile) {
      setUploading(true);
      try {
        finalImageUrl = await BadgesService.uploadArtwork(pendingFile);
        setImageUrl(finalImageUrl);
        setPendingFile(null);
      } catch {
        setUploading(false);
        return; // axios interceptor already showed toast
      }
      setUploading(false);
    }

    const input: BadgeInput = { name, description, imageUrl: finalImageUrl, status, criteria };
    const saved = badge
      ? await update.mutateAsync({ slug: badge.slug, input })
      : await create.mutateAsync(input);
    toast.success(badge ? "Badge updated." : "Badge created.");
    router.push(`/admin/badges/${saved.slug}/edit`);
  };

  const handleDelete = async () => {
    if (!badge) return;
    try {
      await deleteBadge.mutateAsync(badge.slug);
      toast.success("Badge removed.");
      router.push("/admin/badges");
    } catch {
      /* axios interceptor already showed the toast */
    }
  };

  // Step 1: fetch who's about to be awarded, using the badge's *saved*
  // criteria (matches what Reconcile will actually run against), and show
  // it for confirmation instead of running reconcile blind.
  const handleReconcileClick = async () => {
    if (!badge) return;
    setReconcilePreviewLoading(true);
    try {
      const result = await BadgesService.previewSaved(badge.slug);
      setReconcilePreview(result);
    } catch {
      /* axios interceptor already showed the toast */
    } finally {
      setReconcilePreviewLoading(false);
    }
  };

  // Step 2: admin has seen the list and confirmed — actually run it.
  const handleReconcileConfirm = async () => {
    if (!badge) return;
    try {
      const result = await reconcile.mutateAsync(badge.slug);
      toast.success(
        result.awarded === 0
          ? "No new awards — all eligible members already have this badge."
          : `Awarded to ${result.awarded} member${result.awarded === 1 ? "" : "s"}.`
      );
      setReconcilePreview(null);
    } catch {
      /* axios interceptor already showed the toast */
    }
  };

  const handlePreview = async () => {
    if (!hasRequiredFields || !hasCriteria) return;
    setMatchLoading(true);
    try {
      const input: BadgeInput = {
        name,
        description,
        imageUrl: imageUrl || "placeholder",
        status,
        criteria,
      };
      const result = await BadgesService.preview(input);
      setMatchCount(result.count);
      setMatchMembers(result.members);
    } catch {
      /* no-op */
    } finally {
      setMatchLoading(false);
    }
  };

  const isSaving = uploading || create.isPending || update.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/badges"
            className="inline-flex items-center gap-1.5 font-mono text-xs text-zinc-400 hover:text-zinc-950 transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Badges
          </Link>
          <h1 className="mt-3 font-sans text-3xl font-black uppercase tracking-widest text-zinc-950">
            {badge ? "Edit badge" : "New badge"}
          </h1>
          {badge && (
            <p className="mt-1 font-mono text-xs text-zinc-400">
              Slug: <span className="text-zinc-600">{badge.slug}</span>
              {" · "}Rule v{badge.criteriaVersion}
              {" · "}
              <span className="font-bold">{badge.awardCount}</span> awarded
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {badge && (
            <>
              {canDelete && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-none font-mono text-xs font-bold text-red-600 border-red-200 hover:bg-red-50 hover:border-red-400"
                  onClick={() => setConfirmDelete(true)}
                  disabled={deleteBadge.isPending}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {badge.awardCount > 0 ? "Archive" : "Delete"}
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 rounded-none font-mono text-xs font-bold"
                onClick={handleReconcileClick}
                disabled={reconcilePreviewLoading}
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${reconcilePreviewLoading ? "animate-spin" : ""}`}
                />
                {reconcilePreviewLoading ? "Checking…" : "Reconcile"}
              </Button>
            </>
          )}
          <Button
            onClick={submit}
            disabled={isSaving}
            className="h-9 rounded-none font-mono text-xs font-bold"
          >
            <Save className="h-3.5 w-3.5" />
            {isSaving ? "Saving…" : "Save badge"}
          </Button>
        </div>
      </div>

      {/* Unsaved-changes note — Reconcile/Preview-saved-criteria run against
          what's on the server, not this form, so make that gap visible
          instead of letting an admin assume Reconcile just used what
          they're looking at. */}
      {hasUnsavedChanges && (
        <div className="flex items-center gap-2 border border-amber-200 bg-amber-50 px-3 py-2">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-600" />
          <p className="font-mono text-[10px] font-bold text-amber-700">
            You have unsaved changes — Reconcile still runs against the last saved rules until you
            Save badge.
          </p>
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="flex items-start gap-4 border border-red-200 bg-red-50 p-5">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          <div className="flex-1">
            <p className="font-mono text-xs font-bold text-red-700">
              {badge && badge.awardCount > 0
                ? `This badge has ${badge.awardCount} award${badge.awardCount === 1 ? "" : "s"}. It will be archived (not deleted), stopping future awards while keeping history intact.`
                : "This badge has no awards and will be permanently deleted."}
            </p>
            <div className="mt-3 flex gap-2">
              <Button
                type="button"
                size="sm"
                className="h-8 rounded-none font-mono text-xs font-bold bg-red-600 hover:bg-red-700"
                onClick={handleDelete}
                disabled={deleteBadge.isPending}
              >
                {deleteBadge.isPending ? "Removing…" : "Confirm"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 rounded-none font-mono text-xs"
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reconcile confirmation — modal, not inline. Reconcile can award to an
          unbounded number of people in one click, unlike Delete or a single
          Revoke, so it gets more deliberate focus than an inline panel the
          admin might not notice if they're scrolled away from the header. */}
      <Dialog
        open={reconcilePreview !== null}
        onOpenChange={(v) => !v && setReconcilePreview(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reconcile this badge</DialogTitle>
            <DialogDescription>
              {reconcilePreview?.count === 0
                ? "Nobody new — every eligible member already has this badge."
                : `This will award the badge to ${reconcilePreview?.count} member${reconcilePreview?.count === 1 ? "" : "s"} who don't have it yet:`}
            </DialogDescription>
          </DialogHeader>
          {hasUnsavedChanges && (
            <div className="flex items-center gap-2 border border-amber-200 bg-amber-50 px-3 py-2">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-600" />
              <p className="font-mono text-[10px] font-bold text-amber-700">
                This matches the last saved rules — your unsaved edits aren't reflected here.
              </p>
            </div>
          )}
          {reconcilePreview && reconcilePreview.count > 0 && (
            <MatchList count={reconcilePreview.count} members={reconcilePreview.members} />
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-none font-mono text-xs"
              onClick={() => setReconcilePreview(null)}
            >
              {reconcilePreview && reconcilePreview.count > 0 ? "Cancel" : "Close"}
            </Button>
            {reconcilePreview && reconcilePreview.count > 0 && (
              <Button
                type="button"
                size="sm"
                className="rounded-none font-mono text-xs font-bold bg-emerald-700 hover:bg-emerald-800"
                onClick={handleReconcileConfirm}
                disabled={reconcile.isPending}
              >
                {reconcile.isPending ? "Awarding…" : "Confirm — award badge"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px] items-start">
        {/* Left column */}
        <div className="space-y-6">
          {/* Badge identity */}
          <section className="border border-zinc-200 bg-white">
            <div className="border-b border-zinc-100 px-5 py-3">
              <h2 className="font-mono text-[10px] font-black uppercase tracking-widest text-zinc-400">
                Badge identity
              </h2>
            </div>
            <div className="p-5 grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                  Name
                </Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Community Builder"
                  className="h-9 rounded-none font-mono text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                  Status
                </Label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as BadgeInput["status"])}
                  className="h-9 w-full border border-zinc-200 bg-white px-3 font-mono text-xs text-zinc-700 outline-none focus:border-zinc-950"
                >
                  <option value="draft">Draft — not yet awarded</option>
                  <option value="active">Active — awarding enabled</option>
                  <option value="archived">Archived — stopped</option>
                </select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                  Description
                </Label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full border border-zinc-200 bg-white p-3 font-mono text-xs text-zinc-700 outline-none focus:border-zinc-950 resize-none"
                  placeholder="What does this badge recognise?"
                />
              </div>
            </div>
          </section>

          {/* Award criteria */}
          <section className="border border-zinc-200 bg-white">
            <div className="flex items-center justify-between gap-4 border-b border-zinc-100 px-5 py-3">
              <div>
                <h2 className="font-mono text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Award criteria
                </h2>
                <p className="mt-0.5 font-mono text-[10px] text-zinc-400">
                  Combine profile, community, team, and growth signals.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!hasRequiredFields || !hasCriteria || matchLoading}
                onClick={handlePreview}
                className="h-8 rounded-none font-mono text-[10px] font-bold shrink-0"
              >
                <Users className={`h-3.5 w-3.5 ${matchLoading ? "animate-pulse" : ""}`} />
                Preview matches
              </Button>
            </div>

            <Dialog open={matchCount !== null} onOpenChange={(v) => !v && setMatchCount(null)}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Who matches this rule</DialogTitle>
                  <DialogDescription>
                    {matchCount} existing member{matchCount === 1 ? "" : "s"} currently match this
                    rule.
                  </DialogDescription>
                </DialogHeader>
                {matchCount !== null && matchCount > 0 && (
                  <MatchList count={matchCount} members={matchMembers} />
                )}
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-none font-mono text-xs"
                    onClick={() => setMatchCount(null)}
                  >
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <div className="p-5">
              {criteriaLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-9 w-full rounded-none" />
                  <Skeleton className="h-9 w-full rounded-none" />
                  <Skeleton className="h-9 w-3/4 rounded-none" />
                </div>
              ) : criteriaError || !catalog ? (
                <div className="border border-dashed border-zinc-200 p-5 text-center">
                  <Eye className="mx-auto h-6 w-6 text-zinc-200" />
                  <p className="mt-3 font-mono text-xs font-bold text-zinc-600">
                    {criteriaStatus === 403
                      ? "You need badges.view, badges.create, or badges.edit permission to use the criteria builder."
                      : criteriaStatus
                        ? `Criteria builder returned HTTP ${criteriaStatus}. Check backend logs.`
                        : "Unable to load the criteria builder. Is the backend running?"}
                  </p>
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="mt-3 font-mono text-[10px] text-zinc-400 underline hover:text-zinc-950"
                  >
                    Try reloading
                  </button>
                </div>
              ) : (
                <RuleGroupEditor
                  group={criteria}
                  onChange={setCriteria}
                  definitions={catalog.criteria}
                  catalog={catalog}
                />
              )}
            </div>
          </section>

          {/* Manual award — only on edit page for users with badges.award */}
          {badge && canAward && <ManualAwardPanel slug={badge.slug} />}

          {/* Current holders / revoke — only on edit page for users with badges.revoke */}
          {badge && canRevoke && <CurrentHoldersPanel slug={badge.slug} />}
        </div>

        {/* Right column — artwork */}
        <aside className="space-y-5 lg:sticky lg:top-6">
          <section className="border border-zinc-200 bg-white">
            <div className="border-b border-zinc-100 px-5 py-3">
              <h2 className="font-mono text-[10px] font-black uppercase tracking-widest text-zinc-400">
                Artwork
              </h2>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex aspect-square items-center justify-center overflow-hidden border border-dashed border-zinc-200 bg-zinc-50">
                <ArtworkPreview imageUrl={imageUrl} pendingFile={pendingFile} />
              </div>

              {pendingFile && (
                <div className="flex items-center gap-2 border border-amber-200 bg-amber-50 px-3 py-2">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                  <p className="font-mono text-[10px] text-amber-700 font-bold">
                    Image will be uploaded when you save.
                  </p>
                </div>
              )}

              <label className="flex h-9 cursor-pointer items-center justify-center gap-2 border border-zinc-900 bg-zinc-950 font-mono text-[10px] font-black uppercase tracking-widest text-white hover:bg-zinc-800 transition-colors">
                <Upload className="h-3.5 w-3.5" />
                {pendingFile ? "Change artwork" : "Upload artwork"}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/webp"
                  className="sr-only"
                  onChange={(e) => selectFile(e.target.files?.[0])}
                />
              </label>

              <p className="font-mono text-[10px] leading-5 text-zinc-400">
                Square PNG or WebP · 512 × 512 recommended · 2 MB max.
              </p>
            </div>
          </section>

          {/* Dark preview card */}
          <section className="border border-zinc-900 bg-zinc-950 p-5 text-white text-center">
            <p className="font-mono text-[9px] font-black uppercase tracking-widest text-zinc-500">
              Preview
            </p>
            <div className="mx-auto mt-4 flex h-28 w-28 items-center justify-center bg-white/5">
              {pendingFile || imageUrl ? (
                <img
                  src={pendingFile ? URL.createObjectURL(pendingFile) : imageUrl}
                  alt=""
                  className="h-full w-full object-contain p-3"
                />
              ) : (
                <ImagePlus className="h-8 w-8 text-zinc-700" />
              )}
            </div>
            <h3 className="mt-4 font-sans text-lg font-black uppercase tracking-widest">
              {name || "Badge name"}
            </h3>
            <p className="mt-2 font-mono text-[10px] leading-5 text-zinc-400">
              {description || "Badge description will appear here."}
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}

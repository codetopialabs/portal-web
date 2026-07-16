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
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAwardBadge,
  useBadgeCriteria,
  useCreateBadge,
  useDeleteBadge,
  useReconcileBadge,
  useUpdateBadge,
} from "@/hooks/useBadges";
import { usePermission } from "@/hooks/usePermission";
import { BadgesService } from "@/services/badges.service";
import type {
  Badge,
  BadgeCondition,
  BadgeInput,
  BadgeOperator,
  BadgeRuleGroup,
  CriteriaDefinition,
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
  const [userId, setUserId] = useState("");
  const [reason, setReason] = useState("");

  const submit = async () => {
    if (!userId.trim() || !reason.trim()) {
      toast.error("Enter a user ID and reason.");
      return;
    }
    try {
      await award.mutateAsync({ slug, userId: userId.trim(), reason: reason.trim() });
      toast.success("Badge awarded.");
      setUserId("");
      setReason("");
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
        Award this badge directly to a member by their user ID.
      </p>
      <div className="mt-4 space-y-3">
        <label htmlFor="award-user-id" className="block space-y-1.5">
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            User ID
          </span>
          <Input
            id="award-user-id"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
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
          disabled={award.isPending}
          onClick={submit}
        >
          <Award className="h-3.5 w-3.5" />
          {award.isPending ? "Awarding…" : "Award badge"}
        </Button>
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
  const [matchLoading, setMatchLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasRequiredFields = Boolean(name.trim() && description.trim() && (imageUrl || pendingFile));
  const hasCriteria = criteria.children.length > 0;
  const criteriaStatus = (error as (Error & { status?: number }) | undefined)?.status;

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

  const handleReconcile = async () => {
    if (!badge) return;
    try {
      const result = await reconcile.mutateAsync(badge.slug);
      toast.success(
        result.awarded === 0
          ? "No new awards — all eligible members already have this badge."
          : `Awarded to ${result.awarded} member${result.awarded === 1 ? "" : "s"}.`
      );
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
                onClick={handleReconcile}
                disabled={reconcile.isPending}
              >
                <RefreshCw className={`h-3.5 w-3.5 ${reconcile.isPending ? "animate-spin" : ""}`} />
                {reconcile.isPending ? "Running…" : "Reconcile"}
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

            {matchCount !== null && (
              <div className="mx-5 mt-4 border border-emerald-200 bg-emerald-50 px-4 py-3 font-mono text-xs font-bold text-emerald-700">
                {matchCount} existing member{matchCount === 1 ? "" : "s"} currently match this rule.
              </div>
            )}

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

"use client";

import { ArrowLeft, Loader2, Plus, Save, Search, Trophy, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useCommunityMembers } from "@/hooks/useCommunityMembers";
import {
  useCreateRecognition,
  useRecognitionCategories,
  useUpdateRecognition,
} from "@/hooks/useRecognitions";
import { getAvatarUrl } from "@/lib/utils";
import type { CommunityMember } from "@/services/user.service";
import type { Recognition, RecognitionCategory } from "@/types/recognitions.types";

const labelCls = "font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-400";
const inputCls =
  "h-9 w-full rounded-none border-zinc-200 bg-white px-3 font-mono text-xs text-zinc-700 shadow-none outline-none focus:border-zinc-950";
const textareaCls =
  "w-full resize-none border border-zinc-200 bg-white p-3 font-mono text-xs text-zinc-700 outline-none focus:border-zinc-950";

/** Picks the honoree. Only shown when creating — a published entry is about
 *  one member, and moving it would rewrite what people already read. */
function MemberPicker({
  selected,
  onSelect,
}: {
  selected: CommunityMember | null;
  onSelect: (member: CommunityMember | null) => void;
}) {
  const [search, setSearch] = useState("");
  const { data: members = [], isLoading } = useCommunityMembers(search.trim() || undefined, {
    excludeFlagged: true,
  });

  if (selected) {
    return (
      <div className="flex items-center gap-3 border border-zinc-200 bg-white px-3 py-2.5">
        {/* biome-ignore lint/performance/noImgElement: avatar URL from API */}
        <img
          src={getAvatarUrl(selected.profilePictureUrl, selected.fullName)}
          alt={selected.fullName}
          className="h-8 w-8 shrink-0 border border-zinc-200 object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-sans text-sm font-bold text-zinc-950">{selected.fullName}</p>
          <p className="truncate font-mono text-[11px] text-zinc-400">
            @{selected.username}
            {selected.primaryRole ? ` · ${selected.primaryRole}` : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onSelect(null)}
          className="shrink-0 font-mono text-[11px] text-zinc-400 hover:text-zinc-900"
        >
          Change
        </button>
      </div>
    );
  }

  return (
    <div className="border border-zinc-200 bg-white">
      <div className="relative border-b border-zinc-100">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search members by name or username…"
          className="h-9 rounded-none border-0 bg-transparent pl-9 font-mono text-xs shadow-none focus-visible:ring-0"
        />
      </div>
      <div className="max-h-56 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-2 p-3">
            <Skeleton className="h-8 w-full rounded-none" />
            <Skeleton className="h-8 w-full rounded-none" />
          </div>
        ) : members.length === 0 ? (
          <p className="px-3 py-6 text-center font-mono text-[11px] text-zinc-400">
            No members match that search.
          </p>
        ) : (
          members.slice(0, 25).map((member) => (
            <button
              key={member.id}
              type="button"
              onClick={() => onSelect(member)}
              className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-zinc-50"
            >
              {/* biome-ignore lint/performance/noImgElement: avatar URL from API */}
              <img
                src={getAvatarUrl(member.profilePictureUrl, member.fullName)}
                alt={member.fullName}
                className="h-7 w-7 shrink-0 border border-zinc-200 object-cover"
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-sans text-xs font-bold text-zinc-950">
                  {member.fullName}
                </span>
                <span className="block truncate font-mono text-[10px] text-zinc-400">
                  @{member.username}
                  {member.primaryRole ? ` · ${member.primaryRole}` : ""}
                </span>
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

export function RecognitionForm({ editing }: { editing?: Recognition }) {
  const router = useRouter();
  const isEdit = Boolean(editing);
  const create = useCreateRecognition();
  const update = useUpdateRecognition();
  const { data: categories = [] } = useRecognitionCategories();

  const [member, setMember] = useState<CommunityMember | null>(null);
  const [category, setCategory] = useState<RecognitionCategory>(editing?.category ?? "member");
  const [awardName, setAwardName] = useState(editing?.awardName ?? "");
  const [period, setPeriod] = useState(editing?.period ?? "");
  const [periodStart, setPeriodStart] = useState(editing?.periodStart ?? "");
  const [impactSummary, setImpactSummary] = useState(editing?.impactSummary ?? "");
  // Kept as {id, text} rather than a bare string[] so the list survives
  // duplicate wording without React reusing the wrong row.
  const [achievements, setAchievements] = useState<Array<{ id: string; text: string }>>(() =>
    (editing?.achievements ?? []).map((text) => ({ id: crypto.randomUUID(), text }))
  );
  const [achievementDraft, setAchievementDraft] = useState("");
  const [domain, setDomain] = useState(editing?.domain ?? "");
  const [roleLabel, setRoleLabel] = useState(editing?.roleLabel ?? "");
  const [featuredRank, setFeaturedRank] = useState(
    editing?.featuredRank != null ? String(editing.featuredRank) : ""
  );

  const isSaving = create.isPending || update.isPending;
  const canSave =
    Boolean(awardName.trim()) &&
    Boolean(period.trim()) &&
    Boolean(impactSummary.trim()) &&
    (isEdit || Boolean(member));

  function addAchievement() {
    const value = achievementDraft.trim();
    if (!value) return;
    setAchievements((prev) => [...prev, { id: crypto.randomUUID(), text: value }]);
    setAchievementDraft("");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSave) return;

    const payload = {
      category,
      awardName: awardName.trim(),
      period: period.trim(),
      periodStart: periodStart || null,
      impactSummary: impactSummary.trim(),
      achievements: achievements.map((entry) => entry.text),
      domain: domain.trim(),
      roleLabel: roleLabel.trim(),
      featuredRank: featuredRank.trim() ? Number(featuredRank) : null,
    };

    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, data: payload });
        toast.success("Recognition updated.");
      } else {
        await create.mutateAsync({ ...payload, username: member?.username });
        toast.success("Draft created. It goes live once a lead publishes it.");
      }
      router.push("/admin/recognitions");
    } catch {
      // Axios interceptor already surfaces the error toast.
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl pb-10">
      <Link
        href="/admin/recognitions"
        className="mb-6 inline-flex items-center gap-2 font-mono text-xs text-zinc-400 transition-colors hover:text-zinc-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Wall of Impact
      </Link>

      <header className="mb-6">
        <div className="mb-1 flex items-center gap-2">
          <Trophy className="h-3.5 w-3.5 text-zinc-400" />
          <p className="font-mono text-xs font-medium text-zinc-400">Admin · Community</p>
        </div>
        <h1 className="font-sans text-4xl font-bold tracking-tight text-zinc-950">
          {isEdit ? "Edit Recognition" : "New Recognition"}
        </h1>
        <p className="mt-1.5 font-mono text-xs text-zinc-400">
          {isEdit
            ? "Changes to a published entry are live as soon as you save."
            : "Saves as a draft. A Community Lead publishes it to the wall."}
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Honoree */}
        <section className="border border-zinc-200 bg-white">
          <div className="border-b border-zinc-100 px-5 py-3">
            <h2 className="font-mono text-[10px] font-black uppercase tracking-widest text-zinc-400">
              Honoree
            </h2>
          </div>
          <div className="p-5">
            {isEdit ? (
              <div className="flex items-center gap-3">
                {/* biome-ignore lint/performance/noImgElement: avatar URL from API */}
                <img
                  src={getAvatarUrl(editing?.profilePictureUrl ?? null, editing?.fullName ?? "")}
                  alt={editing?.fullName ?? ""}
                  className="h-8 w-8 shrink-0 border border-zinc-200 object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate font-sans text-sm font-bold text-zinc-950">
                    {editing?.fullName}
                  </p>
                  <p className="truncate font-mono text-[11px] text-zinc-400">
                    @{editing?.username} · can't be reassigned
                  </p>
                </div>
              </div>
            ) : (
              <MemberPicker selected={member} onSelect={setMember} />
            )}
          </div>
        </section>

        {/* The award */}
        <section className="border border-zinc-200 bg-white">
          <div className="border-b border-zinc-100 px-5 py-3">
            <h2 className="font-mono text-[10px] font-black uppercase tracking-widest text-zinc-400">
              The award
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className={labelCls}>Award name</Label>
              <Input
                value={awardName}
                onChange={(e) => setAwardName(e.target.value)}
                placeholder="Member of the Month"
                className={inputCls}
              />
            </div>

            <div className="space-y-1.5">
              <Label className={labelCls}>Category</Label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as RecognitionCategory)}
                className="h-9 w-full border border-zinc-200 bg-white px-3 font-mono text-xs text-zinc-700 outline-none focus:border-zinc-950"
              >
                {categories.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className={labelCls}>Period</Label>
              <Input
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                placeholder="January 2026"
                className={inputCls}
              />
              <p className="font-mono text-[10px] text-zinc-400">Shown on the card as written.</p>
            </div>

            <div className="space-y-1.5">
              <Label className={labelCls}>Period start</Label>
              <Input
                type="date"
                value={periodStart ?? ""}
                onChange={(e) => setPeriodStart(e.target.value)}
                className={inputCls}
              />
              <p className="font-mono text-[10px] text-zinc-400">
                Optional. Used for monthly reporting, never displayed.
              </p>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label className={labelCls}>Impact summary</Label>
              <textarea
                value={impactSummary}
                onChange={(e) => setImpactSummary(e.target.value)}
                rows={4}
                placeholder="What did they actually do, and why did it matter?"
                className={textareaCls}
              />
            </div>

            <div className="space-y-1.5">
              <Label className={labelCls}>Domain</Label>
              <Input
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="Learning, Events, Open Source…"
                className={inputCls}
              />
              <p className="font-mono text-[10px] text-zinc-400">
                Shown in place of the category label on Domain Specific awards.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className={labelCls}>Featured rank</Label>
              <Input
                type="number"
                min={1}
                value={featuredRank}
                onChange={(e) => setFeaturedRank(e.target.value)}
                placeholder="—"
                className={inputCls}
              />
              <p className="font-mono text-[10px] text-zinc-400">
                Lower sorts first on the wall. Blank sits after every ranked entry.
              </p>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label className={labelCls}>Role label</Label>
              <Input
                value={roleLabel}
                onChange={(e) => setRoleLabel(e.target.value)}
                placeholder="Leave blank to snapshot their role on publish"
                className={inputCls}
              />
              <p className="font-mono text-[10px] text-zinc-400">
                Left blank, publishing records whatever their primary public role is at that moment
                — it won't change afterwards if they're promoted.
              </p>
            </div>
          </div>
        </section>

        {/* Achievements */}
        <section className="border border-zinc-200 bg-white">
          <div className="border-b border-zinc-100 px-5 py-3">
            <h2 className="font-mono text-[10px] font-black uppercase tracking-widest text-zinc-400">
              Achievements
            </h2>
            <p className="mt-0.5 font-mono text-[10px] text-zinc-400">
              Listed as bullets under the citation.
            </p>
          </div>
          <div className="space-y-3 p-5">
            {achievements.length > 0 && (
              <ul className="space-y-2">
                {achievements.map((achievement) => (
                  <li
                    key={achievement.id}
                    className="flex items-start gap-3 border border-dashed border-zinc-200 px-3 py-2"
                  >
                    <span className="flex-1 font-mono text-xs leading-5 text-zinc-600">
                      {achievement.text}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setAchievements((prev) => prev.filter((e) => e.id !== achievement.id))
                      }
                      className="mt-0.5 shrink-0 text-zinc-300 transition-colors hover:text-red-600"
                      aria-label="Remove achievement"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex gap-2">
              <Input
                value={achievementDraft}
                onChange={(e) => setAchievementDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addAchievement();
                  }
                }}
                placeholder="Ran 4 sessions with 120 attendees"
                className={inputCls}
              />
              <Button
                type="button"
                variant="outline"
                onClick={addAchievement}
                disabled={!achievementDraft.trim()}
                className="h-9 shrink-0 rounded-none font-mono text-[10px] font-bold"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </Button>
            </div>
          </div>
        </section>

        <div className="flex items-center justify-end gap-3">
          <Link
            href="/admin/recognitions"
            className="font-mono text-xs text-zinc-400 transition-colors hover:text-zinc-900"
          >
            Cancel
          </Link>
          <Button
            type="submit"
            disabled={!canSave || isSaving}
            className="h-9 rounded-none bg-zinc-950 font-mono text-xs font-medium text-white hover:bg-zinc-800 disabled:opacity-40"
          >
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            {isEdit ? "Save Changes" : "Save Draft"}
          </Button>
        </div>
      </form>
    </div>
  );
}

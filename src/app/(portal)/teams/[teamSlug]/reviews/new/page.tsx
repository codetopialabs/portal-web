"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { DashboardShell } from "@/components/dashboard/Shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateReview, useTeam } from "@/hooks/useTeams";

export default function CreateReviewPage() {
  return (
    <RouteGuard>
      <CreateReviewContent />
    </RouteGuard>
  );
}

function CreateReviewContent() {
  const { teamSlug } = useParams<{ teamSlug: string }>();
  const router = useRouter();
  const { data: team } = useTeam(teamSlug);

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    workedOn: "",
    challenges: "",
    links: "",
  });
  const { mutate: createReview, isPending: createPending } = useCreateReview(teamSlug);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.title.trim() || !formData.workedOn.trim()) return;

    const description = `### What I worked on
${formData.workedOn.trim()}

### Challenges faced
${formData.challenges.trim() || "None"}

### References / Links
${formData.links.trim() || "None"}`;

    createReview(
      {
        title: formData.title.trim(),
        description: description,
        category: formData.category.trim() || undefined,
      },
      {
        onSuccess: () => {
          router.push(`/teams/${teamSlug}?tab=reviews`);
        },
      }
    );
  }

  return (
    <DashboardShell>
      <div className="w-full max-w-3xl space-y-6 pb-20">
        {/* Back */}
        <Link
          href={`/teams/${teamSlug}?tab=reviews`}
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-zinc-400 transition-colors hover:text-zinc-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Reviews
        </Link>

        {/* Header */}
        <div className="border-b border-zinc-200 pb-6">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-zinc-400">
            {team?.name}
          </p>
          <h1 className="mt-2 font-sans text-3xl font-black uppercase tracking-tight text-zinc-950">
            Open a Review
          </h1>
          <p className="mt-2 max-w-2xl font-mono text-sm leading-6 text-zinc-500">
            Provide detailed information about your contribution so the Team Lead can review it
            effectively.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleCreate} className="space-y-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="title"
                className="font-mono text-xs font-bold uppercase tracking-widest text-zinc-900"
              >
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="What did you work on? (e.g. Added User Authentication)"
                className="font-mono text-sm rounded-none border-zinc-300 focus-visible:ring-1 focus-visible:ring-zinc-900 focus-visible:border-zinc-900 h-12"
                required
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="category"
                className="font-mono text-xs font-bold uppercase tracking-widest text-zinc-900"
              >
                Category
              </Label>
              <div className="flex flex-col gap-3">
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g. Frontend, Documentation, Bugfix"
                  className="font-mono text-sm rounded-none border-zinc-300 focus-visible:ring-1 focus-visible:ring-zinc-900 focus-visible:border-zinc-900 h-10"
                />
                <div className="flex flex-wrap gap-2">
                  {["Frontend", "Backend", "Design", "Docs", "Bugfix"].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat })}
                      className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest border transition-colors ${
                        formData.category === cat
                          ? "bg-zinc-900 text-white border-zinc-900"
                          : "bg-zinc-50 text-zinc-500 border-zinc-200 hover:bg-zinc-100 hover:text-zinc-900"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <hr className="border-zinc-100 my-6" />

            <div className="space-y-2">
              <Label
                htmlFor="workedOn"
                className="font-mono text-xs font-bold uppercase tracking-widest text-zinc-900"
              >
                What did you work on? <span className="text-red-500">*</span>
              </Label>
              <p className="font-mono text-[11px] text-zinc-500 mb-2">
                Describe the core problem you solved and your approach.
              </p>
              <textarea
                id="workedOn"
                value={formData.workedOn}
                onChange={(e) => setFormData({ ...formData, workedOn: e.target.value })}
                placeholder="I implemented the new..."
                rows={5}
                className="block w-full border border-zinc-300 bg-white px-4 py-3 font-mono text-sm text-zinc-900 outline-none rounded-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors resize-none"
                required
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="challenges"
                className="font-mono text-xs font-bold uppercase tracking-widest text-zinc-900"
              >
                Challenges Faced
              </Label>
              <p className="font-mono text-[11px] text-zinc-500 mb-2">
                Were there any blockers or difficult decisions made?
              </p>
              <textarea
                id="challenges"
                value={formData.challenges}
                onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
                placeholder="I ran into an issue with..."
                rows={3}
                className="block w-full border border-zinc-300 bg-white px-4 py-3 font-mono text-sm text-zinc-900 outline-none rounded-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="links"
                className="font-mono text-xs font-bold uppercase tracking-widest text-zinc-900"
              >
                References / Links
              </Label>
              <p className="font-mono text-[11px] text-zinc-500 mb-2">
                Links to related issues, PRs, or designs.
              </p>
              <textarea
                id="links"
                value={formData.links}
                onChange={(e) => setFormData({ ...formData, links: e.target.value })}
                placeholder="https://github.com/..."
                rows={2}
                className="block w-full border border-zinc-300 bg-white px-4 py-3 font-mono text-sm text-zinc-900 outline-none rounded-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push(`/teams/${teamSlug}?tab=reviews`)}
              className="h-12 px-6 font-mono text-xs uppercase tracking-widest rounded-none"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createPending || !formData.title.trim() || !formData.workedOn.trim()}
              className="h-12 bg-zinc-900 px-8 font-mono text-xs uppercase tracking-widest hover:bg-zinc-800 rounded-none shadow-sm"
            >
              {createPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Review"
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}

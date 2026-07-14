"use client";

import { GitFork, KeyRound, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useClearGithubToken,
  useGithubTokenStatus,
  useOrgRepos,
  useSaveGithubToken,
  useSetRepoTracked,
} from "@/hooks/useGithubRepos";
import { usePermission } from "@/hooks/usePermission";

function TokenCard({ canManage }: { canManage: boolean }) {
  const { data: status, isLoading } = useGithubTokenStatus();
  const { mutate: saveToken, isPending: isSaving } = useSaveGithubToken();
  const { mutate: clearToken, isPending: isClearing } = useClearGithubToken();
  const [tokenInput, setTokenInput] = useState("");
  const [editing, setEditing] = useState(false);

  function handleSave() {
    if (!tokenInput.trim()) return;
    saveToken(tokenInput.trim(), {
      onSuccess: () => {
        toast.success("GitHub token saved.");
        setTokenInput("");
        setEditing(false);
      },
    });
  }

  function handleClear() {
    clearToken(undefined, {
      onSuccess: () => toast.success("GitHub token removed."),
    });
  }

  return (
    <section className="mb-6 border border-grey-200 bg-white">
      <div className="border-b border-grey-200 bg-grey-50 px-5 py-3">
        <h2 className="flex items-center gap-2 font-sans text-base font-bold text-text-primary">
          <KeyRound className="h-4 w-4" />
          GitHub token
        </h2>
      </div>
      <div className="space-y-4 p-5">
        <p className="font-mono text-xs leading-6 text-text-tertiary">
          Used to fetch commits and merged pull requests from tracked repos for member contribution
          graphs. Needs public-repo read access.
        </p>

        {isLoading ? (
          <Skeleton className="h-10 w-64 rounded-none" />
        ) : status?.isConfigured && !editing ? (
          <div className="flex items-center gap-3">
            <span className="border border-grey-200 bg-grey-50 px-3 py-2 font-mono text-sm text-text-secondary">
              ghp_••••••••{status.lastFour}
            </span>
            {canManage && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditing(true)}
                  className="h-9 rounded-none font-mono text-xs font-bold"
                >
                  Replace
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isClearing}
                  onClick={handleClear}
                  className="h-9 rounded-none font-mono text-xs font-bold text-error-600 hover:bg-error-50"
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Remove
                </Button>
              </>
            )}
          </div>
        ) : canManage ? (
          <div className="flex items-center gap-3">
            <Input
              type="password"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="ghp_..."
              className="h-10 w-72 rounded-none border-grey-300 font-mono text-sm"
            />
            <Button
              type="button"
              disabled={isSaving || !tokenInput.trim()}
              onClick={handleSave}
              className="h-10 rounded-none font-mono text-xs font-bold"
            >
              {isSaving ? "Saving..." : "Save"}
            </Button>
            {editing && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditing(false);
                  setTokenInput("");
                }}
                className="h-10 rounded-none font-mono text-xs font-bold"
              >
                Cancel
              </Button>
            )}
          </div>
        ) : (
          <p className="font-mono text-xs text-text-muted">Not configured.</p>
        )}
      </div>
    </section>
  );
}

function RepoListSection({ canManage }: { canManage: boolean }) {
  const { data, isLoading } = useOrgRepos();
  const { mutate: setTracked } = useSetRepoTracked();
  const [search, setSearch] = useState("");

  const repos = data?.repos ?? [];
  const filtered = useMemo(() => {
    const trimmed = search.trim().toLowerCase();
    if (!trimmed) return repos;
    return repos.filter(
      (r) => r.name.toLowerCase().includes(trimmed) || r.fullName.toLowerCase().includes(trimmed)
    );
  }, [repos, search]);

  function toggle(repo: (typeof repos)[number], isTracked: boolean) {
    setTracked({
      githubId: repo.githubId,
      isTracked,
      meta: { fullName: repo.fullName, name: repo.name, htmlUrl: repo.htmlUrl },
    });
  }

  return (
    <section className="border border-grey-200 bg-white">
      <div className="flex items-center justify-between gap-4 border-b border-grey-200 bg-grey-50 px-5 py-3">
        <h2 className="font-sans text-base font-bold text-text-primary">Tracked repos</h2>
        <div className="relative w-56">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-icon-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search repos…"
            className="h-8 rounded-none border-grey-300 bg-white pl-8 font-mono text-xs"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3 p-5">
          <Skeleton className="h-14 w-full rounded-none" />
          <Skeleton className="h-14 w-full rounded-none" />
          <Skeleton className="h-14 w-full rounded-none" />
        </div>
      ) : !data?.tokenConfigured ? (
        <p className="p-8 text-center font-mono text-sm text-text-tertiary">
          Set up your GitHub token above to load repos.
        </p>
      ) : filtered.length === 0 ? (
        <p className="p-8 text-center font-mono text-sm text-text-tertiary">
          {repos.length === 0 ? "No public repos found in the org." : "No repos match your search."}
        </p>
      ) : (
        <div className="divide-y divide-grey-200">
          {filtered.map((repo) => (
            <div key={repo.githubId} className="flex items-start gap-3 px-5 py-4">
              <div className="min-w-0 flex-1">
                <p className="font-mono text-sm font-bold text-text-primary">{repo.name}</p>
                <p className="font-mono text-xs text-text-muted">{repo.fullName}</p>
                {repo.description && (
                  <p className="mt-1 font-mono text-xs text-text-tertiary">{repo.description}</p>
                )}
              </div>
              {canManage && (
                <label className="flex shrink-0 cursor-pointer items-center gap-1.5 font-mono text-[11px] text-text-secondary">
                  <input
                    type="checkbox"
                    checked={repo.isTracked}
                    onChange={(e) => toggle(repo, e.target.checked)}
                    className="h-3.5 w-3.5"
                  />
                  Tracked
                </label>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function AdminGithubReposContent() {
  const canManage = usePermission("github_repos.manage");

  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 md:px-0">
      <header className="mb-6 border border-grey-200 bg-white p-5">
        <h1 className="flex items-center gap-2 font-sans text-2xl font-black text-text-primary">
          <GitFork className="h-5 w-5" />
          GitHub repos
        </h1>
        <p className="mt-1 font-mono text-xs leading-6 text-text-tertiary">
          Choose which public codetopiacommunity repos are tracked for member contribution graphs —
          commits and merged pull requests from tracked repos show up on a member's profile
          activity.
        </p>
      </header>

      <TokenCard canManage={canManage} />
      <RepoListSection canManage={canManage} />
    </div>
  );
}

export default function AdminGithubReposPage() {
  return (
    <RouteGuard permission="github_repos.manage">
      <AdminGithubReposContent />
    </RouteGuard>
  );
}

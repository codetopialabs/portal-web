"use client";

import {
  AlertTriangle,
  Check,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Plus,
  Search,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ScopeChips } from "@/components/admin/ScopeChips";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { Badge } from "@/components/ui/badge";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { usePermissionList } from "@/hooks/useAdmin";
import { useApiKeys, useCreateApiKey, useRevokeApiKey } from "@/hooks/useApiKeys";
import { usePermission } from "@/hooks/usePermission";
import { buildPermissionVocab, compressScopes } from "@/lib/scopes";
import type { ApiKey, CreatedApiKey } from "@/types/api-keys.types";

function formatDate(value: string | null) {
  if (!value) return "Never";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "Never";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(
    d
  );
}

function KeyStatusBadge({ apiKey }: { apiKey: ApiKey }) {
  const live = apiKey.isActive && !apiKey.isExpired;
  const label = !apiKey.isActive ? "Revoked" : apiKey.isExpired ? "Expired" : "Active";
  return (
    <Badge
      className={`h-6 rounded-none px-2.5 text-[11px] font-bold ${
        live
          ? "border-success-200 bg-success-50 text-success-700"
          : "border-error-200 bg-error-50 text-error-700"
      }`}
    >
      <span className={`h-1.5 w-1.5 ${live ? "bg-success-600" : "bg-error-600"}`} />
      {label}
    </Badge>
  );
}

// ─── Create sheet (AWS IAM-style: details + grouped, searchable scopes) ─────────

function CreateKeySheet({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (key: CreatedApiKey) => void;
}) {
  const { data: permissions } = usePermissionList();
  const { mutate: createKey, isPending } = useCreateApiKey();

  const [name, setName] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [scopeSearch, setScopeSearch] = useState("");

  // Group scopes by service (the part before the first dot) — IAM-like.
  const groups = useMemo(() => {
    const term = scopeSearch.trim().toLowerCase();
    const byService = new Map<string, string[]>();
    for (const p of permissions ?? []) {
      if (term && !p.codename.toLowerCase().includes(term)) continue;
      const service = p.codename.split(".")[0];
      if (!byService.has(service)) byService.set(service, []);
      byService.get(service)?.push(p.codename);
    }
    return [...byService.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [permissions, scopeSearch]);

  function toggle(scope: string) {
    setSelected((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    );
  }

  function toggleGroup(scopes: string[], allSelected: boolean) {
    setSelected((prev) =>
      allSelected ? prev.filter((s) => !scopes.includes(s)) : [...new Set([...prev, ...scopes])]
    );
  }

  function reset() {
    setName("");
    setSelected([]);
    setScopeSearch("");
  }

  function handleCreate() {
    if (!name.trim() || selected.length === 0) return;
    createKey(
      { name: name.trim(), permissions: selected },
      {
        onSuccess: (key) => {
          reset();
          onOpenChange(false);
          onCreated(key);
        },
        onError: () => toast.error("Failed to create API key."),
      }
    );
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <SheetContent className="flex w-full flex-col gap-0 border-grey-200 bg-white p-0 sm:max-w-2xl">
        <SheetHeader className="border-b border-grey-200 p-5 pr-12">
          <SheetTitle className="font-sans text-xl font-black uppercase tracking-tight text-text-primary">
            Create API key
          </SheetTitle>
          <SheetDescription className="pt-1 font-mono text-xs leading-6 text-text-secondary">
            Name the key and attach the permission scopes it may use. You can only grant scopes you
            hold yourself. The secret is shown once.
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {/* Step 1 — key details */}
          <section className="border-b border-grey-200 p-5">
            <p className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">
              1 · Key details
            </p>
            <label
              htmlFor="api-key-name"
              className="mb-1.5 block font-mono text-xs font-bold text-text-secondary"
            >
              Name
            </label>
            <Input
              id="api-key-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Discord bot"
              className="h-10 rounded-none border-grey-300 font-mono text-sm"
            />
          </section>

          {/* Step 2 — permission scopes */}
          <section className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">
                2 · Permission scopes
              </p>
              <span className="font-mono text-xs font-bold text-text-secondary">
                {selected.length} selected
              </span>
            </div>

            <div className="group relative mb-4">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-icon-muted" />
              <Input
                value={scopeSearch}
                onChange={(e) => setScopeSearch(e.target.value)}
                placeholder="Filter scopes (e.g. users, reflections)"
                className="h-10 rounded-none border-grey-200 pl-9 font-mono text-sm"
              />
            </div>

            <div className="border border-grey-200">
              {groups.length === 0 ? (
                <p className="p-6 text-center font-mono text-xs text-text-tertiary">
                  No scopes match your filter.
                </p>
              ) : (
                groups.map(([service, scopes]) => {
                  const allSelected = scopes.every((s) => selected.includes(s));
                  return (
                    <div key={service} className="border-b border-grey-200 last:border-b-0">
                      <div className="flex items-center justify-between bg-grey-50 px-4 py-2">
                        <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-text-secondary">
                          {service}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleGroup(scopes, allSelected)}
                          className="font-mono text-[10px] font-bold uppercase tracking-widest text-text-muted transition-colors hover:text-text-primary"
                        >
                          {allSelected ? "Clear" : "Select all"}
                        </button>
                      </div>
                      {scopes.map((scope) => (
                        <label
                          key={scope}
                          className="flex cursor-pointer items-center gap-3 border-t border-grey-100 px-4 py-2 hover:bg-grey-50"
                        >
                          <input
                            type="checkbox"
                            checked={selected.includes(scope)}
                            onChange={() => toggle(scope)}
                            className="h-3.5 w-3.5"
                          />
                          <span className="font-mono text-xs text-text-secondary">{scope}</span>
                        </label>
                      ))}
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>

        <SheetFooter className="border-t border-grey-200 bg-grey-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-mono text-xs text-text-tertiary">
            {selected.length} scope(s) · {name.trim() ? "named" : "unnamed"}
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-10 rounded-none font-mono text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCreate}
              disabled={isPending || !name.trim() || selected.length === 0}
              className="h-10 rounded-none font-mono text-xs font-bold"
            >
              {isPending ? "Creating..." : "Create key"}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

function ApiKeysContent() {
  const { data: keys, isLoading } = useApiKeys();
  const { data: permissions } = usePermissionList();
  const { mutate: revokeKey, isPending: isRevoking } = useRevokeApiKey();

  // resource -> set of all actions it defines, used to collapse full coverage to `resource.*`.
  const vocab = useMemo(() => buildPermissionVocab(permissions ?? []), [permissions]);

  const canCreate = usePermission("api_keys.create");
  const canRevoke = usePermission("api_keys.revoke");

  const [createOpen, setCreateOpen] = useState(false);
  const [createdKey, setCreatedKey] = useState<CreatedApiKey | null>(null);
  const [copied, setCopied] = useState(false);
  const [masked, setMasked] = useState(true);
  const [revokeTarget, setRevokeTarget] = useState<ApiKey | null>(null);

  function closeReveal() {
    setCreatedKey(null);
    setMasked(true);
    setCopied(false);
  }

  function maskKey(key: string) {
    if (key.length <= 16) return key;
    return `${key.slice(0, 11)}••••••••••••••••${key.slice(-4)}`;
  }

  async function copyKey() {
    if (!createdKey) return;
    await navigator.clipboard.writeText(createdKey.key);
    setCopied(true);
    toast.success("API key copied to clipboard.");
    setTimeout(() => setCopied(false), 2000);
  }

  function handleRevoke() {
    if (!revokeTarget) return;
    revokeKey(revokeTarget.id, {
      onSuccess: () => {
        toast.success("API key revoked.");
        setRevokeTarget(null);
      },
      onError: () => toast.error("Failed to revoke API key."),
    });
  }

  return (
    <div className="w-full pb-20">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-grey-200 bg-white">
            <KeyRound className="h-5 w-5 text-icon-tertiary" />
          </div>
          <div>
            <h1 className="font-sans text-2xl font-black uppercase tracking-tight text-text-primary">
              API Keys
            </h1>
            <p className="mt-1 font-mono text-xs leading-6 text-text-tertiary">
              Issue scoped keys so external systems can call the community backend.
            </p>
          </div>
        </div>
        {canCreate && (
          <Button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="h-11 shrink-0 rounded-none font-mono text-xs font-bold"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create key
          </Button>
        )}
      </header>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton rows
            <Skeleton key={i} className="h-20 w-full rounded-none" />
          ))}
        </div>
      ) : !keys || keys.length === 0 ? (
        <div className="rounded-none border border-dashed border-grey-300 bg-white p-14 text-center">
          <p className="font-sans text-base font-black text-text-primary">No API keys yet</p>
          <p className="mt-2 font-mono text-xs text-text-tertiary">
            Create a key to let an external system talk to the backend.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-none border border-grey-200 bg-white">
          <div className="hidden grid-cols-[2fr_1fr_2.4fr_1.1fr_1.1fr_auto] gap-4 border-b border-grey-200 bg-grey-50 px-5 py-3 lg:grid">
            {["Key", "Status", "Scopes", "Last used", "Created", ""].map((h, i) => (
              <span
                // biome-ignore lint/suspicious/noArrayIndexKey: static header labels
                key={i}
                className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted"
              >
                {h || <span className="sr-only">Actions</span>}
              </span>
            ))}
          </div>

          <div className="divide-y divide-grey-200">
            {keys.map((apiKey) => (
              <div
                key={apiKey.id}
                className="grid grid-cols-1 gap-4 px-4 py-5 transition-colors hover:bg-grey-50/60 lg:grid-cols-[2fr_1fr_2.4fr_1.1fr_1.1fr_auto] lg:items-center lg:px-5"
              >
                <div className="min-w-0">
                  <p className="truncate font-sans text-sm font-black uppercase tracking-tight text-text-primary">
                    {apiKey.name}
                  </p>
                  <p className="mt-1 font-mono text-xs text-text-muted">{apiKey.prefix}•••</p>
                </div>

                <div>
                  <KeyStatusBadge apiKey={apiKey} />
                </div>

                <ScopeChips scopes={compressScopes(apiKey.permissions, vocab)} />

                <div className="font-mono text-xs text-text-tertiary">
                  {formatDate(apiKey.lastUsedAt)}
                </div>
                <div className="font-mono text-xs text-text-tertiary">
                  {formatDate(apiKey.createdAt)}
                </div>

                <div className="flex lg:justify-end">
                  {canRevoke && apiKey.isActive && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setRevokeTarget(apiKey)}
                      className="h-8 rounded-none border-error-200 px-3 font-mono text-xs font-bold text-error-700 hover:bg-error-50"
                    >
                      Revoke
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <CreateKeySheet open={createOpen} onOpenChange={setCreateOpen} onCreated={setCreatedKey} />

      {/* Reveal-once dialog */}
      <Dialog open={!!createdKey} onOpenChange={(open) => !open && closeReveal()}>
        <DialogContent className="rounded-none border-grey-900 sm:max-w-md">
          <DialogHeader>
            <div className="mb-1 flex h-12 w-12 items-center justify-center border border-success-200 bg-success-50">
              <ShieldCheck className="h-6 w-6 text-success-600" />
            </div>
            <DialogTitle className="font-sans text-xl font-black uppercase tracking-tight text-text-primary">
              API key created
            </DialogTitle>
            <DialogDescription className="font-mono text-xs leading-6 text-text-secondary">
              Copy <span className="font-bold text-text-primary">{createdKey?.name}</span>'s secret
              now — it won't be shown again.
            </DialogDescription>
          </DialogHeader>

          <div>
            <p className="mb-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">
              Secret key
            </p>
            <div className="flex items-stretch border border-grey-300 bg-grey-50">
              <code className="flex min-w-0 flex-1 items-center break-all px-3 py-2.5 font-mono text-xs leading-5 text-text-primary">
                {createdKey ? (masked ? maskKey(createdKey.key) : createdKey.key) : ""}
              </code>
              <button
                type="button"
                onClick={() => setMasked((m) => !m)}
                aria-label={masked ? "Reveal key" : "Hide key"}
                className="flex w-10 shrink-0 items-center justify-center border-l border-grey-300 text-text-muted transition-colors hover:bg-grey-100 hover:text-text-primary"
              >
                {masked ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={copyKey}
                aria-label="Copy key"
                className="flex w-12 shrink-0 items-center justify-center border-l border-grey-900 bg-grey-900 text-white transition-colors hover:bg-grey-800"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            <p className="mt-2.5 flex items-start gap-1.5 font-mono text-[11px] leading-5 text-warning-700">
              <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0" />
              Store it somewhere safe. Once you close this dialog the secret can't be retrieved.
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              onClick={closeReveal}
              className="h-10 rounded-none font-mono text-xs font-bold"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke confirm */}
      <Dialog open={!!revokeTarget} onOpenChange={(open) => !open && setRevokeTarget(null)}>
        <DialogContent className="max-w-md rounded-none border-grey-900 bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-sans text-xl font-black uppercase tracking-tight text-error-700">
              <ShieldAlert className="h-5 w-5" />
              Revoke key
            </DialogTitle>
            <DialogDescription className="pt-1 font-mono text-xs leading-6 text-text-secondary">
              Revoking <span className="font-bold text-text-primary">{revokeTarget?.name}</span>{" "}
              immediately breaks any system using it. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setRevokeTarget(null)}
              className="h-10 rounded-none font-mono text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleRevoke}
              disabled={isRevoking}
              className="h-10 rounded-none font-mono text-xs font-bold"
            >
              {isRevoking ? "Revoking..." : "Revoke key"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ApiKeysPage() {
  return (
    <RouteGuard permission="api_keys.view">
      <ApiKeysContent />
    </RouteGuard>
  );
}

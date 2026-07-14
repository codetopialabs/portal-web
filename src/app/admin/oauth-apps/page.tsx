"use client";

import {
  AlertTriangle,
  Check,
  Copy,
  Eye,
  EyeOff,
  GlobeLock,
  Pencil,
  Plus,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { RouteGuard } from "@/components/auth/RouteGuard";
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
import {
  useCreateOAuthApp,
  useDeleteOAuthApp,
  useOAuthApps,
  useUpdateOAuthApp,
} from "@/hooks/useOAuthApps";
import { usePermission } from "@/hooks/usePermission";
import type { CreatedOAuthApp, OAuthApp } from "@/types/oauth-apps.types";

function getClientId(app: OAuthApp | CreatedOAuthApp | null | undefined) {
  return app?.clientId ?? app?.client_id ?? "";
}

function getRedirectUris(app: OAuthApp | null | undefined) {
  return app?.redirectUris ?? app?.redirect_uris ?? "";
}

function getRawSecret(app: CreatedOAuthApp | null | undefined) {
  return app?.rawSecret ?? app?.raw_secret ?? "";
}
function formatDate(value: string | null) {
  if (!value) return "Never";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "Never";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(
    d
  );
}

// ─── Create & Edit Sheet ───────────────────────────────────────────────────────

function OAuthAppSheet({
  open,
  mode,
  appToEdit,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  mode: "create" | "edit";
  appToEdit?: OAuthApp | null;
  onOpenChange: (open: boolean) => void;
  onCreated: (app: CreatedOAuthApp) => void;
}) {
  const { mutate: createApp, isPending: isCreating } = useCreateOAuthApp();
  const { mutate: updateApp, isPending: isUpdating } = useUpdateOAuthApp();

  const [name, setName] = useState(appToEdit?.name || "");
  const [redirectUris, setRedirectUris] = useState(getRedirectUris(appToEdit));

  // Update local state when appToEdit changes
  if (open && mode === "edit" && appToEdit && name === "" && name !== appToEdit.name) {
    setName(appToEdit.name);
    setRedirectUris(getRedirectUris(appToEdit));
  }

  function reset() {
    setName("");
    setRedirectUris("");
  }

  function handleSave() {
    if (!name.trim() || !redirectUris.trim()) return;

    if (mode === "create") {
      createApp(
        { name: name.trim(), redirect_uris: redirectUris.trim() },
        {
          onSuccess: (app) => {
            reset();
            onOpenChange(false);
            onCreated(app);
          },
        }
      );
    } else if (mode === "edit" && appToEdit) {
      updateApp(
        { id: appToEdit.id, data: { name: name.trim(), redirect_uris: redirectUris.trim() } },
        {
          onSuccess: () => {
            reset();
            onOpenChange(false);
            toast.success("OAuth App updated.");
          },
        }
      );
    }
  }

  const isPending = isCreating || isUpdating;

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
          <SheetTitle className="font-sans text-xl font-bold text-text-primary">
            {mode === "create" ? "Create OAuth App" : "Edit OAuth App"}
          </SheetTitle>
          <SheetDescription className="pt-1 font-mono text-xs leading-6 text-text-secondary">
            {mode === "create"
              ? "Register a new OAuth Application for SSO. The client secret will be shown once."
              : "Update the configuration for this application."}
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <section className="border-b border-grey-200 p-5">
            <p className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">
              App details
            </p>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="app-name"
                  className="mb-1.5 block font-mono text-xs font-bold text-text-secondary"
                >
                  Name
                </label>
                <Input
                  id="app-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Community Website"
                  className="h-10 rounded-none border-grey-300 font-mono text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="redirect-uris"
                  className="mb-1.5 block font-mono text-xs font-bold text-text-secondary"
                >
                  Redirect URIs (space-separated)
                </label>
                <Input
                  id="redirect-uris"
                  value={redirectUris}
                  onChange={(e) => setRedirectUris(e.target.value)}
                  placeholder="e.g. http://localhost:3000/api/auth/callback"
                  className="h-10 rounded-none border-grey-300 font-mono text-sm"
                />
                <p className="mt-1.5 font-mono text-[11px] text-text-tertiary">
                  Where users should be redirected after approving access.
                </p>
              </div>
            </div>
          </section>
        </div>

        <SheetFooter className="border-t border-grey-200 bg-grey-50 p-4 sm:flex-row sm:items-center sm:justify-end">
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
              onClick={handleSave}
              disabled={isPending || !name.trim() || !redirectUris.trim()}
              className="h-10 rounded-none font-mono text-xs font-bold"
            >
              {isPending ? "Saving..." : mode === "create" ? "Create App" : "Save changes"}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// ─── Page Content ──────────────────────────────────────────────────────────────

function OAuthAppsContent() {
  const { data: apps, isLoading } = useOAuthApps();
  const { mutate: deleteApp, isPending: isDeleting } = useDeleteOAuthApp();

  const canCreate = usePermission("oauth_apps.create");
  const canEdit = usePermission("oauth_apps.edit");
  const canDelete = usePermission("oauth_apps.delete");

  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<"create" | "edit">("create");
  const [appToEdit, setAppToEdit] = useState<OAuthApp | null>(null);

  const [createdApp, setCreatedApp] = useState<CreatedOAuthApp | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [masked, setMasked] = useState(true);

  const [deleteTarget, setDeleteTarget] = useState<OAuthApp | null>(null);

  function openCreate() {
    setSheetMode("create");
    setAppToEdit(null);
    setSheetOpen(true);
  }

  function openEdit(app: OAuthApp) {
    setSheetMode("edit");
    setAppToEdit(app);
    setSheetOpen(true);
  }

  function closeReveal() {
    setCreatedApp(null);
    setMasked(true);
    setCopiedId(false);
    setCopiedSecret(false);
  }

  function maskKey(key: string) {
    if (!key) return "";
    if (key.length <= 16) return key;
    return `${key.slice(0, 8)}••••••••••••••••${key.slice(-4)}`;
  }

  async function copyToClipboard(text: string, type: "id" | "secret") {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    if (type === "id") {
      setCopiedId(true);
      toast.success("Client ID copied.");
      setTimeout(() => setCopiedId(false), 2000);
    } else {
      setCopiedSecret(true);
      toast.success("Client Secret copied.");
      setTimeout(() => setCopiedSecret(false), 2000);
    }
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteApp(deleteTarget.id, {
      onSuccess: () => {
        toast.success("OAuth App deleted.");
        setDeleteTarget(null);
      },
    });
  }

  return (
    <div className="w-full pb-20">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-grey-200 bg-white">
            <GlobeLock className="h-5 w-5 text-icon-tertiary" />
          </div>
          <div>
            <h1 className="font-sans text-2xl font-bold text-text-primary">OAuth Apps</h1>
            <p className="mt-1 font-mono text-xs leading-6 text-text-tertiary">
              Manage SSO client applications integrated with the community portal.
            </p>
          </div>
        </div>
        {canCreate && (
          <Button
            type="button"
            onClick={openCreate}
            className="h-11 shrink-0 rounded-none font-mono text-xs font-bold"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create app
          </Button>
        )}
      </header>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton rows
            <Skeleton key={i} className="h-24 w-full rounded-none" />
          ))}
        </div>
      ) : !apps || apps.length === 0 ? (
        <div className="rounded-none border border-dashed border-grey-300 bg-white p-14 text-center">
          <p className="font-sans text-base font-black text-text-primary">No OAuth apps yet</p>
          <p className="mt-2 font-mono text-xs text-text-tertiary">
            Create an OAuth application to allow SSO from another site.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-none border border-grey-200 bg-white">
          <div className="hidden grid-cols-[2fr_3fr_1.5fr_auto] gap-4 border-b border-grey-200 bg-grey-50 px-5 py-3 lg:grid">
            {["App", "Client ID & URIs", "Created", ""].map((h, i) => (
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
            {apps.map((app) => (
              <div
                key={app.id}
                className="grid grid-cols-1 gap-4 px-4 py-5 transition-colors hover:bg-grey-50/60 lg:grid-cols-[2fr_3fr_1.5fr_auto] lg:items-start lg:px-5"
              >
                <div className="min-w-0">
                  <p className="truncate font-sans text-sm font-bold text-text-primary">
                    {app.name}
                  </p>
                  <p className="mt-1 font-mono text-[11px] uppercase text-text-muted">
                    ID: {app.id}
                  </p>
                </div>

                <div className="min-w-0">
                  <div className="mb-2">
                    <span className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">
                      Client ID
                    </span>
                    <code className="break-all font-mono text-xs text-text-secondary">
                      {getClientId(app)}
                    </code>
                  </div>
                  <div>
                    <span className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">
                      Redirect URIs
                    </span>
                    <div className="font-mono text-xs text-text-secondary break-all">
                      {getRedirectUris(app).trim() ? (
                        getRedirectUris(app)
                          .trim()
                          .split(/\s+/)
                          .map((uri) => <div key={uri}>{uri}</div>)
                      ) : (
                        <div className="text-text-muted">No redirect URIs configured.</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="font-mono text-xs text-text-tertiary">
                  {formatDate(app.created)}
                </div>

                <div className="flex gap-2 lg:justify-end">
                  {canEdit && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(app)}
                      className="h-8 rounded-none px-3 font-mono text-xs font-bold"
                    >
                      <Pencil className="mr-1.5 h-3.5 w-3.5" />
                      Edit
                    </Button>
                  )}
                  {canDelete && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteTarget(app)}
                      className="h-8 rounded-none border-error-200 px-3 font-mono text-xs font-bold text-error-700 hover:bg-error-50"
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <OAuthAppSheet
        open={sheetOpen}
        mode={sheetMode}
        appToEdit={appToEdit}
        onOpenChange={setSheetOpen}
        onCreated={setCreatedApp}
      />

      {/* Reveal-once dialog for newly created app */}
      <Dialog open={!!createdApp} onOpenChange={(open) => !open && closeReveal()}>
        <DialogContent className="rounded-none border-grey-900 sm:max-w-md">
          <DialogHeader>
            <div className="mb-1 flex h-12 w-12 items-center justify-center border border-success-200 bg-success-50">
              <ShieldCheck className="h-6 w-6 text-success-600" />
            </div>
            <DialogTitle className="font-sans text-xl font-bold text-text-primary">
              OAuth App Created
            </DialogTitle>
            <DialogDescription className="font-mono text-xs leading-6 text-text-secondary">
              Copy <span className="font-bold text-text-primary">{createdApp?.name}</span>'s client
              secret now — it won't be shown again.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Client ID */}
            <div>
              <p className="mb-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">
                Client ID
              </p>
              <div className="flex items-stretch border border-grey-300 bg-grey-50">
                <code className="flex min-w-0 flex-1 items-center break-all px-3 py-2.5 font-mono text-xs leading-5 text-text-primary">
                  {getClientId(createdApp)}
                </code>
                <button
                  type="button"
                  onClick={() => copyToClipboard(getClientId(createdApp), "id")}
                  aria-label="Copy Client ID"
                  className="flex w-12 shrink-0 items-center justify-center border-l border-grey-900 bg-grey-900 text-white transition-colors hover:bg-grey-800"
                >
                  {copiedId ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Client Secret */}
            <div>
              <p className="mb-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">
                Client Secret
              </p>
              <div className="flex items-stretch border border-grey-300 bg-grey-50">
                <code className="flex min-w-0 flex-1 items-center break-all px-3 py-2.5 font-mono text-xs leading-5 text-text-primary">
                  {createdApp
                    ? masked
                      ? maskKey(getRawSecret(createdApp))
                      : getRawSecret(createdApp)
                    : ""}
                </code>
                <button
                  type="button"
                  onClick={() => setMasked((m) => !m)}
                  aria-label={masked ? "Reveal secret" : "Hide secret"}
                  className="flex w-10 shrink-0 items-center justify-center border-l border-grey-300 text-text-muted transition-colors hover:bg-grey-100 hover:text-text-primary"
                >
                  {masked ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => copyToClipboard(getRawSecret(createdApp), "secret")}
                  aria-label="Copy secret"
                  className="flex w-12 shrink-0 items-center justify-center border-l border-grey-900 bg-grey-900 text-white transition-colors hover:bg-grey-800"
                >
                  {copiedSecret ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <p className="flex items-start gap-1.5 font-mono text-[11px] leading-5 text-warning-700">
              <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0" />
              Store the secret safely. Once closed, it cannot be retrieved again.
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

      {/* Delete confirm */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-md rounded-none border-grey-900 bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-sans text-xl font-bold text-error-700">
              <ShieldAlert className="h-5 w-5" />
              Delete App
            </DialogTitle>
            <DialogDescription className="pt-1 font-mono text-xs leading-6 text-text-secondary">
              Deleting <span className="font-bold text-text-primary">{deleteTarget?.name}</span>{" "}
              instantly revokes all active tokens for this SSO app. This action is destructive and
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setDeleteTarget(null)}
              className="h-10 rounded-none font-mono text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="h-10 rounded-none font-mono text-xs font-bold"
            >
              {isDeleting ? "Deleting..." : "Delete app"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function OAuthAppsPage() {
  return (
    <RouteGuard permission="oauth_apps.view">
      <OAuthAppsContent />
    </RouteGuard>
  );
}

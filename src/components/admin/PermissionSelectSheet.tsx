"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
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
import { resourceOf } from "@/lib/scopes";

/**
 * AWS IAM-style permission selector in a slide-over sheet: scopes grouped by
 * service, searchable, with per-group select-all and destructive flags.
 * Selection is applied live to `selected` via `onChange`.
 */
export function PermissionSelectSheet({
  open,
  onOpenChange,
  selected,
  onChange,
  title = "Select permissions",
  description = "Attach the permission scopes this grant may use.",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selected: string[];
  onChange: (next: string[]) => void;
  title?: string;
  description?: string;
}) {
  const { data: permissions, isLoading } = usePermissionList();
  const [search, setSearch] = useState("");

  const groups = useMemo(() => {
    const term = search.trim().toLowerCase();
    const byService = new Map<
      string,
      { codename: string; description: string; isDestructive: boolean }[]
    >();
    for (const p of permissions ?? []) {
      if (term && !p.codename.toLowerCase().includes(term)) continue;
      const [service] = resourceOf(p.codename);
      if (!byService.has(service)) byService.set(service, []);
      byService.get(service)?.push(p);
    }
    return [...byService.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [permissions, search]);

  function toggle(codename: string) {
    onChange(
      selected.includes(codename) ? selected.filter((s) => s !== codename) : [...selected, codename]
    );
  }

  function toggleGroup(codenames: string[], allSelected: boolean) {
    onChange(
      allSelected
        ? selected.filter((s) => !codenames.includes(s))
        : [...new Set([...selected, ...codenames])]
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 border-grey-200 bg-white p-0 sm:max-w-2xl">
        <SheetHeader className="border-b border-grey-200 p-5 pr-12">
          <SheetTitle className="font-sans text-2xl font-bold text-text-primary">
            {title}
          </SheetTitle>
          <SheetDescription className="pt-1 font-mono text-xs leading-6 text-text-secondary">
            {description}
          </SheetDescription>
        </SheetHeader>

        <div className="border-b border-grey-200 p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-icon-muted" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter permissions (e.g. users, roles)"
              className="h-10 rounded-none border-grey-200 pl-9 font-mono text-sm"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-3 p-5">
              {Array.from({ length: 5 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton rows
                <Skeleton key={i} className="h-10 w-full rounded-none" />
              ))}
            </div>
          ) : groups.length === 0 ? (
            <p className="p-8 text-center font-mono text-xs text-text-tertiary">
              No permissions match your filter.
            </p>
          ) : (
            groups.map(([service, perms]) => {
              const codenames = perms.map((p) => p.codename);
              const allSelected = codenames.every((c) => selected.includes(c));
              return (
                <div key={service} className="border-b border-grey-200 last:border-b-0">
                  <div className="sticky top-0 flex items-center justify-between bg-grey-50 px-4 py-2">
                    <span className="font-mono text-xs font-bold text-text-secondary">
                      {service}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleGroup(codenames, allSelected)}
                      className="font-mono text-xs font-medium text-text-muted transition-colors hover:text-text-primary"
                    >
                      {allSelected ? "Clear" : "Select all"}
                    </button>
                  </div>
                  {perms.map((perm) => (
                    <label
                      key={perm.codename}
                      className="flex cursor-pointer items-start gap-3 border-t border-grey-100 px-4 py-3 hover:bg-grey-50"
                    >
                      <input
                        type="checkbox"
                        checked={selected.includes(perm.codename)}
                        onChange={() => toggle(perm.codename)}
                        className="mt-0.5 h-3.5 w-3.5"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-text-primary">
                            {perm.codename}
                          </span>
                          {perm.isDestructive && (
                            <span className="inline-flex items-center border border-error-200 bg-error-50 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-error-700">
                              destructive
                            </span>
                          )}
                        </div>
                        <p className="mt-1 font-mono text-[11px] leading-5 text-text-muted">
                          {perm.description}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              );
            })
          )}
        </div>

        <SheetFooter className="border-t border-grey-200 bg-grey-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-mono text-xs text-text-tertiary">
            {selected.length} permission(s) selected
          </span>
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-10 rounded-none font-mono text-xs font-bold"
          >
            Done
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

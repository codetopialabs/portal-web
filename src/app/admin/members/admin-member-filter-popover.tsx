"use client";

import { Filter, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface AdminMemberFilters {
  role: string;
  verification: string;
}

interface AdminMemberFilterPopoverProps {
  filters: AdminMemberFilters;
  roles: { id: number | string; name: string; displayName: string }[] | undefined;
  rolesLoading?: boolean;
  onChange: (filters: AdminMemberFilters) => void;
  onReset: () => void;
}

export function AdminMemberFilterPopover({
  filters,
  roles,
  rolesLoading,
  onChange,
  onReset,
}: AdminMemberFilterPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          className="h-11 shrink-0 rounded-none border-grey-900 bg-grey-900 px-4 font-mono text-sm text-white hover:bg-grey-800"
        >
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="flex w-full flex-col rounded-none border border-grey-200 bg-white p-0 sm:w-[340px]"
      >
        <div className="border-b border-grey-200 p-4">
          <h3 className="font-sans text-base font-bold text-text-primary">Filter Members</h3>
          <p className="mt-1 font-mono text-xs text-text-tertiary">
            Refine by role and verification status.
          </p>
        </div>

        <div className="space-y-5 p-4">
          <div className="space-y-2">
            <p className="font-mono text-xs font-medium text-text-muted">Role</p>
            <Select value={filters.role} onValueChange={(role) => onChange({ ...filters, role })}>
              <SelectTrigger className="h-10 w-full rounded-none border-grey-200 bg-white font-mono text-sm focus:border-grey-900 focus:ring-2 focus:ring-grey-900/10">
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent className="rounded-none font-mono text-sm">
                <SelectItem value="all">All roles</SelectItem>
                {rolesLoading && (
                  <SelectItem value="loading" disabled>
                    Loading roles...
                  </SelectItem>
                )}
                {roles
                  ?.filter((r) => r.name.trim() !== "")
                  .map((r) => (
                    <SelectItem key={r.id} value={r.name}>
                      {r.displayName}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <p className="font-mono text-xs font-medium text-text-muted">Verification</p>
            <Select
              value={filters.verification}
              onValueChange={(verification) => onChange({ ...filters, verification })}
            >
              <SelectTrigger className="h-10 w-full rounded-none border-grey-200 bg-white font-mono text-sm focus:border-grey-900 focus:ring-2 focus:ring-grey-900/10">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent className="rounded-none font-mono text-sm">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex shrink-0 gap-3 border-t border-grey-200 bg-grey-50 p-4">
          <Button
            type="button"
            variant="outline"
            onClick={onReset}
            className="h-10 flex-1 rounded-none border-grey-200 bg-white font-mono text-sm font-semibold text-text-secondary transition-all hover:bg-grey-50"
          >
            <RotateCcw className="mr-2 h-3.5 w-3.5" />
            Reset
          </Button>
          <PopoverClose asChild>
            <Button
              type="button"
              className="h-10 flex-1 rounded-none bg-grey-900 font-mono text-sm font-semibold text-white transition-all hover:bg-grey-800"
            >
              View Results
            </Button>
          </PopoverClose>
        </div>
      </PopoverContent>
    </Popover>
  );
}

"use client";

import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MemberFilters } from "./member-directory-utils";

interface MemberFilterPopoverProps {
  filters: MemberFilters;
  options: {
    roles: string[];
    skills: string[];
    experienceLevels: string[];
  };
  onChange: (filters: MemberFilters) => void;
  onReset: () => void;
}

export function MemberFilterPopover({
  filters,
  options,
  onChange,
  onReset,
}: MemberFilterPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          className="h-11 shrink-0 rounded-none bg-zinc-900 px-4 font-mono text-sm text-white transition-all hover:bg-zinc-800"
        >
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="flex w-full flex-col rounded-none border border-zinc-200 bg-white p-0 shadow-xl sm:w-[360px]"
      >
        <div className="border-b border-zinc-100 p-4">
          <h3 className="font-black font-sans text-zinc-900 uppercase tracking-tighter">
            Advanced Filters
          </h3>
          <p className="mt-0.5 font-mono text-xs text-zinc-500">
            Refine by roles, expertise, and interests.
          </p>
        </div>

        <div className="max-h-[60vh] space-y-5 overflow-y-auto p-4">
          <FilterSelect
            label="Role"
            value={filters.role}
            placeholder="All Roles"
            options={options.roles}
            onValueChange={(role) => onChange({ ...filters, role })}
          />
          <FilterSelect
            label="Experience Level"
            value={filters.experience}
            placeholder="All Experience Levels"
            options={options.experienceLevels}
            onValueChange={(experience) => onChange({ ...filters, experience })}
          />
          <FilterSelect
            label="Expertise & Interests"
            value={filters.skill}
            placeholder="All Skills"
            options={options.skills}
            onValueChange={(skill) => onChange({ ...filters, skill })}
          />
        </div>

        <div className="flex shrink-0 gap-3 border-t border-zinc-100 bg-zinc-50 p-4">
          <Button
            type="button"
            variant="outline"
            onClick={onReset}
            className="h-10 flex-1 rounded-none border-zinc-200 bg-white font-semibold font-mono text-sm text-zinc-600 transition-all hover:bg-zinc-50"
          >
            Reset
          </Button>
          <PopoverClose asChild>
            <Button
              type="button"
              className="h-10 flex-1 rounded-none bg-zinc-900 font-semibold font-mono text-sm text-white transition-all hover:bg-zinc-800"
            >
              View Results
            </Button>
          </PopoverClose>
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface FilterSelectProps {
  label: string;
  value: string;
  placeholder: string;
  options: string[];
  onValueChange: (value: string) => void;
}

function FilterSelect({ label, value, placeholder, options, onValueChange }: FilterSelectProps) {
  return (
    <div className="space-y-2">
      <p className="font-semibold font-mono text-xs text-zinc-900 uppercase tracking-widest">
        {label}
      </p>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="h-10 w-full rounded-none border-zinc-200 bg-zinc-50 font-mono text-sm focus:border-zinc-900 focus:ring-0">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="rounded-none font-mono text-sm">
          <SelectItem value="all">{placeholder}</SelectItem>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

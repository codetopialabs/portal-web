"use client";

import { Check, ChevronDown, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCommunityMembers } from "@/hooks/useCommunityMembers";
import { cn, getAvatarUrl } from "@/lib/utils";
import type { PersonSummary } from "@/services/community-teams.service";

// Pick one member by searching the directory. Used for a team's lead and
// deputy. Search runs on the server, debounced, so the list is never the
// whole community.

interface MemberPickerProps {
  id?: string;
  value: PersonSummary | null;
  onChange: (person: PersonSummary | null) => void;
  /** A member that must not be offered, e.g. the lead when picking the deputy. */
  excludeId?: string | null;
  placeholder?: string;
  disabled?: boolean;
}

export function MemberPicker({
  id,
  value,
  onChange,
  excludeId,
  placeholder = "Search members",
  disabled,
}: MemberPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: results, isLoading } = useCommunityMembers(debounced || undefined, {
    onboardedOnly: true,
  });
  const options = (results ?? []).filter((m) => m.id !== excludeId).slice(0, 12);

  return (
    <div className="flex items-center gap-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            id={id}
            type="button"
            disabled={disabled}
            aria-expanded={open}
            className={cn(
              "flex h-10 w-full items-center justify-between gap-2 rounded-none border border-grey-300 bg-white px-3 text-left font-mono text-sm",
              "focus:outline-none focus-visible:border-grey-900 disabled:opacity-50",
              value ? "text-text-primary" : "text-text-muted"
            )}
          >
            <span className="truncate">
              {value ? `${value.fullName} (@${value.username})` : placeholder}
            </span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-text-muted" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-(--radix-popover-trigger-width) rounded-none border-grey-200 p-0"
        >
          <Command shouldFilter={false}>
            <CommandInput
              value={search}
              onValueChange={setSearch}
              placeholder="Type a name or username"
              className="font-mono text-sm"
            />
            <CommandList>
              <CommandEmpty className="py-4 text-center font-mono text-xs text-text-muted">
                {isLoading ? "Searching" : debounced ? "No members found." : "Type to search."}
              </CommandEmpty>
              <CommandGroup>
                {options.map((member) => (
                  <CommandItem
                    key={member.id}
                    value={member.id}
                    onSelect={() => {
                      onChange({
                        id: member.id,
                        username: member.username,
                        fullName: member.fullName,
                      });
                      setOpen(false);
                      setSearch("");
                    }}
                    className="flex items-center gap-2 rounded-none font-mono text-sm"
                  >
                    <div className="h-6 w-6 shrink-0 overflow-hidden border border-grey-200">
                      {/* biome-ignore lint/performance/noImgElement: dicebear fallback */}
                      <img
                        src={getAvatarUrl(member.profilePictureUrl, member.fullName)}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <span className="truncate">{member.fullName}</span>
                    <span className="truncate text-text-muted">@{member.username}</span>
                    {value?.id === member.id && <Check className="ml-auto h-3.5 w-3.5" />}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {value && !disabled && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center border border-grey-300 bg-white text-text-muted hover:text-text-primary"
          aria-label="Clear"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

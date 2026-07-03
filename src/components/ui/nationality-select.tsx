"use client";

import { getData } from "country-list";
import { Check, ChevronDown, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// country-list ships official ISO 3166-1 names, some of which read awkwardly
// in a casual UI (e.g. "United States of America (the)"). Override those with
// the commonly-used short form; everything else uses the package's name as-is.
const COUNTRY_NAME_OVERRIDES: Record<string, string> = {
  AE: "United Arab Emirates",
  BO: "Bolivia",
  CC: "Cocos (Keeling) Islands",
  CD: "Congo (DRC)",
  CF: "Central African Republic",
  CG: "Congo (Republic)",
  CK: "Cook Islands",
  DO: "Dominican Republic",
  FK: "Falkland Islands",
  FM: "Micronesia",
  FO: "Faroe Islands",
  GB: "United Kingdom",
  GM: "Gambia",
  IO: "British Indian Ocean Territory",
  IR: "Iran",
  KM: "Comoros",
  KP: "North Korea",
  KR: "South Korea",
  KY: "Cayman Islands",
  LA: "Laos",
  MD: "Moldova",
  MH: "Marshall Islands",
  MP: "Northern Mariana Islands",
  NE: "Niger",
  PH: "Philippines",
  PS: "Palestine",
  RU: "Russia",
  SD: "Sudan",
  SY: "Syria",
  TC: "Turks and Caicos Islands",
  TF: "French Southern Territories",
  TW: "Taiwan",
  TZ: "Tanzania",
  UM: "United States Minor Outlying Islands",
  US: "United States",
  VA: "Vatican City",
  VE: "Venezuela",
  VN: "Vietnam",
  EH: "Western Sahara",
};

const COUNTRIES: { label: string; value: string }[] = [
  ...getData()
    .map((c) => COUNTRY_NAME_OVERRIDES[c.code] ?? c.name)
    .sort((a, b) => a.localeCompare(b))
    .map((name) => ({ label: name, value: name })),
  { label: "Prefer not to say", value: "Prefer not to say" },
];

interface NationalitySelectProps {
  value: string;
  onChange: (value: string) => void;
  /** Extra class applied to the trigger button */
  className?: string;
  /** Styling variant — "onboarding" uses the raw input style, "settings" uses the Input style */
  variant?: "onboarding" | "settings";
  error?: boolean;
}

export function NationalitySelect({
  value,
  onChange,
  className,
  variant = "settings",
  error,
}: NationalitySelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const filtered = search.trim()
    ? COUNTRIES.filter((n) => n.label.toLowerCase().includes(search.toLowerCase()))
    : COUNTRIES;

  // Focus search input when popover opens
  useEffect(() => {
    if (open) {
      const timeout = setTimeout(() => searchRef.current?.focus(), 50);
      return () => clearTimeout(timeout);
    }
    setSearch("");
  }, [open]);

  const triggerBase =
    variant === "onboarding"
      ? `h-11 w-full border bg-white px-3 font-mono text-sm text-left flex items-center justify-between transition-all focus:outline-none ${
          error
            ? "border-red-500"
            : open
              ? "border-zinc-900"
              : "border-zinc-200 focus:border-zinc-900"
        }`
      : `h-11 w-full rounded-none border bg-white px-3 font-mono text-sm text-left flex items-center justify-between transition-all focus-visible:ring-0 focus:outline-none ${
          error
            ? "border-red-500"
            : open
              ? "border-zinc-900"
              : "border-zinc-200 focus-visible:border-zinc-900"
        }`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`${triggerBase} ${className ?? ""}`}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className={value ? "text-zinc-900" : "text-zinc-300"}>
            {value || "Select country"}
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 shrink-0 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="p-0 rounded-none border border-zinc-200 bg-white shadow-md w-[var(--radix-popover-trigger-width)]"
        align="start"
        sideOffset={4}
      >
        {/* Search */}
        <div className="flex items-center gap-2 px-3 border-b border-zinc-100">
          <Search className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
          <input
            ref={searchRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search country..."
            className="flex-1 h-10 bg-transparent font-mono text-sm text-zinc-900 placeholder:text-zinc-300 focus:outline-none"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="text-zinc-400 hover:text-zinc-900 transition-colors"
            >
              ×
            </button>
          )}
        </div>

        {/* List */}
        <div className="max-h-60 overflow-y-auto" role="listbox">
          {filtered.length === 0 ? (
            <p className="px-3 py-4 font-mono text-xs text-zinc-400 text-center">No match found</p>
          ) : (
            filtered.map((n) => (
              <button
                key={n.value}
                type="button"
                role="option"
                aria-selected={value === n.value}
                onClick={() => {
                  onChange(n.value);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-left font-mono text-sm transition-colors ${
                  value === n.value
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-700 hover:bg-slate-100 hover:text-zinc-900"
                }`}
              >
                <span>{n.label}</span>
                {value === n.value && <Check className="w-3.5 h-3.5 shrink-0" />}
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

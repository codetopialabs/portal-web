"use client";

import { Check, ChevronDown, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Nationality demonyms — common ones first, then alphabetical
// Format: { label: display name, value: stored value }
const NATIONALITIES: { label: string; value: string }[] = [
  // Africa
  { label: "Algerian", value: "Algerian" },
  { label: "Angolan", value: "Angolan" },
  { label: "Beninese", value: "Beninese" },
  { label: "Botswanan", value: "Botswanan" },
  { label: "Burkinabé", value: "Burkinabé" },
  { label: "Burundian", value: "Burundian" },
  { label: "Cameroonian", value: "Cameroonian" },
  { label: "Cape Verdean", value: "Cape Verdean" },
  { label: "Central African", value: "Central African" },
  { label: "Chadian", value: "Chadian" },
  { label: "Comorian", value: "Comorian" },
  { label: "Congolese (DRC)", value: "Congolese (DRC)" },
  { label: "Congolese (Republic)", value: "Congolese (Republic)" },
  { label: "Djiboutian", value: "Djiboutian" },
  { label: "Egyptian", value: "Egyptian" },
  { label: "Equatorial Guinean", value: "Equatorial Guinean" },
  { label: "Eritrean", value: "Eritrean" },
  { label: "Eswatini", value: "Eswatini" },
  { label: "Ethiopian", value: "Ethiopian" },
  { label: "Gabonese", value: "Gabonese" },
  { label: "Gambian", value: "Gambian" },
  { label: "Ghanaian", value: "Ghanaian" },
  { label: "Guinean", value: "Guinean" },
  { label: "Guinea-Bissauan", value: "Guinea-Bissauan" },
  { label: "Ivorian", value: "Ivorian" },
  { label: "Kenyan", value: "Kenyan" },
  { label: "Lesothan", value: "Lesothan" },
  { label: "Liberian", value: "Liberian" },
  { label: "Libyan", value: "Libyan" },
  { label: "Malagasy", value: "Malagasy" },
  { label: "Malawian", value: "Malawian" },
  { label: "Malian", value: "Malian" },
  { label: "Mauritanian", value: "Mauritanian" },
  { label: "Mauritian", value: "Mauritian" },
  { label: "Moroccan", value: "Moroccan" },
  { label: "Mozambican", value: "Mozambican" },
  { label: "Namibian", value: "Namibian" },
  { label: "Nigerien", value: "Nigerien" },
  { label: "Nigerian", value: "Nigerian" },
  { label: "Rwandan", value: "Rwandan" },
  { label: "Sahrawi", value: "Sahrawi" },
  { label: "São Toméan", value: "São Toméan" },
  { label: "Senegalese", value: "Senegalese" },
  { label: "Seychellois", value: "Seychellois" },
  { label: "Sierra Leonean", value: "Sierra Leonean" },
  { label: "Somali", value: "Somali" },
  { label: "South African", value: "South African" },
  { label: "South Sudanese", value: "South Sudanese" },
  { label: "Sudanese", value: "Sudanese" },
  { label: "Tanzanian", value: "Tanzanian" },
  { label: "Togolese", value: "Togolese" },
  { label: "Tunisian", value: "Tunisian" },
  { label: "Ugandan", value: "Ugandan" },
  { label: "Zambian", value: "Zambian" },
  { label: "Zimbabwean", value: "Zimbabwean" },
  // Americas
  { label: "American", value: "American" },
  { label: "Antiguan", value: "Antiguan" },
  { label: "Argentine", value: "Argentine" },
  { label: "Bahamian", value: "Bahamian" },
  { label: "Barbadian", value: "Barbadian" },
  { label: "Belizean", value: "Belizean" },
  { label: "Bolivian", value: "Bolivian" },
  { label: "Brazilian", value: "Brazilian" },
  { label: "Canadian", value: "Canadian" },
  { label: "Chilean", value: "Chilean" },
  { label: "Colombian", value: "Colombian" },
  { label: "Costa Rican", value: "Costa Rican" },
  { label: "Cuban", value: "Cuban" },
  { label: "Dominican", value: "Dominican" },
  { label: "Ecuadorian", value: "Ecuadorian" },
  { label: "Grenadian", value: "Grenadian" },
  { label: "Guatemalan", value: "Guatemalan" },
  { label: "Guyanese", value: "Guyanese" },
  { label: "Haitian", value: "Haitian" },
  { label: "Honduran", value: "Honduran" },
  { label: "Jamaican", value: "Jamaican" },
  { label: "Mexican", value: "Mexican" },
  { label: "Nicaraguan", value: "Nicaraguan" },
  { label: "Panamanian", value: "Panamanian" },
  { label: "Paraguayan", value: "Paraguayan" },
  { label: "Peruvian", value: "Peruvian" },
  { label: "Puerto Rican", value: "Puerto Rican" },
  { label: "Saint Lucian", value: "Saint Lucian" },
  { label: "Surinamese", value: "Surinamese" },
  { label: "Trinidadian", value: "Trinidadian" },
  { label: "Uruguayan", value: "Uruguayan" },
  { label: "Venezuelan", value: "Venezuelan" },
  // Asia
  { label: "Afghan", value: "Afghan" },
  { label: "Armenian", value: "Armenian" },
  { label: "Azerbaijani", value: "Azerbaijani" },
  { label: "Bahraini", value: "Bahraini" },
  { label: "Bangladeshi", value: "Bangladeshi" },
  { label: "Bhutanese", value: "Bhutanese" },
  { label: "Bruneian", value: "Bruneian" },
  { label: "Cambodian", value: "Cambodian" },
  { label: "Chinese", value: "Chinese" },
  { label: "Cypriot", value: "Cypriot" },
  { label: "Filipino", value: "Filipino" },
  { label: "Georgian", value: "Georgian" },
  { label: "Indian", value: "Indian" },
  { label: "Indonesian", value: "Indonesian" },
  { label: "Iranian", value: "Iranian" },
  { label: "Iraqi", value: "Iraqi" },
  { label: "Israeli", value: "Israeli" },
  { label: "Japanese", value: "Japanese" },
  { label: "Jordanian", value: "Jordanian" },
  { label: "Kazakhstani", value: "Kazakhstani" },
  { label: "Kuwaiti", value: "Kuwaiti" },
  { label: "Kyrgyzstani", value: "Kyrgyzstani" },
  { label: "Laotian", value: "Laotian" },
  { label: "Lebanese", value: "Lebanese" },
  { label: "Malaysian", value: "Malaysian" },
  { label: "Maldivian", value: "Maldivian" },
  { label: "Mongolian", value: "Mongolian" },
  { label: "Myanmarese", value: "Myanmarese" },
  { label: "Nepalese", value: "Nepalese" },
  { label: "North Korean", value: "North Korean" },
  { label: "Omani", value: "Omani" },
  { label: "Pakistani", value: "Pakistani" },
  { label: "Palestinian", value: "Palestinian" },
  { label: "Qatari", value: "Qatari" },
  { label: "Saudi Arabian", value: "Saudi Arabian" },
  { label: "Singaporean", value: "Singaporean" },
  { label: "South Korean", value: "South Korean" },
  { label: "Sri Lankan", value: "Sri Lankan" },
  { label: "Syrian", value: "Syrian" },
  { label: "Taiwanese", value: "Taiwanese" },
  { label: "Tajik", value: "Tajik" },
  { label: "Thai", value: "Thai" },
  { label: "Timorese", value: "Timorese" },
  { label: "Turkmenistani", value: "Turkmenistani" },
  { label: "Emirati", value: "Emirati" },
  { label: "Uzbekistani", value: "Uzbekistani" },
  { label: "Vietnamese", value: "Vietnamese" },
  { label: "Yemeni", value: "Yemeni" },
  // Europe
  { label: "Albanian", value: "Albanian" },
  { label: "Andorran", value: "Andorran" },
  { label: "Austrian", value: "Austrian" },
  { label: "Belarusian", value: "Belarusian" },
  { label: "Belgian", value: "Belgian" },
  { label: "Bosnian", value: "Bosnian" },
  { label: "British", value: "British" },
  { label: "Bulgarian", value: "Bulgarian" },
  { label: "Croatian", value: "Croatian" },
  { label: "Czech", value: "Czech" },
  { label: "Danish", value: "Danish" },
  { label: "Dutch", value: "Dutch" },
  { label: "Estonian", value: "Estonian" },
  { label: "Finnish", value: "Finnish" },
  { label: "French", value: "French" },
  { label: "German", value: "German" },
  { label: "Greek", value: "Greek" },
  { label: "Hungarian", value: "Hungarian" },
  { label: "Icelandic", value: "Icelandic" },
  { label: "Irish", value: "Irish" },
  { label: "Italian", value: "Italian" },
  { label: "Kosovar", value: "Kosovar" },
  { label: "Latvian", value: "Latvian" },
  { label: "Liechtensteiner", value: "Liechtensteiner" },
  { label: "Lithuanian", value: "Lithuanian" },
  { label: "Luxembourger", value: "Luxembourger" },
  { label: "Macedonian", value: "Macedonian" },
  { label: "Maltese", value: "Maltese" },
  { label: "Moldovan", value: "Moldovan" },
  { label: "Monégasque", value: "Monégasque" },
  { label: "Montenegrin", value: "Montenegrin" },
  { label: "Norwegian", value: "Norwegian" },
  { label: "Polish", value: "Polish" },
  { label: "Portuguese", value: "Portuguese" },
  { label: "Romanian", value: "Romanian" },
  { label: "Russian", value: "Russian" },
  { label: "San Marinese", value: "San Marinese" },
  { label: "Serbian", value: "Serbian" },
  { label: "Slovak", value: "Slovak" },
  { label: "Slovenian", value: "Slovenian" },
  { label: "Spanish", value: "Spanish" },
  { label: "Swedish", value: "Swedish" },
  { label: "Swiss", value: "Swiss" },
  { label: "Turkish", value: "Turkish" },
  { label: "Ukrainian", value: "Ukrainian" },
  { label: "Vatican", value: "Vatican" },
  // Oceania
  { label: "Australian", value: "Australian" },
  { label: "Fijian", value: "Fijian" },
  { label: "Kiribatian", value: "Kiribatian" },
  { label: "Marshallese", value: "Marshallese" },
  { label: "Micronesian", value: "Micronesian" },
  { label: "Nauruan", value: "Nauruan" },
  { label: "New Zealander", value: "New Zealander" },
  { label: "Ni-Vanuatu", value: "Ni-Vanuatu" },
  { label: "Palauan", value: "Palauan" },
  { label: "Papua New Guinean", value: "Papua New Guinean" },
  { label: "Samoan", value: "Samoan" },
  { label: "Solomon Islander", value: "Solomon Islander" },
  { label: "Tongan", value: "Tongan" },
  { label: "Tuvaluan", value: "Tuvaluan" },
  // Other / prefer not to say
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
    ? NATIONALITIES.filter((n) => n.label.toLowerCase().includes(search.toLowerCase()))
    : NATIONALITIES;

  // Focus search input when popover opens
  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 50);
    } else {
      setSearch("");
    }
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
            {value || "Select nationality"}
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
            placeholder="Search nationality..."
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

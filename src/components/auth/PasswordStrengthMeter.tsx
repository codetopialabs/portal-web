"use client";

import { Check, X } from "lucide-react";

const criteria = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "Contains a number", test: (p: string) => /\d/.test(p) },
  { label: "Contains uppercase", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Contains lowercase", test: (p: string) => /[a-z]/.test(p) },
  { label: "Contains special character", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

const strengthConfig = [
  { label: "Weak",   color: "bg-red-500" },
  { label: "Fair",   color: "bg-orange-400" },
  { label: "Good",   color: "bg-yellow-400" },
  { label: "Strong", color: "bg-emerald-500" },
];

export function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null;

  const passed = criteria.filter((c) => c.test(password)).length;
  // 0 passed → index -1 (no bar), 1-2 → Weak, 3 → Fair, 4 → Good, 5 → Strong
  const strengthIndex = passed === 0 ? -1 : passed <= 2 ? 0 : passed === 3 ? 1 : passed === 4 ? 2 : 3;
  const strength = strengthIndex >= 0 ? strengthConfig[strengthIndex] : null;

  return (
    <div className="space-y-3 mt-2">
      {/* Segmented bar */}
      <div className="flex gap-1">
        {strengthConfig.map((s, i) => (
          <div
            key={s.label}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              strengthIndex >= i ? s.color : "bg-zinc-700"
            }`}
          />
        ))}
      </div>

      {strength && (
        <p className={`text-xs font-mono ${strengthConfig[strengthIndex].color.replace("bg-", "text-")}`}>
          {strength.label}
        </p>
      )}

      {/* Criteria list */}
      <ul className="space-y-1">
        {criteria.map((c) => {
          const ok = c.test(password);
          return (
            <li key={c.label} className="flex items-center gap-2 text-xs font-mono">
              {ok
                ? <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                : <X className="w-3 h-3 text-zinc-600 shrink-0" />}
              <span className={ok ? "text-zinc-300" : "text-zinc-500"}>{c.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

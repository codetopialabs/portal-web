"use client";

import { ChevronDown, Filter, GripVertical, Plus, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import type { AdminMember } from "@/types/users.types";

/* ── Field definitions ───────────────────────────────────────────────────── */

type FieldType = "text" | "select" | "boolean" | "date" | "multiselect";

interface FieldDef {
  key: keyof AdminMember | "dormant";
  label: string;
  type: FieldType;
  options?: { value: string; label: string }[];
}

const FIELDS: FieldDef[] = [
  {
    key: "isActive",
    label: "Status",
    type: "select",
    options: [
      { value: "true", label: "Active" },
      { value: "false", label: "Suspended" },
    ],
  },
  {
    key: "isEmailVerified",
    label: "Email verified",
    type: "boolean",
    options: [
      { value: "true", label: "Yes" },
      { value: "false", label: "No" },
    ],
  },
  {
    key: "isOnboarded",
    label: "Onboarded",
    type: "boolean",
    options: [
      { value: "true", label: "Yes" },
      { value: "false", label: "No" },
    ],
  },
  {
    key: "isFlagged",
    label: "Flagged",
    type: "boolean",
    options: [
      { value: "true", label: "Yes" },
      { value: "false", label: "No" },
    ],
  },
  {
    key: "dormant",
    label: "Dormant (15+ days)",
    type: "boolean",
    options: [
      { value: "true", label: "Yes" },
      { value: "false", label: "No" },
    ],
  },
  { key: "primaryRole", label: "Primary role", type: "text" },
  {
    key: "discipline",
    label: "Discipline",
    type: "select",
    options: [
      { value: "software_engineering", label: "Software Engineering" },
      { value: "design", label: "Design" },
      { value: "product_management", label: "Product Management" },
      { value: "data_science", label: "Data Science" },
      { value: "devops", label: "DevOps" },
      { value: "marketing", label: "Marketing" },
      { value: "other", label: "Other" },
    ],
  },
  {
    key: "experienceLevel",
    label: "Experience level",
    type: "select",
    options: [
      { value: "beginner", label: "Beginner" },
      { value: "intermediate", label: "Intermediate" },
      { value: "senior", label: "Senior" },
      { value: "lead", label: "Lead" },
      { value: "principal", label: "Principal" },
    ],
  },
  { key: "location", label: "Location", type: "text" },
  { key: "gender", label: "Gender", type: "text" },
  { key: "joinedAt", label: "Joined", type: "date" },
  { key: "lastLoginAt", label: "Last login", type: "date" },
  { key: "skills", label: "Skills (contains)", type: "text" },
  {
    key: "githubHandle",
    label: "Has GitHub",
    type: "boolean",
    options: [
      { value: "true", label: "Yes" },
      { value: "false", label: "No" },
    ],
  },
];

/* ── Operator definitions ────────────────────────────────────────────────── */

type Operator =
  | "is"
  | "is_not"
  | "contains"
  | "not_contains"
  | "before"
  | "after"
  | "is_empty"
  | "is_not_empty";

interface OperatorDef {
  value: Operator;
  label: string;
  noValue?: boolean;
}

const OPERATORS_BY_TYPE: Record<FieldType, OperatorDef[]> = {
  text: [
    { value: "contains", label: "contains" },
    { value: "not_contains", label: "doesn't contain" },
    { value: "is", label: "is exactly" },
    { value: "is_not", label: "is not" },
    { value: "is_empty", label: "is empty", noValue: true },
    { value: "is_not_empty", label: "is not empty", noValue: true },
  ],
  select: [
    { value: "is", label: "is" },
    { value: "is_not", label: "is not" },
  ],
  boolean: [{ value: "is", label: "is" }],
  multiselect: [
    { value: "is", label: "is any of" },
    { value: "is_not", label: "is none of" },
  ],
  date: [
    { value: "before", label: "before" },
    { value: "after", label: "after" },
    { value: "is_empty", label: "never", noValue: true },
    { value: "is_not_empty", label: "has value", noValue: true },
  ],
};

/* ── Filter data model ───────────────────────────────────────────────────── */

export interface FilterCondition {
  id: string;
  field: FieldDef["key"];
  operator: Operator;
  value: string;
}

export interface FilterGroup {
  id: string;
  logic: "and" | "or";
  conditions: FilterCondition[];
}

export interface FilterQuery {
  logic: "and" | "or";
  groups: FilterGroup[];
  conditions: FilterCondition[];
}

function newCondition(field: FieldDef["key"] = "isActive"): FilterCondition {
  const def = FIELDS.find((f) => f.key === field) ?? FIELDS[0];
  const op = OPERATORS_BY_TYPE[def.type][0].value;
  const val = def.options?.[0]?.value ?? "";
  return { id: crypto.randomUUID(), field, operator: op, value: val };
}

function newGroup(): FilterGroup {
  return { id: crypto.randomUUID(), logic: "or", conditions: [newCondition()] };
}

export function emptyQuery(): FilterQuery {
  return { logic: "and", groups: [], conditions: [newCondition()] };
}

export function countActiveFilters(query: FilterQuery): number {
  return query.conditions.length + query.groups.reduce((s, g) => s + g.conditions.length, 0);
}

/* ── Apply filters client-side ───────────────────────────────────────────── */

const DORMANT_MS = 15 * 24 * 60 * 60 * 1000;

function evalCondition(member: AdminMember, cond: FilterCondition): boolean {
  const { field, operator, value } = cond;

  if (field === "dormant") {
    const ref = member.lastLoginAt ?? member.createdAt;
    const isDormant = member.isActive && !!ref && Date.now() - new Date(ref).getTime() > DORMANT_MS;
    return operator === "is" ? (value === "true" ? isDormant : !isDormant) : false;
  }

  const raw = member[field as keyof AdminMember];

  if (operator === "is_empty")
    return (
      raw === null || raw === undefined || raw === "" || (Array.isArray(raw) && raw.length === 0)
    );
  if (operator === "is_not_empty")
    return (
      raw !== null && raw !== undefined && raw !== "" && !(Array.isArray(raw) && raw.length === 0)
    );

  if (field === "skills" && Array.isArray(raw)) {
    const term = value.toLowerCase();
    if (operator === "contains")
      return (raw as string[]).some((s) => s.toLowerCase().includes(term));
    if (operator === "not_contains")
      return !(raw as string[]).some((s) => s.toLowerCase().includes(term));
  }

  if (typeof raw === "boolean") {
    const boolVal = value === "true";
    return operator === "is" ? raw === boolVal : raw !== boolVal;
  }

  const strRaw = String(raw ?? "").toLowerCase();
  const strVal = value.toLowerCase();
  if (operator === "is") return strRaw === strVal;
  if (operator === "is_not") return strRaw !== strVal;
  if (operator === "contains") return strRaw.includes(strVal);
  if (operator === "not_contains") return !strRaw.includes(strVal);
  if (operator === "before") {
    const d = new Date(raw as string);
    return !Number.isNaN(d.getTime()) && d < new Date(value);
  }
  if (operator === "after") {
    const d = new Date(raw as string);
    return !Number.isNaN(d.getTime()) && d > new Date(value);
  }

  return true;
}

export function applyFilterQuery(members: AdminMember[], query: FilterQuery): AdminMember[] {
  const allConditions = query.conditions;
  const allGroups = query.groups;
  if (allConditions.length === 0 && allGroups.length === 0) return members;
  return members.filter((m) => {
    const topResults = allConditions.map((c) => evalCondition(m, c));
    const groupResults = allGroups.map((g) => {
      const results = g.conditions.map((c) => evalCondition(m, c));
      return g.logic === "or" ? results.some(Boolean) : results.every(Boolean);
    });
    const combined = [...topResults, ...groupResults];
    return query.logic === "or" ? combined.some(Boolean) : combined.every(Boolean);
  });
}

/* ── Styled select ───────────────────────────────────────────────────────── */

function StyledSelect({
  value,
  onChange,
  options,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  const current = options.find((o) => o.value === value);
  return (
    <div className={`relative inline-flex ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none h-8 border border-zinc-200 bg-white pl-3 pr-7 font-mono text-xs text-zinc-800 outline-none focus:border-zinc-900 hover:border-zinc-400 transition-colors cursor-pointer w-full"
        aria-label={current?.label}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-zinc-400" />
    </div>
  );
}

/* ── Logic pill ──────────────────────────────────────────────────────────── */

function LogicToggle({
  value,
  onChange,
}: {
  value: "and" | "or";
  onChange: (v: "and" | "or") => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(value === "and" ? "or" : "and")}
      className="inline-flex h-6 items-center gap-1 border border-zinc-300 bg-zinc-50 px-2.5 font-mono text-[10px] font-bold text-zinc-600 transition-colors hover:border-zinc-900 hover:bg-white hover:text-zinc-900"
    >
      {value === "and" ? "AND" : "OR"}
      <span className="text-[9px] opacity-50">⇄</span>
    </button>
  );
}

/* ── Condition row ───────────────────────────────────────────────────────── */

function ConditionRow({
  condition,
  onChange,
  onDelete,
  showDelete,
}: {
  condition: FilterCondition;
  onChange: (c: FilterCondition) => void;
  onDelete: () => void;
  showDelete: boolean;
}) {
  const fieldDef = FIELDS.find((f) => f.key === condition.field) ?? FIELDS[0];
  const operators = OPERATORS_BY_TYPE[fieldDef.type];
  const activeOp = operators.find((o) => o.value === condition.operator) ?? operators[0];

  function handleFieldChange(key: string) {
    const def = FIELDS.find((f) => f.key === key);
    if (!def) return;
    const op = OPERATORS_BY_TYPE[def.type][0].value;
    const val = def.options?.[0]?.value ?? "";
    onChange({ ...condition, field: key as FieldDef["key"], operator: op, value: val });
  }

  function handleOperatorChange(op: string) {
    const opDef = operators.find((o) => o.value === op);
    onChange({
      ...condition,
      operator: op as Operator,
      value: opDef?.noValue ? "" : condition.value,
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <GripVertical className="h-4 w-4 shrink-0 text-zinc-200" />

      {/* Field */}
      <StyledSelect
        value={condition.field as string}
        onChange={handleFieldChange}
        options={FIELDS.map((f) => ({ value: f.key as string, label: f.label }))}
        className="min-w-[130px]"
      />

      {/* Operator */}
      <StyledSelect
        value={condition.operator}
        onChange={handleOperatorChange}
        options={operators.map((o) => ({ value: o.value, label: o.label }))}
        className="min-w-[120px]"
      />

      {/* Value */}
      {!activeOp.noValue &&
        (fieldDef.options ? (
          <StyledSelect
            value={condition.value}
            onChange={(v) => onChange({ ...condition, value: v })}
            options={fieldDef.options}
            className="min-w-[110px]"
          />
        ) : fieldDef.type === "date" ? (
          <input
            type="date"
            value={condition.value}
            onChange={(e) => onChange({ ...condition, value: e.target.value })}
            className="h-8 border border-zinc-200 bg-white px-2.5 font-mono text-xs text-zinc-800 outline-none focus:border-zinc-900 hover:border-zinc-400 transition-colors"
          />
        ) : (
          <Input
            value={condition.value}
            onChange={(e) => onChange({ ...condition, value: e.target.value })}
            placeholder="Value…"
            className="h-8 w-32 rounded-none border-zinc-200 font-mono text-xs"
          />
        ))}

      {showDelete && (
        <button
          type="button"
          onClick={onDelete}
          aria-label="Remove condition"
          className="ml-auto shrink-0 text-zinc-300 transition-colors hover:text-red-500"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

/* ── Group block ─────────────────────────────────────────────────────────── */

function GroupBlock({
  group,
  onChange,
  onDelete,
}: {
  group: FilterGroup;
  onChange: (g: FilterGroup) => void;
  onDelete: () => void;
}) {
  function updateCondition(idx: number, c: FilterCondition) {
    const conditions = [...group.conditions];
    conditions[idx] = c;
    onChange({ ...group, conditions });
  }

  function addCondition() {
    onChange({ ...group, conditions: [...group.conditions, newCondition()] });
  }

  function removeCondition(idx: number) {
    const conditions = group.conditions.filter((_, i) => i !== idx);
    if (conditions.length === 0) {
      onDelete();
      return;
    }
    onChange({ ...group, conditions });
  }

  return (
    <div className="border border-zinc-200 bg-zinc-50 p-3 space-y-2.5">
      {/* Group header */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] text-zinc-400">
          {group.logic === "or" ? "Any of the following:" : "All of the following:"}
        </span>
        <LogicToggle value={group.logic} onChange={(v) => onChange({ ...group, logic: v })} />
        <button
          type="button"
          onClick={onDelete}
          aria-label="Delete group"
          className="ml-auto text-zinc-300 transition-colors hover:text-red-500"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Conditions */}
      <div className="space-y-2 pl-1">
        {group.conditions.map((c, i) => (
          <div key={c.id} className="flex items-start gap-2">
            <span className="mt-2 w-6 shrink-0 text-right font-mono text-[9px] font-bold uppercase text-zinc-300">
              {i === 0 ? "" : group.logic}
            </span>
            <div className="flex-1">
              <ConditionRow
                condition={c}
                onChange={(u) => updateCondition(i, u)}
                onDelete={() => removeCondition(i)}
                showDelete
              />
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addCondition}
        className="flex items-center gap-1.5 pl-8 font-mono text-[11px] font-bold text-zinc-400 transition-colors hover:text-zinc-900"
      >
        <Plus className="h-3 w-3" />
        Add condition
      </button>
    </div>
  );
}

/* ── Filter panel ────────────────────────────────────────────────────────── */

function FilterPanel({
  query,
  onChange,
  onClose,
  onClear,
}: {
  query: FilterQuery;
  onChange: (q: FilterQuery) => void;
  onClose: () => void;
  onClear: () => void;
}) {
  function updateCondition(idx: number, c: FilterCondition) {
    const conditions = [...query.conditions];
    conditions[idx] = c;
    onChange({ ...query, conditions });
  }

  function removeCondition(idx: number) {
    const conditions = query.conditions.filter((_, i) => i !== idx);
    // always keep at least one condition
    onChange({ ...query, conditions: conditions.length ? conditions : [newCondition()] });
  }

  function addCondition() {
    onChange({ ...query, conditions: [...query.conditions, newCondition()] });
  }

  function addGroup() {
    onChange({ ...query, groups: [...query.groups, newGroup()] });
  }

  function updateGroup(idx: number, g: FilterGroup) {
    const groups = [...query.groups];
    groups[idx] = g;
    onChange({ ...query, groups });
  }

  function removeGroup(idx: number) {
    onChange({ ...query, groups: query.groups.filter((_, i) => i !== idx) });
  }

  const totalCount = countActiveFilters(query);
  const hasMultiple = query.conditions.length > 1 || query.groups.length > 0;

  return (
    <div className="w-[580px] max-w-[calc(100vw-32px)] border border-zinc-200 bg-white shadow-xl shadow-zinc-900/10">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <Filter className="h-3.5 w-3.5 text-zinc-500" />
          <span className="font-mono text-xs font-bold text-zinc-700">Filter members</span>
          {totalCount > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center bg-zinc-900 px-1 font-mono text-[9px] font-bold text-white">
              {totalCount}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-zinc-400 transition-colors hover:text-zinc-900"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Body */}
      <div className="max-h-[480px] overflow-y-auto p-4 space-y-3">
        {/* Top-level logic toggle */}
        {hasMultiple && (
          <div className="flex items-center gap-2 pb-0.5">
            <span className="font-mono text-[10px] text-zinc-400">Match</span>
            <LogicToggle value={query.logic} onChange={(v) => onChange({ ...query, logic: v })} />
            <span className="font-mono text-[10px] text-zinc-400">of the following</span>
          </div>
        )}

        {/* Top-level conditions */}
        {query.conditions.map((c, i) => (
          <div key={c.id} className="flex items-start gap-2">
            <span className="mt-2 w-8 shrink-0 text-right font-mono text-[9px] font-bold uppercase text-zinc-400">
              {i === 0 ? "where" : query.logic}
            </span>
            <div className="flex-1">
              <ConditionRow
                condition={c}
                onChange={(u) => updateCondition(i, u)}
                onDelete={() => removeCondition(i)}
                showDelete={hasMultiple}
              />
            </div>
          </div>
        ))}

        {/* Groups */}
        {query.groups.map((g, i) => (
          <div key={g.id} className="flex items-start gap-2">
            <span className="mt-3 w-8 shrink-0 text-right font-mono text-[9px] font-bold uppercase text-zinc-400">
              {query.logic}
            </span>
            <div className="flex-1">
              <GroupBlock
                group={g}
                onChange={(u) => updateGroup(i, u)}
                onDelete={() => removeGroup(i)}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-zinc-200 bg-zinc-50 px-4 py-3">
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={addCondition}
            className="flex items-center gap-1.5 font-mono text-xs font-bold text-zinc-500 transition-colors hover:text-zinc-900"
          >
            <Plus className="h-3.5 w-3.5" />
            Add condition
          </button>
          <button
            type="button"
            onClick={addGroup}
            className="flex items-center gap-1.5 font-mono text-xs font-bold text-zinc-500 transition-colors hover:text-zinc-900"
          >
            <Plus className="h-3.5 w-3.5" />
            Add group
          </button>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="font-mono text-xs text-zinc-400 transition-colors hover:text-zinc-900"
        >
          Clear all
        </button>
      </div>
    </div>
  );
}

/* ── Trigger button + panel ──────────────────────────────────────────────── */

export function MemberFilterBuilder({
  query,
  onChange,
}: {
  query: FilterQuery;
  onChange: (q: FilterQuery) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const count = countActiveFilters(query);
  const isActive = count > 0;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      {/* Trigger — plain div so we fully control all states, no Button override */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={[
          "inline-flex h-10 items-center gap-2 border px-4 font-mono text-xs font-bold transition-colors",
          isActive
            ? "border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800 hover:border-zinc-800"
            : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50 hover:text-zinc-900",
        ].join(" ")}
      >
        <Filter className="h-3.5 w-3.5 shrink-0" />
        Filters
        {isActive && (
          <span className="flex h-4 min-w-4 items-center justify-center bg-white/25 px-1 font-mono text-[9px] font-bold text-white">
            {count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1.5">
          <FilterPanel
            query={query}
            onChange={onChange}
            onClose={() => setOpen(false)}
            onClear={() => onChange(emptyQuery())}
          />
        </div>
      )}
    </div>
  );
}

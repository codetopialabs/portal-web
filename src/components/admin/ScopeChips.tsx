/** Compact, overflowing list of permission scope chips with a `*` highlight. */
export function ScopeChips({
  scopes,
  max = 4,
  emptyLabel = "—",
}: {
  scopes: string[];
  max?: number;
  emptyLabel?: string;
}) {
  if (scopes.length === 0) {
    return <span className="font-mono text-xs text-text-tertiary">{emptyLabel}</span>;
  }

  const shown = scopes.slice(0, max);
  const extra = scopes.length - shown.length;

  return (
    <div className="flex flex-wrap gap-1.5" title={scopes.join(", ")}>
      {shown.map((scope) => (
        <span
          key={scope}
          className={`inline-flex items-center border px-2 py-0.5 font-mono text-[10px] ${
            scope === "*"
              ? "border-grey-900 bg-grey-900 font-bold text-white"
              : "border-grey-200 bg-white text-text-secondary"
          }`}
        >
          {scope === "*" ? "full access" : scope}
        </span>
      ))}
      {extra > 0 && (
        <span className="inline-flex items-center border border-grey-200 bg-white px-2 py-0.5 font-mono text-[10px] font-bold text-text-secondary">
          +{extra}
        </span>
      )}
    </div>
  );
}

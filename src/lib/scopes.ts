/**
 * Shared helpers for displaying permission scopes compactly across the admin UI
 * (API keys, roles). Kept framework-agnostic so it can be unit-tested in isolation.
 */

/** Split a codename into [resource, action], handling multi-segment actions. */
export function resourceOf(codename: string): [string, string] {
  const dot = codename.indexOf(".");
  if (dot === -1) return [codename, ""];
  return [codename.slice(0, dot), codename.slice(dot + 1)];
}

/** Build resource -> set of all actions it defines, from the permission vocabulary. */
export function buildPermissionVocab(
  permissions: { codename: string }[]
): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();
  for (const p of permissions) {
    const [resource, action] = resourceOf(p.codename);
    if (!map.has(resource)) map.set(resource, new Set());
    if (action) map.get(resource)?.add(action);
  }
  return map;
}

/**
 * Collapse a permission list for compact display:
 *  - "*"                         → "*"               (full access)
 *  - all of a resource's actions → "resource.*"
 *  - several actions             → "resource.[a, b]"
 *  - a single action             → "resource.action"
 * `vocab` maps each resource to the full set of actions it defines.
 */
export function compressScopes(perms: string[], vocab: Map<string, Set<string>>): string[] {
  if (perms.includes("*")) return ["*"];

  const explicitWildcard = new Set<string>();
  const byResource = new Map<string, Set<string>>();
  for (const p of perms) {
    const [resource, action] = resourceOf(p);
    if (action === "*") explicitWildcard.add(resource);
    if (!byResource.has(resource)) byResource.set(resource, new Set());
    byResource.get(resource)?.add(action);
  }

  const out: string[] = [];
  for (const [resource, actions] of byResource) {
    const all = vocab.get(resource);
    const coversAll = !!all && all.size > 0 && [...all].every((a) => actions.has(a));
    if (explicitWildcard.has(resource) || coversAll) {
      out.push(`${resource}.*`);
      continue;
    }
    const list = [...actions].filter((a) => a !== "*").sort();
    out.push(list.length === 1 ? `${resource}.${list[0]}` : `${resource}.[${list.join(", ")}]`);
  }
  return out.sort();
}

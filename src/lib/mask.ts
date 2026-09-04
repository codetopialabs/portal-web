/**
 * Masks for values that shouldn't be readable over someone's shoulder or in a
 * shared screen. Each mask keeps enough shape for the owner to recognise the
 * value ("that's my home IP") without it being transcribable by a viewer.
 */

const DOT = "•";

/** `102.176.4.21` → `102.•••.•••.•••` · `2a02:8109:…` → `2a02:••••:••••` */
export function maskIpAddress(ip: string): string {
  const trimmed = ip.trim();
  if (!trimmed) return "";

  if (trimmed.includes(":")) {
    const groups = trimmed.split(":");
    const [first, ...rest] = groups;
    return [first, ...rest.map(() => DOT.repeat(4))].join(":");
  }

  const octets = trimmed.split(".");
  if (octets.length !== 4) return DOT.repeat(8);

  const [first, ...rest] = octets;
  return [first, ...rest.map(() => DOT.repeat(3))].join(".");
}

/** `seph@algogroup.io` → `s•••@a•••.io` */
export function maskEmail(email: string): string {
  const trimmed = email.trim();
  if (!trimmed) return "";

  const at = trimmed.lastIndexOf("@");
  if (at < 1) return DOT.repeat(8);

  const local = trimmed.slice(0, at);
  const domain = trimmed.slice(at + 1);
  // Fixed-width so the mask never leaks how long the real value is.
  const maskedLocal = `${local[0]}${DOT.repeat(3)}`;

  const dot = domain.lastIndexOf(".");
  if (dot < 1) return `${maskedLocal}@${DOT.repeat(3)}`;

  const name = domain.slice(0, dot);
  const tld = domain.slice(dot);
  return `${maskedLocal}@${name[0]}${DOT.repeat(3)}${tld}`;
}

export function maskValue(value: string, kind: "ip" | "email" | "text"): string {
  if (kind === "ip") return maskIpAddress(value);
  if (kind === "email") return maskEmail(value);
  return DOT.repeat(8);
}

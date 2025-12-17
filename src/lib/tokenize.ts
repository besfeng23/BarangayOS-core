import { norm } from "@/lib/uuid";

export function buildTokens(...parts: string[]): string[] {
  const raw = parts
    .filter(Boolean)
    .join(" ")
    .split(/[,\n\r\t ]+/g)
    .map((x) => norm(x))
    .filter(Boolean);

  const uniq = new Set<string>();
  raw.forEach((t) => uniq.add(t));
  return Array.from(uniq);
}

import { uuid, norm } from "@/lib/uuid";

export function generateCaseNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const hash = uuid().replace(/-/g, "").substring(0, 6).toUpperCase();
  return `${year}-${month}-${hash}`;
}

export function tokenize(...parts: string[]): string[] {
  const raw = norm(parts.filter(Boolean).join(" "));
  if (!raw) return [];
  const words = raw.split(" ").filter(Boolean);

  // Add ID-tail search support (last 4-6 chars typed by secretary)
  const tails: string[] = [];
  parts.forEach((p) => {
    const s = norm(p).replace(/[^a-z0-9]/g, "");
    if (s.length >= 4) tails.push(s.slice(-4), s.slice(-6));
  });

  const set = new Set<string>([...words, ...tails].filter(Boolean));
  return Array.from(set).slice(0, 32); // cap for sanity
}

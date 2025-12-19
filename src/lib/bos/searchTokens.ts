export function toTokens(input: string) {
  const s = (input ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!s) return [];
  const parts = s.split(" ");
  const tokens: string[] = [];
  for (const p of parts) {
    if (!p) continue;
    tokens.push(p);
    const max = Math.min(6, p.length);
    for (let i = 2; i <= max; i++) tokens.push(p.slice(0, i));
  }
  return Array.from(new Set(tokens));
}

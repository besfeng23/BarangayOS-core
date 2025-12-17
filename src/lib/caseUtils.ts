import { uuid } from "@/lib/uuid";

// YYYY-MM-XXXXXX
export function generateCaseNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const hash = uuid().replace(/-/g, "").substring(0, 6).toUpperCase();
  return `${year}-${month}-${hash}`;
}

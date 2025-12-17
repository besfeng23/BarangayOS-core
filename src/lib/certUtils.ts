import { uuid } from "@/lib/uuid";

export type CertType = "CERTIFICATE" | "CLEARANCE" | "INDIGENCY";

// Format: YYYY-MM-[6-CHAR-HASH]
export function generateControlNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const hash = uuid().replace(/-/g, "").substring(0, 6).toUpperCase();
  return `${year}-${month}-${hash}`;
}

export function getCertTitle(type: CertType): string {
  const map: Record<CertType, string> = {
    CERTIFICATE: "BARANGAY CERTIFICATION",
    CLEARANCE: "BARANGAY CLEARANCE",
    INDIGENCY: "CERTIFICATE OF INDIGENCY",
  };
  return map[type];
}

export function formatLongDate(ts = Date.now()): string {
  return new Date(ts).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

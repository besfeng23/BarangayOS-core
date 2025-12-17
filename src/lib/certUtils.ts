import { uuid } from "@/lib/uuid";

// Format: YYYY-MM-[6-CHAR-HASH]
export function generateControlNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const hash = uuid().replace(/-/g, "").substring(0, 6).toUpperCase();
  return `${year}-${month}-${hash}`;
}

export type CertType = "CERTIFICATE" | "CLEARANCE" | "INDIGENCY";

export function getCertTitle(type: CertType): string {
  const map: Record<CertType, string> = {
    CERTIFICATE: "BARANGAY CERTIFICATION",
    CLEARANCE: "BARANGAY CLEARANCE",
    INDIGENCY: "CERTIFICATE OF INDIGENCY",
  };
  return map[type];
}

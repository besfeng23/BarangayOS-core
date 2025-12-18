import { useState } from "react";
import { db } from "@/lib/bos/dexie/db";
import { clearDraft } from "@/lib/bos/localDraft";

export type CertificateDraft = {
  residentId: string;
  issuedToName: string;
  certificateType: "Barangay Clearance" | "Certificate of Indigency" | "Barangay Residency" | "Generic";
  purpose: string;
  customBody?: string;
};

export function useCertificateIssue(opts: {
  draftKey: string;
  enqueue: (job: { type: string; payload: any }) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [lastStatus, setLastStatus] = useState<string | null>(null);

  const issueQueueFirst = async (payload: any) => {
    // Offline invariant: queue first
    await opts.enqueue({ type: "CERTIFICATE_ISSUE", payload });
  };

  const auditLocal = async (eventType: string, details: any) => {
    await db.audit_queue.add({
      eventType,
      details,
      occurredAtISO: new Date().toISOString(),
      synced: 0,
    });
  };

  const issue = async (draft: CertificateDraft, printableMeta: any) => {
    setLoading(true);
    setLastError(null);
    setLastStatus(null);

    try {
      // Strict validation (no silent broken state)
      if (!draft.issuedToName?.trim()) throw new Error("Issued To (Name) is required.");
      if (!draft.purpose?.trim()) throw new Error("Purpose is required.");
      if (!draft.certificateType) throw new Error("Certificate type is required.");

      const controlNo = `BOS-${Date.now()}`;

      const payload = {
        ...draft,
        controlNo,
        issuedAtISO: new Date().toISOString(),
        printableMeta,
      };

      await issueQueueFirst(payload);
      await auditLocal("CERTIFICATE_QUEUED", { controlNo, certificateType: draft.certificateType });

      // Clear draft only after queue success
      clearDraft(opts.draftKey);

      setLastStatus("Queued for sync ✅");
      return { ok: true as const, controlNo };
    } catch (e: any) {
      const msg = e?.message ?? String(e);
      setLastError(msg);
      await auditLocal("CERTIFICATE_ERROR", { msg });
      return { ok: false as const, error: msg };
    } finally {
      setLoading(false);
    }
  };

  return { issue, loading, lastError, lastStatus };
}

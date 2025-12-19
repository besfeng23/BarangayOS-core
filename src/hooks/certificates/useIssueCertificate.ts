import { useCallback, useMemo, useState } from "react";
import { db, CertificateIssuanceLocal } from "@/lib/bosDb";
import { toTokens } from "@/lib/bos/searchTokens";
import { buildCertificateHTML } from "@/lib/certificates/templates";
import { useSettings } from "@/hooks/useSettings";
import { writeActivity } from "@/lib/bos/activity/writeActivity";

function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function makeControlNo() {
  // Simple, human-friendly, unique enough for local-first: YYYYMMDD-HHMMSS-XXXX
  const d = new Date();
  const pad = (n:number)=>String(n).padStart(2,"0");
  const stamp =
    `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  const rand = Math.random().toString(16).slice(2, 6).toUpperCase();
  return `${stamp}-${rand}`;
}

export type CertType = "Barangay Clearance" | "Certificate of Residency" | "Indigency" | "Business Clearance";

export function useIssueCertificate() {
  const settings = useSettings();

  const [printingHTML, setPrintingHTML] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [banner, setBanner] = useState<{ kind: "ok" | "error"; msg: string } | null>(null);

  const clearBanner = useCallback(() => setBanner(null), []);

  const issueAndPreparePrint = useCallback(async (args: {
    residentId: string;
    residentName: string;
    certType: CertType;
    purpose: string;
    enqueue: (job: { type: string; payload: any }) => Promise<void>;
  }) => {
    setBusy(true);
    setBanner(null);
    let issuance: CertificateIssuanceLocal | null = null;
    try {
      const { residentId, residentName, certType, purpose, enqueue } = args;

      if (!residentId) throw new Error("Select a resident.");
      if (!certType) throw new Error("Select certificate type.");
      if (!purpose?.trim()) throw new Error("Purpose is required.");

      const nowISO = new Date().toISOString();
      const issuanceId = uuid();

      issuance = {
        id: issuanceId,
        residentId,
        residentName,
        certType,
        purpose: purpose.trim(),
        controlNo: makeControlNo(),
        issuedAtISO: nowISO,
        issuedByName: settings.issuedByName,
        barangayName: settings.barangayName,
        municipalityCity: settings.municipalityCity,
        province: settings.province,
        status: "Issued",
        searchTokens: toTokens([residentName, residentId, certType, purpose, nowISO].join(" ")),
      };

      // 1) local write
      await db.certificate_issuances.put(issuance);

      // 2) print log local (for audit trail)
      await db.print_logs.add({
        issuanceId,
        residentId,
        certType,
        issuedAtISO: nowISO,
        synced: 0,
      });

      // 3) audit queue
      await writeActivity({
        type: "CERT_ISSUED",
        entityType: "certificate",
        entityId: issuance.id,
        status: "ok",
        title: "Certificate issued",
        subtitle: `${issuance.residentName} • ${issuance.certType} • ${issuance.controlNo}`,
        details: { residentId: issuance.residentId, certType: issuance.certType, controlNo: issuance.controlNo }
      });


      // 4) enqueue sync (never block printing)
      await enqueue({ type: "CERT_ISSUANCE_UPSERT", payload: issuance });
      await enqueue({ type: "PRINTLOG_UPSERT", payload: { issuanceId, residentId, certType, issuedAtISO: nowISO } });

      // 5) prepare print HTML (PrintFrame will print when html changes)
      const html = buildCertificateHTML(issuance);
      setPrintingHTML(html);

      setBanner({ kind: "ok", msg: "Saved & queued ✅ Printing…" });
      return { ok: true as const, issuanceId };
    } catch (e: any) {
      const msg = e?.message ?? String(e);
      setBanner({ kind: "error", msg });
      return { ok: false as const, error: msg };
    } finally {
      setBusy(false);
    }
  }, [settings]);

  const afterPrint = useCallback(() => {
    // clear html so repeated prints re-trigger
    setPrintingHTML(null);
    if(printingHTML) {
        // This is a bit of a hack, but we can extract info from the HTML string if needed
        // A better way would be to store the `issuance` object in state.
        // For now, let's assume we can't easily get the issuance object here.
        // This log will be less detailed.
        writeActivity({
            type: "CERT_PRINTED",
            entityType: "certificate",
            entityId: "unknown",
            status: "ok",
            title: "Certificate printed",
            subtitle: `A document was sent to the printer.`,
        });
    }
  }, [printingHTML]);

  return useMemo(() => ({
    busy,
    banner,
    printingHTML,
    issueAndPreparePrint,
    afterPrint,
    clearBanner,
  }), [busy, banner, printingHTML, issueAndPreparePrint, afterPrint, clearBanner]);
}

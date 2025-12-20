
import { useCallback, useMemo, useState } from "react";
import { db, CertificateIssuanceLocal } from "@/lib/bosDb";
import { toTokens } from "@/lib/bos/searchTokens";
import { buildCertificateHTML } from "@/lib/certificates/templates";
import { useSettings } from "@/lib/bos/settings/useSettings";
import { writeActivity } from "@/lib/bos/activity/writeActivity";
import { enqueuePrintJob } from "@/lib/bos/print/enqueuePrintJob";
import { performPrintJob } from "@/lib/bos/print/performPrintJob";


function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function makeControlNo(prefix: string) {
  const d = new Date();
  const pad = (n:number)=>String(n).padStart(2,"0");
  const stamp =
    `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  const rand = Math.random().toString(16).slice(2, 6).toUpperCase();
  return `${prefix}-${stamp}-${rand}`;
}

export type CertType = "Barangay Clearance" | "Certificate of Residency" | "Indigency" | "Business Clearance";

export function useIssueCertificate() {
  const { settings } = useSettings();

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
        controlNo: makeControlNo(settings.controlPrefix || "BRGY"),
        issuedAtISO: nowISO,
        issuedByName: settings.secretaryName,
        barangayName: settings.barangayName,
        municipalityCity: settings.barangayAddress, // Assuming address is municipality, province
        province: "", // This should be a separate field in settings
        status: "Issued",
        searchTokens: toTokens([residentName, residentId, certType, purpose, nowISO].join(" ")),
      };

      // 1) local write
      await db.certificate_issuances.put(issuance);

      // 2) audit queue
      await writeActivity({
        type: "CERT_ISSUED",
        entityType: "certificate",
        entityId: issuance.id,
        status: "ok",
        title: "Certificate issued",
        subtitle: `${issuance.residentName} • ${issuance.certType} • ${issuance.controlNo}`,
        details: { residentId: issuance.residentId, certType: issuance.certType, controlNo: issuance.controlNo }
      });


      // 3) enqueue sync (never block printing)
      await enqueue({ type: "CERT_ISSUANCE_UPSERT", payload: issuance });

      // 4) prepare print HTML
      const html = await buildCertificateHTML(issuance, settings);
      
      // 5) enqueue for print center
      const printJobId = await enqueuePrintJob({
        entityType: "certificate",
        entityId: issuance.id,
        docType: issuance.certType,
        title: issuance.certType,
        subtitle: `${issuance.residentName} • Control No: ${issuance.controlNo}`,
        html,
      });

      // 6) perform immediate print
      await performPrintJob(printJobId);

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
    // This is now handled by performPrintJob
  }, []);

  return useMemo(() => ({
    busy,
    banner,
    printingHTML: null, // PrintFrame is no longer needed on this page
    issueAndPreparePrint,
    afterPrint,
    clearBanner,
  }), [busy, banner, issueAndPreparePrint, afterPrint, clearBanner]);
}

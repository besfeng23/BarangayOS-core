
import { useCallback, useEffect, useState } from "react";
import { db, BlotterRecord } from "@/lib/bosDb";
import { uuid } from "@/lib/uuid";
import { generateControlNumber } from "@/lib/certUtils";
import { useSettings } from "@/lib/bos/settings/useSettings";

type DocType = "SUMMONS" | "AMICABLE";

export function useBlotterDocs() {
  const { settings } = useSettings();

  const [printJob, setPrintJob] = useState<null | {
    docType: DocType;
    controlNo: string;
    dateIssued: string;
    signerName: string;
    signerTitle: string;
    barangayLine: string;
    blotter: BlotterRecord;
  }>(null);

  const [isPrinting, setIsPrinting] = useState(false);

  // Clean up printing state safely
  useEffect(() => {
    const onAfter = () => {
      setIsPrinting(false);
      setPrintJob(null);
    };
    window.addEventListener("afterprint", onAfter);
    return () => window.removeEventListener("afterprint", onAfter);
  }, []);

  const issueAndPrint = useCallback(async (blotter: BlotterRecord, docType: DocType) => {
    const now = Date.now();
    const controlNo = generateControlNumber();
    const logId = uuid();

    const barangayLine = `${settings.barangayName}, ${settings.barangayAddress}`;
    const signerName = settings.punongBarangay || "Hon. Barangay Captain";
    const signerTitle = "Punong Barangay";

    // 1) Audit to local printLogs + sync_queue (atomic)
    await db.transaction("rw", db.print_logs, db.sync_queue, async () => {
      await db.print_logs.add({
        id: logId as any, // Dexie handles auto-incrementing if `id` is `++id`
        barangayId: blotter.barangayId,
        createdAt: now,
        docType,
        controlNo,
        blotterId: blotter.id,
        status: "pending",
        tryCount: 0,
        meta: { signerName, signerTitle, caseNumber: blotter.caseNumber },
      } as any);

      await db.sync_queue.add({
        id: uuid() as any,
        entityType: "print_log" as any,
        entityId: logId,
        op: "UPSERT",
        payload: {
          id: logId,
          barangayId: blotter.barangayId,
          createdAt: now,
          docType,
          controlNo,
          blotterId: blotter.id,
          meta: { signerName, signerTitle, caseNumber: blotter.caseNumber },
        },
        occurredAtISO: new Date(now).toISOString(),
        status: "pending",
        tryCount: 0,
      } as any);
    });

    // 2) Prepare DOM data then print
    setIsPrinting(true);
    setPrintJob({
      docType,
      controlNo,
      dateIssued: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      signerName,
      signerTitle,
      barangayLine,
      blotter,
    });

    // ensure DOM commits before print
    requestAnimationFrame(() => {
      requestAnimationFrame(() => window.print());
    });
  }, [settings]);

  return { printJob, isPrinting, issueAndPrint };
}

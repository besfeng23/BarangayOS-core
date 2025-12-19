
import { useState } from "react";
import { db } from "@/lib/bosDb";
import { uuid } from "@/lib/uuid";

export type BlotterDocType = "BLOTTER_SUMMONS" | "BLOTTER_SETTLEMENT";

type PrintPayload = {
  blotterId: string;
  caseNumber: string;
  docType: BlotterDocType;
  meta?: any;
};

export function useBlotterPrint() {
  const [printData, setPrintData] = useState<any>(null);

  async function auditPrint(payload: PrintPayload) {
    const now = Date.now();
    const logId = uuid();

    await db.transaction("rw", db.print_logs, db.syncQueue, async () => {
      // printLogs table must already exist from Certificate Engine integration
      await db.print_logs.add({
        id: logId as any,
        createdAt: now,
        docType: payload.docType,
        controlNo: payload.caseNumber,
        residentId: "", // not applicable
        blotterId: payload.blotterId,
        status: "pending",
        tryCount: 0,
        meta: payload.meta || {},
      } as any);

      await db.syncQueue.add({
        id: uuid() as any,
        entityType: "print_log" as any,
        entityId: logId,
        op: "UPSERT" as any,
        payload,
        createdAt: now,
        updatedAt: now,
        status: "pending",
        tryCount: 0,
      } as any);
    });
  }

  async function printNow(data: any, audit: PrintPayload) {
    // 1) audit first (offline-safe)
    await auditPrint(audit);

    // 2) set print state so templates render into #print-container
    setPrintData(data);

    // 3) give React one paint, then print
    setTimeout(() => window.print(), 60);

    // 4) cleanup after print dialog
    setTimeout(() => setPrintData(null), 500);
  }

  return { printData, printNow, setPrintData };
}

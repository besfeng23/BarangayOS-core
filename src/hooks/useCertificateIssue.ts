import { useState } from "react";
import { db, ResidentRecord } from "@/lib/bosDb";
import { generateControlNumber } from "@/lib/certUtils";
import { uuid } from "@/lib/uuid";
import { logTransaction } from "@/lib/transactions";
import { useToast } from "@/components/ui/toast";

export type CertType = "CERTIFICATE" | "CLEARANCE" | "INDIGENCY";

function formatLongDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
}

export function useCertificateIssue() {
  const [isPrinting, setIsPrinting] = useState(false);
  const { toast } = useToast();

  const issueCertificate = async (
    resident: ResidentRecord,
    type: CertType,
    officialSigner: string
  ) => {
    setIsPrinting(true);

    const controlNo = generateControlNumber();
    const now = Date.now();
    const logId = uuid();

    await db.transaction("rw", db.print_logs, db.syncQueue, (db as any).transactions, async () => {
      // 1. Log the print event for auditing
      await db.print_logs.add({
        id: logId as any,
        barangayId: resident.barangayId || "unknown",
        createdAt: now,
        docType: type,
        controlNo,
        residentId: resident.id,
        status: "pending",
        tryCount: 0,
        meta: { signer: officialSigner },
      } as any);

      // 2. Queue the print log for sync
      await db.syncQueue.add({
        id: uuid() as any,
        entityType: "print_log",
        entityId: logId,
        op: "UPSERT",
        payload: { /* ... full payload ... */ },
        createdAt: now,
        updatedAt: now,
        status: "pending",
        tryCount: 0,
      } as any);
      
      // 3. Log the transaction for revenue attribution
      await logTransaction({
        type: 'clearance_issued' as any,
        module: 'certificates',
        refId: resident.id,
        amount: 50.00 // Example amount
      });
    });

    toast({title: "Certificate Issued", description: `Control #: ${controlNo}`})

    return {
      controlNo,
      dateIssued: formatLongDate(now),
      residentName: (resident as any).fullNameNorm.toUpperCase(),
      residentAddress: `${(resident as any).purok}, ${(resident as any).addressLine1}`,
      type,
      signer: officialSigner,
    };
  };

  return { issueCertificate, isPrinting, setIsPrinting };
}

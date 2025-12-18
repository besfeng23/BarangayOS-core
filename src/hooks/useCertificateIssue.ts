
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

    await db.transaction("rw", db.printLogs, db.syncQueue, db.transactions, async () => {
      // 1. Log the print event for auditing
      await db.printLogs.add({
        id: logId,
        barangayId: resident.barangayId || "unknown",
        createdAt: now,
        docType: type,
        controlNo,
        residentId: resident.id,
        status: "pending",
        tryCount: 0,
        meta: { signer: officialSigner },
      });

      // 2. Queue the print log for sync
      await db.syncQueue.add({
        id: uuid(),
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
        type: 'clearance_issued',
        module: 'certificates',
        refId: resident.id,
        amount: 50.00 // Example amount
      });
    });

    toast({title: "Certificate Issued", description: `Control #: ${controlNo}`})

    return {
      controlNo,
      dateIssued: formatLongDate(now),
      residentName: resident.fullNameNorm.toUpperCase(),
      residentAddress: `${resident.purok}, ${resident.addressLine1}`,
      type,
      signer: officialSigner,
    };
  };

  return { issueCertificate, isPrinting, setIsPrinting };
}

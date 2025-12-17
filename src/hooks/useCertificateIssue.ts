import { useState } from "react";
import { bosDb, ResidentRecord } from "@/lib/bosDb";
import { generateControlNumber, formatLongDate } from "@/lib/certUtils";
import { uuid } from "@/lib/uuid";

export type CertType = "CERTIFICATE" | "CLEARANCE" | "INDIGENCY";

export function useCertificateIssue() {
  const [isPrinting, setIsPrinting] = useState(false);

  const issueCertificate = async (
    resident: ResidentRecord,
    type: CertType,
    officialSigner: string
  ) => {
    setIsPrinting(true);

    const controlNo = generateControlNumber();
    const now = Date.now();
    const logId = uuid();

    await bosDb.transaction("rw", bosDb.printLogs, bosDb.syncQueue, async () => {
      await bosDb.printLogs.add({
        id: logId,
        barangayId: resident.barangayId,
        createdAt: now,
        docType: type,
        controlNo,
        residentId: resident.id,
        status: "pending",
        tryCount: 0,
        meta: { signer: officialSigner },
      });

      await bosDb.syncQueue.add({
        id: uuid(),
        entityType: "print_log",
        entityId: logId,
        op: "UPSERT",
        payload: {
          id: logId,
          controlNo,
          docType: type,
          residentId: resident.id,
          createdAt: now,
          barangayId: resident.barangayId,
          meta: { signer: officialSigner },
        },
        createdAt: now,
        updatedAt: now,
        status: "pending",
        tryCount: 0,
      });
    });

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

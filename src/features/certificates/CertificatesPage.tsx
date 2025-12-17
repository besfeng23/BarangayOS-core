import React, { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { bosDb } from "@/lib/bosDb";
import { PrintFrame } from "@/components/print/PrintFrame";
import { StandardGenericTemplate } from "@/components/print/templates/StandardGenericTemplate";
import { useCertificateIssue } from "@/hooks/useCertificateIssue";
import { useRouter, useParams } from "next/navigation";

const TYPES = [
  { key: "CLEARANCE", label: "Barangay Clearance" },
  { key: "CERTIFICATE", label: "Barangay Certification" },
  { key: "INDIGENCY", label: "Certificate of Indigency" },
] as const;

export default function CertificatesPage() {
  const router = useRouter();
  const params = useParams();
  const residentId = params.residentId as string;
  const { issueCertificate, isPrinting, setIsPrinting } = useCertificateIssue();

  const resident = useLiveQuery(() => bosDb.residents.get(residentId), [residentId], undefined);

  const [printData, setPrintData] = useState<any>(null);
  const signer = useMemo(() => "HON. __________", []);

  async function onPick(type: any) {
    if (!resident) return;

    const data = await issueCertificate(resident, type, signer);
    setPrintData(data);

    // allow DOM to paint before print
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 80);
  }

  return (
    <div>
      <div className="max-w-5xl mx-auto px-4">
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-200 min-h-[48px]
            focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
        >
          ← Back
        </button>

        <div className="mt-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="text-zinc-100 text-xl font-bold">Issue Document</div>
          <div className="text-zinc-400 text-sm mt-1">
            {resident ? `${resident.lastName.toUpperCase()}, ${resident.firstName}` : "Loading resident..."}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
            {TYPES.map((t) => (
              <button
                key={t.key}
                onClick={() => onPick(t.key)}
                disabled={!resident || isPrinting}
                className="min-h-[72px] rounded-2xl bg-zinc-950 border border-zinc-800 text-left px-4 py-4
                  disabled:opacity-60
                  focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
              >
                <div className="text-zinc-100 font-semibold">{t.label}</div>
                <div className="text-zinc-500 text-xs mt-1">Print-first • Offline-safe control #</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {printData && (
        <PrintFrame>
          <StandardGenericTemplate
            type={printData.type}
            controlNo={printData.controlNo}
            dateIssued={printData.dateIssued}
            residentName={printData.residentName}
            residentAddress={printData.residentAddress}
            signer={printData.signer}
          />
        </PrintFrame>
      )}
    </div>
  );
}

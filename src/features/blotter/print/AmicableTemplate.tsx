import React from "react";
import { BlotterRecord } from "@/lib/bosDb";

export function AmicableTemplate({
  blotter,
  controlNo,
  dateIssued,
  barangayLine,
  signerName,
  signerTitle,
}: {
  blotter: BlotterRecord;
  controlNo: string;
  dateIssued: string;
  barangayLine: string;
  signerName: string;
  signerTitle: string;
}) {
  const complainants = (blotter.complainants || []).map((p) => p.name).join(", ");
  const respondents = (blotter.respondents || []).map((p) => p.name).join(", ");

  return (
    <div className="text-black">
      <div className="text-center">
        <div className="text-sm">REPUBLIC OF THE PHILIPPINES</div>
        <div className="text-sm">OFFICE OF THE BARANGAY</div>
        <div className="text-sm font-semibold">{barangayLine}</div>
        <div className="mt-3 text-xl font-bold tracking-wide">AMICABLE SETTLEMENT</div>
      </div>

      <div className="mt-6 flex justify-between text-sm">
        <div>
          <div><span className="font-semibold">Case No.:</span> {blotter.caseNumber}</div>
          <div><span className="font-semibold">Control No.:</span> {controlNo}</div>
        </div>
        <div><span className="font-semibold">Date:</span> {dateIssued}</div>
      </div>

      <div className="mt-6 text-sm leading-6">
        <div><span className="font-semibold">Complainant(s):</span> {complainants || "—"}</div>
        <div><span className="font-semibold">Respondent(s):</span> {respondents || "—"}</div>

        <p className="mt-4">
          This amicable settlement is entered into voluntarily by the parties above in relation to the
          incident described in the blotter case referenced herein.
        </p>

        <div className="mt-6">
          <div className="font-semibold">Terms of Settlement</div>
          <div className="mt-2 border border-black/20 p-3 min-h-[180px]">
            {/* v1: typed later / handwritten after print */}
            <div className="text-black/60 text-xs">
              (Write the settlement terms here after printing, or encode in v2.)
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="font-semibold">Narrative Reference</div>
          <div className="mt-2 border border-black/20 p-3 min-h-[120px] whitespace-pre-wrap">
            {blotter.narrative || "—"}
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-8">
          <div className="text-center">
            <div className="border-t border-black pt-2 font-semibold">Complainant Signature</div>
            <div className="text-xs">Printed Name: {complainants || "—"}</div>
          </div>
          <div className="text-center">
            <div className="border-t border-black pt-2 font-semibold">Respondent Signature</div>
            <div className="text-xs">Printed Name: {respondents || "—"}</div>
          </div>
        </div>

        <div className="mt-10 flex justify-end">
          <div className="text-center w-[260px]">
            <div className="border-t border-black pt-2 font-semibold">{signerName}</div>
            <div className="text-xs">{signerTitle}</div>
          </div>
        </div>

        <div className="mt-8 text-xs text-black/70">
          This document is generated offline-capable and will be synced when connectivity is available.
        </div>
      </div>
    </div>
  );
}

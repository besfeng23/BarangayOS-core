import React, { useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { bosDb } from "@/lib/bosDb";
import { useBlotterData } from "@/hooks/useBlotterData";
import { useBlotterPrint } from "@/hooks/useBlotterPrint";
import { BlotterPrintFrame } from "@/features/blotter/components/BlotterPrintFrame";

export default function BlotterProfilePage() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { updateBlotter } = useBlotterData();

  const blotter = useLiveQuery(() => bosDb.blotters.get(id), [id], undefined);
  const { printData, printNow } = useBlotterPrint();

  function partiesToText(arr: any[]) {
    return (arr || []).map((p) => p.name).join(", ");
  }

  async function onPrintSummons() {
    if (!blotter) return;
    const caseNumber = blotter.caseNumber;
    await printNow(
      {
        docType: "BLOTTER_SUMMONS",
        caseNumber,
        dateIssued: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
        complainantsText: partiesToText(blotter.complainants),
        respondentsText: partiesToText(blotter.respondents),
        incidentDate: blotter.incidentDate,
        hearingDate: blotter.hearingDate || "",
      },
      { blotterId: blotter.id, caseNumber, docType: "BLOTTER_SUMMONS" }
    );
  }

  async function onSettleAndPrint() {
    if (!blotter) return;
    // 1) update status locally (you likely already have updateBlotter)
    await updateBlotter(blotter.id, { status: "SETTLED" });

    // 2) print settlement doc
    const caseNumber = blotter.caseNumber;
    await printNow(
      {
        docType: "BLOTTER_SETTLEMENT",
        caseNumber,
        dateIssued: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
        complainantsText: partiesToText(blotter.complainants),
        respondentsText: partiesToText(blotter.respondents),
        narrative: blotter.narrative,
        terms: (blotter as any).settlementTerms || "",
      },
      { blotterId: blotter.id, caseNumber, docType: "BLOTTER_SETTLEMENT" }
    );
  }


  if (!blotter) {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 pb-24">
            <div className="max-w-3xl mx-auto px-4 pt-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="text-slate-100 font-semibold">Case not found.</div>
                <button
                onClick={() => router.push("/blotter")}
                className="mt-4 px-5 py-3 rounded-2xl bg-slate-800 border border-slate-700 text-slate-100 font-semibold
                    focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-950"
                >
                Back to Blotter
                </button>
            </div>
            </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-slate-950 text-slate-100 pb-24">
        <div className="max-w-4xl mx-auto px-4 pt-6 space-y-4">
          <button
            onClick={() => router.push("/blotter")}
            className="text-sm text-slate-400
              focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-950 rounded-2xl px-2 py-1"
          >
            ← Back to Blotter
          </button>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-slate-100 text-2xl font-bold">{blotter.caseNumber}</div>
                <div className="text-slate-400 mt-1">
                  {blotter.complainants.map((p) => p.name).join(", ")} vs {blotter.respondents.map((p) => p.name).join(", ")}
                </div>
                <div className="text-slate-500 text-sm mt-1">
                  Incident: {blotter.incidentDate}{blotter.hearingDate ? ` • Hearing: ${blotter.hearingDate}` : ""}
                </div>
              </div>
              <div className="px-2 py-1 rounded text-xs font-medium border bg-slate-900 border-slate-700 text-slate-300">
                {blotter.status}
              </div>
            </div>

            <div className="mt-5">
              <div className="text-slate-400 text-sm mb-2">Narrative</div>
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-slate-200 whitespace-pre-wrap">
                {blotter.narrative}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
              <button
                onClick={onPrintSummons}
                className="px-5 py-4 rounded-2xl bg-slate-800 border border-slate-700 text-slate-100 font-semibold
                  focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-950"
              >
                Print Summons
              </button>
              <button
                 onClick={onSettleAndPrint}
                className="px-5 py-4 rounded-2xl bg-slate-800 border border-slate-700 text-emerald-400 font-semibold
                  focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-950"
              >
                Mark Settled & Print
              </button>
            </div>
          </div>
        </div>
        <BlotterPrintFrame data={printData} />
      </div>
  );
}

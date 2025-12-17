"use client";

import React, { useEffect, useRef } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { bosDb } from "@/lib/bosDb";
import { useToast } from "@/hooks/use-toast";
import { useBlotterData } from "@/hooks/useBlotterData";
import { useBlotterPrint } from "@/hooks/useBlotterPrint";
import { BlotterPrintFrame } from "@/features/blotter/components/BlotterPrintFrame";

const btnPrimary =
  "px-5 py-4 rounded-2xl bg-slate-800 border border-slate-700 text-slate-100 font-semibold " +
  "focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-950";
const btnSecondary =
  "px-5 py-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 " +
  "focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-950";

export default function BlotterProfilePage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const searchParams = useSearchParams();

  const { logActivity, updateBlotter } = useBlotterData();
  const { toast } = useToast();
  const toastShownRef = useRef(false);

  const { printData, printNow } = useBlotterPrint();

  const blotter = useLiveQuery(() => bosDb.blotters.get(id), [id], undefined as any);

  useEffect(() => {
    if (!id) return;
    logActivity({ type: "BLOTTER_VIEW", entityType: "blotter", entityId: id });
  }, [id, logActivity]);

  useEffect(() => {
    const msg = searchParams.get('toast');
    if (!toastShownRef.current && msg) {
      toastShownRef.current = true;
      toast({ title: msg });
      router.replace(`/blotter/${id}`, { scroll: false });
    }
  }, [searchParams, toast, router, id]);

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
        incidentDate: blotter.incidentDateISO,
        hearingDate: blotter.hearingDateISO || "",
      },
      { blotterId: blotter.id, caseNumber, docType: "BLOTTER_SUMMONS" }
    );
    logActivity({ type: "BLOTTER_PRINT", entityType: "blotter", entityId: blotter.id, meta: { docType: "BLOTTER_SUMMONS" } });
  }

  async function onSettleAndPrint() {
    if (!blotter) return;
    await updateBlotter(blotter.id, { status: "SETTLED", settledAt: Date.now() });

    const caseNumber = blotter.caseNumber;
    await printNow(
      {
        docType: "BLOTTER_SETTLEMENT",
        caseNumber,
        dateIssued: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
        complainantsText: partiesToText(blotter.complainants),
        respondentsText: partiesToText(blotter.respondents),
        narrative: blotter.narrative,
        terms: blotter.settlementTerms || "",
      },
      { blotterId: blotter.id, caseNumber, docType: "BLOTTER_SETTLEMENT" }
    );
    logActivity({ type: "BLOTTER_PRINT", entityType: "blotter", entityId: blotter.id, meta: { docType: "BLOTTER_SETTLEMENT" } });
  }

  if (!blotter) {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 pb-24">
          <div className="max-w-3xl mx-auto px-4 pt-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="text-slate-100 font-semibold">Case not found.</div>
              <button onClick={() => router.push("/blotter")} className="mt-4 px-5 py-3 rounded-2xl bg-slate-800 border border-slate-700 text-slate-100 font-semibold
                focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-950">
                Back to Blotter
              </button>
            </div>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-slate-950 text-slate-100 pb-24">
        <div className="max-w-4xl mx-auto px-4 pt-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <button
              onClick={() => router.push("/blotter")}
              className="text-sm text-slate-400 mb-4
                focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-950 rounded-2xl px-2 py-1"
            >
              ← Back to Blotter
            </button>

            <div className="flex flex-col sm:flex-row gap-5 items-start">
              <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 font-bold text-sm">
                {blotter.caseNumber.slice(-6)}
              </div>

              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-slate-100 truncate">{blotter.caseNumber}</h1>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-400">
                  <div><span className="text-slate-100">Status:</span> {blotter.status}</div>
                  <div><span className="text-slate-100">Incident:</span> {blotter.incidentDateISO}</div>
                  <div><span className="text-slate-100">Complainant(s):</span> {partiesToText(blotter.complainants)}</div>
                  <div><span className="text-slate-100">Respondent(s):</span> {partiesToText(blotter.respondents)}</div>
                </div>

                <div className="mt-4 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-slate-300 whitespace-pre-wrap">
                  {blotter.narrative}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
                  <button className={btnPrimary} onClick={onPrintSummons}>Print Summons</button>
                  <button className={btnPrimary} onClick={onSettleAndPrint}>Mark Settled & Print</button>
                  <button className={btnSecondary} onClick={() => toast({title: "Edit flow next"})}>Edit Case</button>
                  <button className={btnSecondary} onClick={() => window.print()}>Quick Print</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <BlotterPrintFrame data={printData} />
      </div>
  );
}

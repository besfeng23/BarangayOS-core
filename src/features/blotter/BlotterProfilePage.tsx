import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/bosDb";
import { useToast } from "@/components/ui/toast";
import { useBlotterData } from "@/hooks/useBlotterData";
import PrintFrame from "@/components/print/PrintFrame";
import { useBlotterDocs } from "@/hooks/useBlotterDocs";
import { SummonsTemplate } from "@/features/blotter/print/SummonsTemplate";
import { AmicableTemplate } from "@/features/blotter/print/AmicableTemplate";
import type { BlotterRecord } from "@/lib/bosDb";

const btnPrimary =
  "px-5 py-4 rounded-2xl bg-zinc-800 border border-zinc-700 text-zinc-100 font-semibold " +
  "focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 ring-offset-zinc-950";
const btnSecondary =
  "px-5 py-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-100 " +
  "focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950";

export default function BlotterProfilePage() {
  const { id = "" } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { logActivity, updateBlotterStatus } = useBlotterData();
  const { toast } = useToast();
  const toastShownRef = useRef(false);
  const { printJob, issueAndPrint } = useBlotterDocs();
  const blotter = useLiveQuery(() => db.blotters.get(id as string), [id], undefined as any);

  const [settleOpen, setSettleOpen] = useState(false);
  const [nextStatus, setNextStatus] = useState<"SETTLED" | "DISMISSED" | "FILED_TO_COURT">("SETTLED");
  const [summary, setSummary] = useState("");
  const [saving, setSaving] = useState(false);

  const requiresSummary = useMemo(() => nextStatus === "SETTLED", [nextStatus]);

  useEffect(() => {
    if (!id) return;
    logActivity({ type: "BLOTTER_VIEW", entityType: "blotter", entityId: id as string } as any);
  }, [id, logActivity]);

  useEffect(() => {
    const msg = searchParams.get('toast');
    if (!toastShownRef.current && msg) {
      toastShownRef.current = true;
      toast({title: msg});
      router.replace(`/blotter/${id}`);
    }
  }, [searchParams, toast, router, id]);

  if (!blotter) {
    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-24">
          <div className="max-w-3xl mx-auto px-4 pt-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <div className="text-zinc-100 font-semibold">Case not found.</div>
              <button
                onClick={() => router.push("/blotter")}
                className="mt-4 px-5 py-3 rounded-2xl bg-zinc-800 border border-zinc-700 text-zinc-100 font-semibold
                  focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
              >
                Back to Blotter
              </button>
            </div>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-24">
        <div className="max-w-4xl mx-auto px-4 pt-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <button
              onClick={() => router.push("/blotter")}
              className="text-sm text-zinc-400 mb-4
                focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950 rounded-2xl px-2 py-1"
            >
              ← Back to Blotter
            </button>

            <h1 className="text-3xl font-bold text-zinc-100">
              {blotter.caseNumber}
            </h1>
            <p className="text-zinc-400 mt-1">{blotter.status} • {new Date(blotter.incidentDate).toLocaleString()}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 text-zinc-400">
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4">
                <div className="text-zinc-500 text-xs uppercase">Complainants</div>
                <div className="mt-1 text-zinc-100 font-semibold">
                  {(blotter.complainants || []).map((p: any) => p.name).join(", ") || "—"}
                </div>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4">
                <div className="text-zinc-500 text-xs uppercase">Respondents</div>
                <div className="mt-1 text-zinc-100 font-semibold">
                  {(blotter.respondents || []).map((p: any) => p.name).join(", ") || "—"}
                </div>
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 mt-3">
              <div className="text-zinc-500 text-xs uppercase">Narrative</div>
              <div className="mt-2 text-zinc-100 whitespace-pre-wrap">{blotter.narrative}</div>
              <div className="mt-3 text-zinc-400 text-sm">Tags: {(blotter.tags || []).join(", ") || "—"}</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
               <button
                className={btnPrimary}
                onClick={() => issueAndPrint(blotter as BlotterRecord, "SUMMONS")}
              >
                Print Summons
              </button>

              <button
                className={btnPrimary}
                onClick={() => issueAndPrint(blotter as BlotterRecord, "AMICABLE")}
              >
                Print Amicable
              </button>

              <button className={btnSecondary}>Edit Case</button>
              <button className={btnSecondary} onClick={() => setSettleOpen(true)}>
                Mark Settled
              </button>
            </div>
          </div>
        </div>
        {printJob && (
          <PrintFrame html={null}>
            {printJob?.docType === "SUMMONS" && (
              <SummonsTemplate
                blotter={printJob.blotter}
                controlNo={printJob.controlNo}
                dateIssued={printJob.dateIssued}
                barangayLine={printJob.barangayLine}
                signerName={printJob.signerName}
                signerTitle={printJob.signerTitle}
              />
            )}

            {printJob?.docType === "AMICABLE" && (
              <AmicableTemplate
                blotter={printJob.blotter}
                controlNo={printJob.controlNo}
                dateIssued={printJob.dateIssued}
                barangayLine={printJob.barangayLine}
                signerName={printJob.signerName}
                signerTitle={printJob.signerTitle}
              />
            )}
        </PrintFrame>
        )}
        
        {settleOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4" role="dialog" aria-modal="true">
            <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-zinc-100">Close Case</h3>
                  <p className="text-zinc-400 text-sm">Updates status offline and queues sync.</p>
                </div>
                <button
                  onClick={() => setSettleOpen(false)}
                  className="px-3 py-2 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-300
                    focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
                >
                  Close
                </button>
              </div>

              <div className="mt-5 space-y-3">
                <label className="text-xs text-zinc-500 uppercase font-medium ml-1">New Status</label>
                <select
                  value={nextStatus}
                  onChange={(e) => setNextStatus(e.target.value as any)}
                  className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-2xl text-zinc-100
                    focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
                >
                  <option value="SETTLED">SETTLED (Amicable)</option>
                  <option value="DISMISSED">DISMISSED</option>
                  <option value="FILED_TO_COURT">FILED TO COURT</option>
                </select>

                <label className="text-xs text-zinc-500 uppercase font-medium ml-1">
                  Settlement Summary {requiresSummary ? "*" : "(optional)"}
                </label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder={requiresSummary ? "Short summary of agreement reached..." : "Optional notes..."}
                  className="w-full min-h-[120px] px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-2xl text-zinc-100 placeholder:text-zinc-600
                    focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  <button
                    disabled={saving}
                    onClick={() => setSettleOpen(false)}
                    className="py-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-300 disabled:opacity-60
                      focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
                  >
                    Cancel
                  </button>

                  <button
                    disabled={saving || (requiresSummary && summary.trim().length < 10)}
                    onClick={async () => {
                      setSaving(true);
                      try {
                        await updateBlotterStatus(blotter.id, nextStatus as any, summary.trim() || undefined);
                        toast({title: "Case updated offline — queued for sync ✅"});
                        setSettleOpen(false);
                        setSummary("");
                      } finally {
                        setSaving(false);
                      }
                    }}
                    className="py-3 rounded-2xl bg-zinc-100 text-zinc-950 font-bold disabled:opacity-60
                      focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
                  >
                    {saving ? "Saving..." : "Save Status Update"}
                  </button>
                </div>

                {requiresSummary && (
                  <div className="text-xs text-zinc-500">
                    Lola-proof rule: settled cases require a short summary (min 10 chars).
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
  );

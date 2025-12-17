import React, { useEffect, useRef } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { bosDb } from "@/lib/bosDb";
import { useToast } from "@/hooks/use-toast";

const btnPrimary =
  "px-5 py-4 rounded-2xl bg-zinc-800 border border-zinc-700 text-zinc-100 font-semibold " +
  "focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 ring-offset-zinc-950";
const btnSecondary =
  "px-5 py-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-100 " +
  "focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 ring-offset-zinc-950";

export default function BlotterProfilePage() {
  const { id = "" } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const toastShownRef = useRef(false);

  const blotter = useLiveQuery(() => bosDb.blotters.get(id as string), [id], undefined);

  useEffect(() => {
    const msg = searchParams.get('toast');
    if (!toastShownRef.current && msg) {
      toastShownRef.current = true;
      toast({ title: decodeURIComponent(msg) });
      router.replace(`/blotter/${id}`, { scroll: false });
    }
  }, [location, toast, router, id, searchParams]);

  if (!blotter) {
    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-24">
          <div className="max-w-3xl mx-auto px-4 pt-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <div className="text-zinc-100 font-semibold">Case not found.</div>
              <button
                onClick={() => router.push("/blotter")}
                className="mt-4 px-5 py-3 rounded-2xl bg-zinc-800 border border-zinc-700 text-zinc-100 font-semibold
                  focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 ring-offset-zinc-950"
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
                focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 ring-offset-zinc-950 rounded-2xl px-2 py-1"
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
                  {(blotter.complainants || []).map((p) => p.name).join(", ") || "—"}
                </div>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4">
                <div className="text-zinc-500 text-xs uppercase">Respondents</div>
                <div className="mt-1 text-zinc-100 font-semibold">
                  {(blotter.respondents || []).map((p) => p.name).join(", ") || "—"}
                </div>
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 mt-3">
              <div className="text-zinc-500 text-xs uppercase">Narrative</div>
              <div className="mt-2 text-zinc-100 whitespace-pre-wrap">{blotter.narrative}</div>
              <div className="mt-3 text-zinc-400 text-sm">Tags: {(blotter.tags || []).join(", ") || "—"}</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
              <button className={btnPrimary}>Print Summons</button>
              <button className={btnPrimary}>Print Amicable</button>
              <button className={btnSecondary}>Edit Case</button>
              <button className={btnSecondary}>Mark Settled</button>
            </div>
          </div>
        </div>
      </div>
  );
}

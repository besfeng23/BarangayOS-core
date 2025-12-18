"use client";
import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import type { BlotterCase } from "../../types";
import dynamic from "next/dynamic";

const PageComponent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = React.useState<BlotterCase | null>(null);

  React.useEffect(() => {
    if (!id) return;
    return onSnapshot(doc(db, "blotters", id), (snap) => {
      setData(snap.exists() ? ({ id: snap.id, ...snap.data() } as BlotterCase) : null);
    });
  }, [id]);

  if (!data) {
    return <div className="p-8 text-center text-zinc-500">Select a case…</div>;
  }

  const createdDate = (data.createdAt as any)?.toDate?.() as Date | undefined;

  const handlePrint = () => {
    navigate(`/print?caseId=${data.id}`);
  };

  return (
    <div className="h-full flex flex-col bg-zinc-950 text-zinc-100">
      {/* Mobile header */}
      <div className="lg:hidden h-14 border-b border-zinc-800 flex items-center px-4 bg-zinc-950">
        <button onClick={() => navigate("/blotter")} className="text-zinc-300 hover:text-white font-black text-sm">
          ← BACK
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6">
        <div className="flex justify-between items-start gap-3">
          <h2 className="text-2xl font-black">Case #{data.id.slice(-4)}</h2>
          <span className="px-3 py-2 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-black text-zinc-300">
            {createdDate ? createdDate.toLocaleDateString() : "—"}
          </span>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 grid gap-6 md:grid-cols-2">
          <div>
            <div className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-1">Complainant</div>
            <div className="text-lg font-black">{data.participantsDisplay?.complainant || "—"}</div>
          </div>
          <div>
            <div className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-1">Respondent</div>
            <div className="text-lg font-black">{data.participantsDisplay?.respondent || "—"}</div>
          </div>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6">
          <div className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-2">Narrative</div>
          <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">{data.narrative}</p>
        </div>

        {/* Vertical Action Stack */}
        <div className="pt-4 space-y-3 pb-10">
          <button
            onClick={handlePrint}
            className="w-full h-14 bg-zinc-100 hover:bg-white text-zinc-950 font-black text-lg rounded-2xl shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
          >
            <span>🖨️</span> Print Blotter Report
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button className="h-12 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-200 font-black rounded-xl transition-colors">
              Edit Details
            </button>
            <button className="h-12 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-emerald-300 font-black rounded-xl transition-colors">
              Mark Settled
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(PageComponent), { ssr: false });

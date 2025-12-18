"use client";
import * as React from "react";
import { useParams } from "react-router-dom";
import BlotterList from "./BlotterList";
import BlotterDetail from "./BlotterDetail";
import NewCaseModal from "./NewCaseModal";
import { useBlotterData } from "../../useBlotterData";
import { useIsDesktop } from "../../hooks";

export default function BlotterWorkstation() {
  const { id } = useParams();
  const isDesktop = useIsDesktop();

  const { computedBadge, hasDraft, draft, clearDraft } = useBlotterData();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"ALL" | "REVIEW">("ALL");

  const showList = isDesktop || !id;
  const showDetail = isDesktop || !!id;

  const draftLabel =
    draft?.compDisplay ||
    draft?.compSnap?.name ||
    draft?.respDisplay ||
    draft?.respSnap?.name ||
    "Blotter";

  return (
    <div className="flex flex-col h-full">
      {/* Zone 1 hidden on mobile when in detail route */}
      <div className={["shrink-0 p-4 border-b border-zinc-800 bg-zinc-950 space-y-4", !isDesktop && id ? "hidden" : "block"].join(" ")}>
        {hasDraft && (
          <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-amber-400/10 border border-amber-400/20">
            <div className="text-sm">
              <div className="font-bold text-amber-300">Unsaved Draft</div>
              <div className="text-zinc-400 truncate max-w-[240px]">{draftLabel} — Blotter</div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => {
                  if (window.confirm("Discard unsaved draft?")) clearDraft();
                }}
                className="px-3 py-2 text-xs font-bold rounded-xl bg-zinc-900/60 border border-zinc-800 text-zinc-200 hover:bg-zinc-900 active:scale-95 transition-transform"
              >
                Discard
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-3 py-2 text-xs font-black rounded-xl bg-amber-400 text-black active:scale-95 transition-transform"
              >
                Resume
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-black text-zinc-100">Blotter</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-zinc-100 text-zinc-950 hover:bg-white px-5 py-2.5 rounded-full font-black text-sm shadow-lg active:scale-95 transition-transform"
          >
            + New Blotter
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("ALL")}
            className={[
              "px-4 py-2 rounded-full text-sm font-black border transition-all",
              activeTab === "ALL" ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "border-transparent text-zinc-500 hover:text-zinc-300",
            ].join(" ")}
          >
            Open Cases
          </button>

          <button
            onClick={() => setActiveTab("REVIEW")}
            className={[
              "px-4 py-2 rounded-full text-sm font-black border transition-all flex items-center gap-2",
              activeTab === "REVIEW" ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "border-transparent text-zinc-500 hover:text-zinc-300",
            ].join(" ")}
          >
            For Review
            {computedBadge > 0 && (
              <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-amber-400 text-black text-[10px] font-black flex items-center justify-center">
                {computedBadge}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {showList && (
          <div className={[isDesktop ? "w-[35%] border-r border-zinc-800" : "w-full", "h-full"].join(" ")}>
            <BlotterList filterMode={activeTab} />
          </div>
        )}

        {showDetail && (
          <div className={[isDesktop ? "flex-1" : "w-full", "h-full"].join(" ")}>
            <BlotterDetail />
          </div>
        )}
      </div>

      {isModalOpen && <NewCaseModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}

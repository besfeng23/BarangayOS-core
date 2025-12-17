"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useBlotterData } from "@/hooks/useBlotterData";
import { Icon } from "@/components/icons";

const CHIP_STATUS = ["ACTIVE", "SETTLED", "FILED_TO_COURT", "DISMISSED"] as const;
const CHIP_TAGS = ["Noise", "Debt", "Theft", "Physical Injury", "Property"] as const;

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-full border text-sm whitespace-nowrap
        ${active ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-slate-950 border-slate-800 text-slate-300"}
        focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-950`}
      aria-label={`Filter ${label}`}
    >
      {label}
    </button>
  );
}

export default function BlotterPage() {
  const router = useRouter();
  const { filters, setFilters, blotters, snapshot, blotterNewDraft, clearDraft } = useBlotterData();

  const hasFilters = useMemo(() => !!(filters.q || filters.status || filters.tag), [filters]);

  return (
      <div className="min-h-screen bg-slate-950 text-slate-100 pb-24">
        <div className="max-w-6xl mx-auto px-4 pt-4 space-y-4">
          
          {/* Draft Banner */}
          {blotterNewDraft && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
              <div>
                <div className="text-slate-100 font-semibold">Unsaved Draft: Blotter Case</div>
                <div className="text-slate-400 text-sm">Resume where you left off</div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => router.push("/blotter/new")}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-2xl bg-slate-800 border border-slate-700 text-slate-100 font-semibold
                    focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-950"
                >
                  Resume
                </button>
                <button
                  onClick={async () => {
                    if (confirm("Discard this draft?")) await clearDraft("blotter:new");
                  }}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-slate-300
                    focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-950"
                >
                  Discard
                </button>
              </div>
            </div>
          )}

          {/* Snapshot */}
          <section>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <div className="text-slate-400 text-sm">Total Cases</div>
                <div className="text-slate-100 text-2xl font-semibold mt-1">{snapshot.total}</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <div className="text-slate-400 text-sm">Active</div>
                <div className="text-slate-100 text-2xl font-semibold mt-1">{snapshot.active}</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <div className="text-slate-400 text-sm">Settled</div>
                <div className="text-slate-100 text-2xl font-semibold mt-1">{snapshot.settled}</div>
              </div>
            </div>
          </section>

          {/* Controls */}
          <section className="sticky top-[72px] z-20 bg-slate-950 pb-2 pt-1">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => router.push("/blotter/new")}
                  className="px-6 py-3 bg-slate-100 text-slate-950 font-bold rounded-2xl
                    focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-950"
                >
                  New Case
                </button>

                <input
                  type="text"
                  placeholder="Search case #, names, tags..."
                  value={filters.q}
                  onChange={(e) => setFilters((p) => ({ ...p, q: e.target.value }))}
                  className="flex-1 min-h-[48px] px-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-600
                    focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-950"
                />

                {hasFilters && (
                  <button
                    onClick={() => setFilters({ q: "" })}
                    className="px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-300
                      focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-950"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1">
                {CHIP_STATUS.map((st) => (
                  <Chip
                    key={st}
                    label={st}
                    active={filters.status === st}
                    onClick={() => setFilters((f) => ({ ...f, status: f.status === st ? undefined : st }))}
                  />
                ))}
                <div className="w-px h-7 bg-slate-800 my-auto mx-1" />
                {CHIP_TAGS.map((t) => (
                  <Chip
                    key={t}
                    label={t}
                    active={filters.tag === t}
                    onClick={() => setFilters((f) => ({ ...f, tag: f.tag === t ? undefined : t }))}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* List */}
          <section className="space-y-2">
            {blotters.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl text-slate-500">
                No cases found. <br /> Create a new case to begin.
              </div>
            ) : (
              blotters.map((b) => (
                <button
                  key={b.id}
                  onClick={() => router.push(`/blotter/${b.id}`)}
                  className="w-full text-left flex items-center p-4 bg-slate-900 border border-slate-800 rounded-2xl min-h-[48px]
                    focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-950"
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 font-bold text-sm mr-4">
                    {b.caseNumber.slice(-6)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-slate-100 font-semibold truncate">{b.caseNumber}</div>
                    <div className="text-slate-400 text-sm truncate">
                      {(b.complainants?.[0]?.name || "Complainant")} vs {(b.respondents?.[0]?.name || "Respondent")}
                    </div>
                    <div className="text-slate-400 text-sm truncate">
                      {b.incidentDateISO} • {(b.tags || []).slice(0, 2).join(", ")}
                    </div>
                  </div>
                  <div className="ml-2 px-2 py-1 rounded text-xs font-medium border bg-slate-900 border-slate-700 text-slate-300">
                    {b.status}
                  </div>
                </button>
              ))
            )}
          </section>
        </div>
      </div>
  );
}

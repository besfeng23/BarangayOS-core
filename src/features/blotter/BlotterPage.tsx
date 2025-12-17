import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useBlotterData } from "@/hooks/useBlotterData";

const STATUS = ["ACTIVE", "SETTLED", "FILED_TO_COURT", "DISMISSED"] as const;

function Chip({ label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-full border text-sm whitespace-nowrap min-h-[40px]
        ${active ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-slate-950 border-slate-800 text-slate-300"}
        focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-950`}
    >
      {label}
    </button>
  );
}

export default function BlotterPage() {
  const router = useRouter();
  const { filters, setFilters, blotters } = useBlotterData();
  const hasFilters = useMemo(() => !!(filters.q || filters.status), [filters]);

  return (
      <div className="min-h-screen bg-slate-950 text-slate-100 pb-24">
        <div className="max-w-6xl mx-auto px-4 pt-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => router.push("/blotter/new")}
                className="px-6 py-3 bg-slate-100 text-slate-950 font-bold rounded-2xl min-h-[48px]
                  focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-950"
              >
                New Blotter Case
              </button>

              <input
                value={filters.q}
                onChange={(e) => setFilters((p) => ({ ...p, q: e.target.value }))}
                placeholder="Search case #, name, tags..."
                className="flex-1 min-h-[48px] px-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-600
                  focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-950"
              />

              {hasFilters && (
                <button
                  onClick={() => setFilters({ q: "" })}
                  className="px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-300 min-h-[48px]
                    focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-950"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {STATUS.map((s) => (
                <Chip
                  key={s}
                  label={s}
                  active={filters.status === s}
                  onClick={() => setFilters((f) => ({ ...f, status: f.status === s ? undefined : (s as any) }))}
                />
              ))}
            </div>
          </div>

          <section className="space-y-2">
            {blotters.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl text-slate-500">
                No cases found. Create a blotter case to begin.
              </div>
            ) : (
              blotters.map((b) => (
                <button
                  key={b.id}
                  onClick={() => router.push(`/blotter/${b.id}`)}
                  className="w-full text-left p-4 bg-slate-900 border border-slate-800 rounded-2xl min-h-[48px]
                    focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-950"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-slate-100 font-bold">{b.caseNumber}</div>
                    <div className="px-2 py-1 rounded text-xs font-medium border bg-slate-900 border-slate-700 text-slate-300">
                      {b.status}
                    </div>
                  </div>
                  <div className="text-slate-400 text-sm mt-1">
                    {b.complainants.map((p) => p.name).join(", ")} vs {b.respondents.map((p) => p.name).join(", ")}
                  </div>
                  <div className="text-slate-500 text-xs mt-1">
                    Incident: {b.incidentDate}{b.hearingDate ? ` • Hearing: ${b.hearingDate}` : ""}
                  </div>
                </button>
              ))
            )}
          </section>
        </div>
      </div>
  );
}

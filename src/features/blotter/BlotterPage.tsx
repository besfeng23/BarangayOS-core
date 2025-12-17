import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useBlotterData } from "@/hooks/useBlotterData";
import { Icon } from "@/components/icons";

const CHIP_STATUS = ["ACTIVE", "SETTLED", "FILED_TO_COURT", "DISMISSED"] as const;
const CHIP_TAGS = ["Debt", "Noise", "Theft", "Physical Injury", "Other"];

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
      <div className="text-zinc-400 text-sm">{label}</div>
      <div className="text-zinc-100 text-2xl font-semibold mt-1">{value}</div>
    </div>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-full border text-sm whitespace-nowrap
        ${active ? "bg-zinc-800 border-zinc-700 text-zinc-100" : "bg-zinc-950 border-zinc-800 text-zinc-300"}
        focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 ring-offset-zinc-950`}
      aria-label={`Filter ${label}`}
    >
      {label}
    </button>
  );
}

export default function BlotterPage() {
  const router = useRouter();
  const { filters, setFilters, blotters, snapshot } = useBlotterData();

  const hasFilters = useMemo(
    () => !!(filters.q || filters.status || filters.tag),
    [filters]
  );

  return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-24">
        <div className="max-w-6xl mx-auto px-4 pt-4 space-y-4">
          <section aria-label="Blotter Snapshot">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <StatTile label="Total Cases" value={snapshot.total} />
              <StatTile label="Active" value={snapshot.active} />
              <StatTile label="Settled" value={snapshot.settled} />
            </div>
          </section>

          <section className="sticky top-[72px] z-20 bg-zinc-950 pb-2 pt-1">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => router.push("/blotter/new")}
                  className="px-6 py-3 bg-zinc-100 text-zinc-950 font-bold rounded-2xl
                    focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 ring-offset-zinc-950"
                >
                  New Case
                </button>

                <input
                  type="text"
                  placeholder="Search case #, name, tag..."
                  value={filters.q}
                  onChange={(e) => setFilters((p) => ({ ...p, q: e.target.value }))}
                  className="flex-1 min-h-[48px] px-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600
                    focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 ring-offset-zinc-950"
                />

                {hasFilters && (
                  <button
                    onClick={() => setFilters({ q: "" })}
                    className="px-4 py-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-300
                      focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 ring-offset-zinc-950"
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
                <div className="w-px h-7 bg-zinc-800 my-auto mx-1" />
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

          <section className="space-y-2">
            {blotters.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-zinc-800 rounded-2xl text-zinc-500">
                No blotter cases found. <br /> Create a new case to begin.
              </div>
            ) : (
              blotters.map((b) => (
                <button
                  key={b.id}
                  onClick={() => router.push(`/blotter/${b.id}`)}
                  className="w-full text-left flex items-center p-4 bg-zinc-900 border border-zinc-800 rounded-2xl min-h-[48px]
                    focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 ring-offset-zinc-950"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-zinc-100 font-semibold truncate">
                      {b.caseNumber} • {b.status}
                    </div>
                    <div className="text-zinc-400 text-sm truncate">
                      Complainant: {(b.complainants?.[0]?.name || "—")} • Respondent: {(b.respondents?.[0]?.name || "—")}
                    </div>
                    <div className="text-zinc-400 text-sm truncate">
                      Tags: {(b.tags || []).slice(0, 3).join(", ") || "—"}
                    </div>
                  </div>
                  <div className="ml-2 px-2 py-1 rounded text-xs font-medium border bg-zinc-900 border-zinc-700 text-zinc-300">
                    {new Date(b.createdAt).toLocaleDateString()}
                  </div>
                </button>
              ))
            )}
          </section>
        </div>

      </div>
  );
}

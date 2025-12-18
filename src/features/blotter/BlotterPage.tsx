"use client";
import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useBlotterIndex } from "@/hooks/useBlotterIndex";
import { BlotterStatus } from "@/lib/bosDb";
import NewCaseModal from "@/components/blotter/NewCaseModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { Plus } from "lucide-react";

const STATUS_CHIPS: BlotterStatus[] = ["ACTIVE", "SETTLED", "FILED_TO_COURT", "DISMISSED"];
const TAG_CHIPS = ["Debt", "Noise", "Theft", "Physical Injury", "Trespassing", "Harassment"];

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
      <div className="text-zinc-400 text-sm">{label}</div>
      <div className="text-zinc-100 text-2xl font-semibold mt-1">{value}</div>
    </div>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-full border text-sm whitespace-nowrap min-h-[44px]
        ${active ? "bg-zinc-800 border-zinc-700 text-zinc-100" : "bg-zinc-950 border-zinc-800 text-zinc-300"}
        focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950`}
      aria-label={`Filter ${label}`}
    >
      {label}
    </button>
  );
}

function statusPill(status: BlotterStatus) {
  const base =
    "ml-2 px-2 py-1 rounded text-xs font-medium border bg-zinc-900 border-zinc-700 text-zinc-300";
  return base;
}

export default function BlotterPage() {
  const router = useRouter();
  const { filters, setFilters, clearFilters, snapshot, blotters } = useBlotterIndex();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [statsOpen, setStatsOpen] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return window.matchMedia("(min-width: 640px)").matches;
  });

  const hasFilters = useMemo(
    () => !!(filters.q || filters.status || filters.tag),
    [filters]
  );

  return (
      <div className="min-h-screen pb-24">
        <div className="space-y-4">
          {/* Snapshot */}
          <section aria-label="Blotter Snapshot">
            <button
              onClick={() => setStatsOpen((s) => !s)}
              className="w-full flex items-center justify-between bg-zinc-900/40 border border-zinc-800 rounded-2xl px-4 py-3
                focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
              aria-label="Toggle blotter snapshot"
            >
              <span className="font-medium">Blotter Snapshot</span>
              <span className="text-zinc-400 text-sm">{statsOpen ? "Hide" : "Show"}</span>
            </button>

            {statsOpen && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                <StatTile label="Total Cases" value={snapshot.total} />
                <StatTile label="Active" value={snapshot.active} />
                <StatTile label="Settled" value={snapshot.settled} />
              </div>
            )}
          </section>

          {/* Actions & Controls */}
          <section className="sticky top-[72px] z-20 bg-zinc-950 pb-2 pt-1">
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-3 space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl min-h-[48px] flex items-center justify-center
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
                  aria-label="Create new blotter case"
                >
                  <Plus className="mr-2 h-5 w-5"/> New Case
                </button>

                <input
                  type="text"
                  placeholder="Search case #, names, tags, narrative..."
                  value={filters.q}
                  onChange={(e) => setFilters((p) => ({ ...p, q: e.target.value }))}
                  className="flex-1 min-h-[48px] px-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600
                    focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
                  aria-label="Search blotter"
                />

                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-300 min-h-[48px]
                      focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
                    aria-label="Clear filters"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Status chips */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {STATUS_CHIPS.map((st) => (
                  <Chip
                    key={st}
                    label={st}
                    active={filters.status === st}
                    onClick={() =>
                      setFilters((f) => ({ ...f, status: f.status === st ? undefined : st }))
                    }
                  />
                ))}
              </div>
            </div>
          </section>

          {/* List */}
          <section className="space-y-2">
            {blotters.length === 0 ? (
                <div className="pt-8">
                    <EmptyState 
                        type={hasFilters ? 'no-results' : 'no-data'}
                        title={hasFilters ? 'No Matches Found' : 'No Cases Yet'}
                        body={hasFilters ? 'Try a different search term or clear the filters.' : 'Create the first blotter case record for your barangay.'}
                        actionText={hasFilters ? 'Clear Filters' : 'Create New Case'}
                        onAction={hasFilters ? clearFilters : () => setIsModalOpen(true)}
                    />
                </div>
            ) : (
              blotters.map((b) => (
                <button
                  key={b.id}
                  onClick={() => router.push(`/blotter/${b.id}`)}
                  className="w-full text-left flex items-center p-4 bg-zinc-900/40 border border-zinc-800 rounded-2xl min-h-[48px]
                    focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950 transition-colors hover:bg-zinc-800/60"
                  aria-label={`Open case ${b.caseNumber}`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 font-bold text-xs mr-4 px-2 text-center">
                    {b.caseNumber}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-zinc-100 truncate">
                      {(b.complainants?.[0]?.name || "Complainant")} vs {(b.respondents?.[0]?.name || "Respondent")}
                    </h3>
                    <p className="text-zinc-400 text-sm truncate">
                      {new Date(b.incidentDate).toLocaleDateString()} • {b.tags?.slice(0, 3).join(", ") || "No tags"}
                    </p>
                  </div>

                  <div className={statusPill(b.status)}>{b.status}</div>
                </button>
              ))
            )}
          </section>
        </div>
        <NewCaseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </div>
  );
}

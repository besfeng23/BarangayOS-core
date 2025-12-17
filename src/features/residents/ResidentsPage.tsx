"use client";
import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useResidentsData, calcAge } from "@/hooks/useResidentsData";
import { TerminalShell } from "@/layouts/TerminalShell";
import { SystemRail } from "@/components/SystemRail";
import { BottomNav } from "@/components/BottomNav";

const CHIP_PUROK = ["Purok 1", "Purok 2", "Purok 3", "Purok 4"];
const CHIP_SEX = ["Male", "Female", "Other"];
const CHIP_STATUS = ["ACTIVE", "INACTIVE"];

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
        focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950`}
      aria-label={`Filter ${label}`}
    >
      {label}
    </button>
  );
}

export default function ResidentsPage() {
  const router = useRouter();
  const { filters, setFilters, residents, snapshot, residentNewDraft, clearDraft } = useResidentsData();

  const [statsOpen, setStatsOpen] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return window.matchMedia("(min-width: 640px)").matches;
  });

  const hasFilters = useMemo(() => !!(filters.q || filters.purok || filters.sex || filters.status), [filters]);

  return (
    <TerminalShell>
      <SystemRail />
      <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-24">
        <div className="max-w-6xl mx-auto px-4 pt-4 space-y-4">
          {/* Draft Banner */}
          {residentNewDraft && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
              <div>
                <div className="text-zinc-100 font-semibold">Unsaved Draft: Resident Registration</div>
                <div className="text-zinc-400 text-sm">Resume where you left off</div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => router.push("/residents/new")}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-2xl bg-zinc-800 border border-zinc-700 text-zinc-100 font-semibold
                    focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
                >
                  Resume
                </button>
                <button
                  onClick={async () => {
                    if (confirm("Discard this draft?")) await clearDraft("resident:new");
                  }}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-300
                    focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
                >
                  Discard
                </button>
              </div>
            </div>
          )}

          {/* Zone 1: Snapshot */}
          <section aria-label="Population Snapshot">
            <button
              onClick={() => setStatsOpen((s) => !s)}
              className="w-full flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3
                focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
              aria-label="Toggle population snapshot"
            >
              <span className="font-medium">Population Snapshot</span>
              <span className="text-zinc-400 text-sm">{statsOpen ? "Hide" : "Show"}</span>
            </button>
            {statsOpen && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                <StatTile label="Total Population" value={snapshot.total} />
                <StatTile label="Active" value={snapshot.active} />
                <StatTile label="Inactive" value={snapshot.inactive} />
              </div>
            )}
          </section>

          {/* Zone 2: Actions & Controls */}
          <section className="sticky top-[72px] z-20 bg-zinc-950 pb-2 pt-1">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => router.push("/residents/new")}
                  className="px-6 py-3 bg-zinc-100 text-zinc-950 font-bold rounded-2xl
                    focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
                  aria-label="Register resident"
                >
                  Register Resident
                </button>

                <input
                  type="text"
                  placeholder="Filter list..."
                  value={filters.q}
                  onChange={(e) => setFilters((p) => ({ ...p, q: e.target.value }))}
                  className="flex-1 min-h-[48px] px-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600
                    focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
                  aria-label="Filter residents"
                />

                {hasFilters && (
                  <button
                    onClick={() => setFilters({ q: "" })}
                    className="px-4 py-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-300
                      focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
                    aria-label="Clear filters"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1">
                {CHIP_PUROK.map((p) => (
                  <Chip
                    key={p}
                    label={p}
                    active={filters.purok === p}
                    onClick={() => setFilters((f) => ({ ...f, purok: f.purok === p ? undefined : p }))}
                  />
                ))}
                <div className="w-px h-7 bg-zinc-800 my-auto mx-1" />
                {CHIP_SEX.map((s) => (
                  <Chip
                    key={s}
                    label={s}
                    active={filters.sex === s}
                    onClick={() => setFilters((f) => ({ ...f, sex: f.sex === s ? undefined : s }))}
                  />
                ))}
                <div className="w-px h-7 bg-zinc-800 my-auto mx-1" />
                {CHIP_STATUS.map((st) => (
                  <Chip
                    key={st}
                    label={st}
                    active={filters.status === st}
                    onClick={() => setFilters((f) => ({ ...f, status: f.status === st ? undefined : (st as any) }))}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Zone 3: List */}
          <section className="space-y-2">
            {residents.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-zinc-800 rounded-2xl text-zinc-500">
                No residents found. <br /> Register a new resident to begin.
              </div>
            ) : (
              residents.map((r) => (
                <button
                  key={r.id}
                  onClick={() => router.push(`/residents/${r.id}`)}
                  className="w-full text-left flex items-center p-4 bg-zinc-900 border border-zinc-800 rounded-2xl min-h-[48px]
                    focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
                  aria-label={`Open resident ${r.lastName}, ${r.firstName}`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 font-bold text-lg mr-4">
                    {r.lastName.charAt(0)}
                    {r.firstName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-zinc-100 truncate">
                      {r.lastName.toUpperCase()}, {r.firstName}
                    </h3>
                    <p className="text-zinc-400 text-sm truncate">
                      {calcAge(r.birthdate)} y/o • {r.sex} • {r.purok}
                    </p>
                    <p className="text-zinc-400 text-sm truncate">{r.addressLine1}</p>
                  </div>
                  <div className="ml-2 px-2 py-1 rounded text-xs font-medium border bg-zinc-900 border-zinc-700 text-zinc-300">
                    {r.status}
                  </div>
                </button>
              ))
            )}
          </section>
        </div>

        <BottomNav />
      </div>
    </TerminalShell>
  );
}

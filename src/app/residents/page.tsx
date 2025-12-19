"use client";

import React, { useState } from "react";
import TerminalShell from "@/components/shell/TerminalShell";
import { useResidents } from "@/hooks/useResidents";

export default function ResidentsPage() {
  const { query, setQuery, items, loading, error, reload, tools } = useResidents();
  const [resetting, setResetting] = useState(false);

  const handleReset = async () => {
    if (!window.confirm("Are you sure you want to reset the local database? All unsynced data will be lost.")) {
        return;
    }
    setResetting(true);
    try {
      await tools.resetLocalDatabase();
      window.location.reload();
    } finally {
      setResetting(false);
    }
  };

  return (
    <TerminalShell>
      <div className="mx-auto w-full max-w-3xl p-4 md:p-6">
        <div className="mb-4">
          <h1 className="text-zinc-100 text-xl font-semibold">Residents</h1>
          <p className="text-zinc-400 text-sm mt-1">Offline-first resident directory.</p>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-900/50 bg-red-950/30 p-4">
            <div className="text-zinc-100 text-sm font-semibold">Local database error</div>
            <div className="text-zinc-300 text-sm mt-1">{error}</div>
            <div className="text-zinc-400 text-xs mt-2">
              Local DB version: {tools.dbVersion}. Use reset only if you accept clearing local-only data.
            </div>
            <div className="mt-3 flex gap-2">
              <button
                className="h-12 rounded-xl bg-zinc-100 text-zinc-950 px-4 font-semibold"
                onClick={reload}
              >
                Retry
              </button>
              <button
                className={[
                  "h-12 rounded-xl px-4 font-semibold",
                  resetting ? "bg-zinc-800 text-zinc-400" : "bg-zinc-950 border border-zinc-800 text-zinc-100",
                ].join(" ")}
                onClick={handleReset}
                disabled={resetting}
              >
                {resetting ? "Resetting…" : "Reset Local Data"}
              </button>
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
          <input
            className="h-12 w-full rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 px-3"
            placeholder="Search name, household no, ID…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="mt-3 text-xs text-zinc-400">
            {loading ? "Loading…" : `${items.length} result(s)`}
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {items.length === 0 && !loading ? (
            <div className="text-zinc-400 text-sm">No residents found.</div>
          ) : (
            items.map((r) => (
              <div key={r.id} className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
                <div className="text-zinc-100 text-sm font-semibold">{r.fullName}</div>
                <div className="text-zinc-400 text-xs mt-1">
                  {r.householdNo ? `Household: ${r.householdNo}` : "Household: —"} • ID: {r.id}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </TerminalShell>
  );
}

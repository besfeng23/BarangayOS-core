"use client";

import React from "react";
import TerminalShell from "@/components/shell/TerminalShell";
import { useActivityHistory } from "@/hooks/useActivityHistory";

export default function HistoryPage() {
  const h = useActivityHistory();

  return (
    <TerminalShell>
      <div className="mx-auto w-full max-w-3xl p-4 md:p-6">
        <div className="mb-4">
          <h1 className="text-zinc-100 text-3xl font-semibold">Activity History</h1>
          <p className="text-zinc-400 text-sm mt-2">Recent actions recorded on this device (offline-safe).</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="text-zinc-100 text-lg font-semibold">Recent Actions</div>

          <input
            className="mt-3 h-12 w-full rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 px-3"
            placeholder="Search action, name, ID…"
            value={h.query}
            onChange={(e) => h.setQuery(e.target.value)}
          />

          <div className="mt-3 text-xs text-zinc-400">
            {h.loading ? "Loading…" : `${h.items.length} item(s)`}
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {h.items.length === 0 && !h.loading ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 text-zinc-400 text-sm">
              No activity has been recorded yet.
            </div>
          ) : (
            h.items.map((a) => (
              <div
                key={a.id}
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-zinc-100 text-sm font-semibold">{a.title}</div>
                    <div className="text-zinc-400 text-xs mt-1">{a.subtitle}</div>
                  </div>
                  <div className="text-zinc-400 text-xs">
                    {new Date(a.occurredAtISO).toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </TerminalShell>
  );
}

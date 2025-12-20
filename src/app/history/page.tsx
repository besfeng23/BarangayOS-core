
"use client";

import React from "react";
import { useActivityHistory } from "@/hooks/useActivityHistory";

export default function HistoryPage() {
  const h = useActivityHistory();

  return (
      <div className="mx-auto w-full max-w-3xl p-4 md:p-6">
        <div className="mb-4">
          <h1 className="text-white text-3xl font-semibold">Activity History</h1>
          <p className="text-slate-200 text-sm mt-2">Mga huling ginawa sa device na ito (offline-safe).</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div className="text-white text-lg font-semibold">Mga Huling Aksyon</div>

          <input
            className="mt-3 h-12 w-full rounded-xl bg-zinc-950 border border-zinc-800 text-white px-3"
            placeholder="Hanapin ang aksyon, pangalan, ID…"
            value={h.query}
            onChange={(e) => h.setQuery(e.target.value)}
          />

          <div className="mt-3 text-xs text-slate-200">
            {h.loading ? "Nagloload…" : `${h.items.length} item(s)`}
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {h.items.length === 0 && !h.loading ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 text-slate-200 text-sm">
              Wala pang naitatalang aktibidad.
            </div>
          ) : (
            h.items.map((a) => (
              <div
                key={a.id}
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-white text-sm font-semibold">{a.title}</div>
                    <div className="text-slate-200 text-xs mt-1">{a.subtitle}</div>
                  </div>
                  <div className="text-slate-200 text-xs">
                    {new Date(a.occurredAtISO).toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
  );
}

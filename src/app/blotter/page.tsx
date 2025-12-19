"use client";

import React from "react";
import { useSyncQueue } from "@/hooks/bos/useSyncQueue";
import { useBlotterLite } from "@/hooks/blotter/useBlotterLite";

export default function BlotterPage() {
  const { enqueue } = useSyncQueue();
  const ws = useBlotterLite();

  return (
      <div className="mx-auto w-full max-w-3xl p-4 md:p-6">
        {/* LIST VIEW */}
        {ws.view === "list" && (
          <>
            <div className="mb-4">
              <h1 className="text-zinc-100 text-xl font-semibold">Blotter</h1>
              <p className="text-zinc-400 text-sm mt-1">Simple incident logbook.</p>
            </div>

            {ws.banner && (
              <div
                className={[
                  "mb-4 rounded-2xl border p-4",
                  ws.banner.kind === "error"
                    ? "border-red-900/50 bg-red-950/30"
                    : "border-emerald-900/40 bg-emerald-950/20",
                ].join(" ")}
              >
                <div className="text-zinc-100 text-sm font-medium">
                  {ws.banner.kind === "error" ? "Action required" : "Saved"}
                </div>
                <div className="text-zinc-300 text-sm mt-1">{ws.banner.msg}</div>
              </div>
            )}

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
              <input
                className="h-12 w-full rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 px-3"
                placeholder="Search name, location, keyword…"
                value={ws.query}
                onChange={(e) => ws.setQuery(e.target.value)}
              />

              <button
                className="mt-3 h-12 w-full rounded-xl bg-zinc-100 text-zinc-950 font-semibold"
                onClick={ws.newRecord}
              >
                + New Blotter
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {ws.items.length === 0 ? (
                <div className="text-zinc-400 text-sm text-center py-8">No records yet.</div>
              ) : (
                ws.items.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => ws.openRecord(b.id)}
                    className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 text-left hover:bg-zinc-900/60"
                  >
                    <div className="text-zinc-100 text-sm font-semibold truncate">
                      {b.complainantName} vs {b.respondentName}
                    </div>
                    <div className="text-zinc-400 text-xs mt-1 truncate">{ws.listSubtitle(b)}</div>
                  </button>
                ))
              )}
            </div>
          </>
        )}

        {/* FORM VIEW */}
        {ws.view === "form" && (
          <>
            <button
              className="mb-3 h-12 rounded-xl bg-zinc-900/40 border border-zinc-800 text-zinc-100 px-4 font-semibold"
              onClick={ws.backToList}
            >
              ← Back to list
            </button>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
              <div className="text-zinc-100 text-sm font-semibold">
                {ws.selectedId ? "Edit Blotter" : "New Blotter"}
              </div>

              {/* Required fields only (Lola-proof) */}
              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-zinc-400 text-xs mb-1">Incident Date</label>
                  <input
                    type="date"
                    className="h-12 w-full rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 px-3"
                    value={ws.draft.incidentDate}
                    onChange={(e) => ws.setDraft((d) => ({ ...d, incidentDate: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 text-xs mb-1">Location</label>
                  <input
                    className="h-12 w-full rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 px-3"
                    placeholder="Purok / Sitio / Street"
                    value={ws.draft.locationText}
                    onChange={(e) => ws.setDraft((d) => ({ ...d, locationText: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 text-xs mb-1">Complainant Name</label>
                  <input
                    className="h-12 w-full rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 px-3"
                    value={ws.draft.complainantName}
                    onChange={(e) => ws.setDraft((d) => ({ ...d, complainantName: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 text-xs mb-1">Respondent Name</label>
                  <input
                    className="h-12 w-full rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 px-3"
                    value={ws.draft.respondentName}
                    onChange={(e) => ws.setDraft((d) => ({ ...d, respondentName: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 text-xs mb-1">Narrative</label>
                  <textarea
                    className="min-h-[160px] w-full rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 p-3"
                    placeholder="Describe what happened…"
                    value={ws.draft.narrative}
                    onChange={(e) => ws.setDraft((d) => ({ ...d, narrative: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 text-xs mb-1">Status</label>
                  <select
                    className="h-12 w-full rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 px-3"
                    value={ws.draft.status}
                    onChange={(e) => ws.setDraft((d) => ({ ...d, status: e.target.value as any }))}
                  >
                    <option>Pending</option>
                    <option>Resolved</option>
                  </select>
                </div>

                {/* Optional fields behind a simple toggle */}
                <button
                  className="h-12 w-full rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 font-semibold"
                  onClick={() => ws.setMoreOpen((v) => !v)}
                  type="button"
                >
                  {ws.moreOpen ? "Hide more details" : "More details (optional)"}
                </button>

                {ws.moreOpen && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-zinc-400 text-xs mb-1">Complainant Contact</label>
                      <input
                        className="h-12 w-full rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 px-3"
                        value={ws.draft.complainantContact ?? ""}
                        onChange={(e) => ws.setDraft((d) => ({ ...d, complainantContact: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-400 text-xs mb-1">Respondent Contact</label>
                      <input
                        className="h-12 w-full rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 px-3"
                        value={ws.draft.respondentContact ?? ""}
                        onChange={(e) => ws.setDraft((d) => ({ ...d, respondentContact: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-400 text-xs mb-1">Actions Taken</label>
                      <textarea
                        className="min-h-[100px] w-full rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 p-3"
                        value={ws.draft.actionsTaken ?? ""}
                        onChange={(e) => ws.setDraft((d) => ({ ...d, actionsTaken: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-400 text-xs mb-1">Settlement</label>
                      <textarea
                        className="min-h-[100px] w-full rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 p-3"
                        value={ws.draft.settlement ?? ""}
                        onChange={(e) => ws.setDraft((d) => ({ ...d, settlement: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-400 text-xs mb-1">Notes</label>
                      <textarea
                        className="min-h-[90px] w-full rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 p-3"
                        value={ws.draft.notes ?? ""}
                        onChange={(e) => ws.setDraft((d) => ({ ...d, notes: e.target.value }))}
                      />
                    </div>
                  </div>
                )}

                {ws.banner && ws.banner.kind === "error" && (
                  <div className="rounded-2xl border border-red-900/50 bg-red-950/30 p-3">
                    <div className="text-zinc-100 text-sm font-semibold">Fix this</div>
                    <div className="text-zinc-300 text-sm mt-1">{ws.banner.msg}</div>
                  </div>
                )}

                <button
                  className={[
                    "h-12 w-full rounded-xl font-semibold",
                    ws.loading ? "bg-zinc-800 text-zinc-400 cursor-not-allowed" : "bg-zinc-100 text-zinc-950",
                  ].join(" ")}
                  disabled={ws.loading}
                  onClick={() => ws.save(enqueue)}
                >
                  {ws.loading ? "Saving…" : "Save Blotter"}
                </button>

                <div className="text-xs text-zinc-400">
                  Works offline: saved locally first, queued for sync automatically.
                </div>
              </div>
            </div>
          </>
        )}
      </div>
  );
}

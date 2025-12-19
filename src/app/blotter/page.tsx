
"use client";

import React from "react";
import { useSyncQueue } from "@/hooks/bos/useSyncQueue";
import { useBlotterWorkstation } from "@/hooks/blotter/useBlotterWorkstation";
import { ResidentPicker } from "@/components/shared/ResidentPicker";
import { SmartDateInput } from "@/components/ui/SmartDateInput";

export default function BlotterPage() {
  const { enqueue } = useSyncQueue();
  const ws = useBlotterWorkstation();

  const onPrint = async () => {
    try {
      await ws.buildAndPrint();
    } catch (e: any) {
      ws.setBanner({ kind: "error", msg: e?.message ?? String(e) });
    }
  };

  return (
      <div className="mx-auto w-full max-w-3xl p-4 md:p-6">
        {ws.mode === "list" && (
          <>
            <div className="mb-4">
              <h1 className="text-zinc-100 text-xl font-semibold">Blotter</h1>
              <p className="text-zinc-400 text-sm mt-1">Simple incident logbook.</p>
            </div>

            {ws.banner && (
              <div className={[
                "mb-4 rounded-2xl border p-4",
                ws.banner.kind === "error" ? "border-red-900/50 bg-red-950/30" : "border-emerald-900/40 bg-emerald-950/20"
              ].join(" ")}>
                <div className="text-zinc-100 text-sm font-semibold">
                  {ws.banner.kind === "error" ? "Fix this" : "Status"}
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
                onClick={ws.newBlotter}
              >
                + New Blotter
              </button>
              <div className="mt-3 text-xs text-zinc-400">
                {ws.loading ? "Loading…" : `${ws.items.length} record(s)`}
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {ws.items.length === 0 && !ws.loading ? (
                <div className="text-zinc-400 text-sm">No records yet.</div>
              ) : (
                ws.items.map((b) => (
                  <button
                    key={b.id}
                    className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 text-left hover:bg-zinc-900/60"
                    onClick={() => ws.editBlotter(b.id)}
                  >
                    <div className="text-zinc-100 text-sm font-semibold">
                      {b.complainantName} vs {b.respondentName}
                    </div>
                    <div className="text-zinc-400 text-xs mt-1">
                      {new Date(b.incidentDateISO).toLocaleDateString()} • {b.locationText} • {b.status}
                    </div>
                  </button>
                ))
              )}
            </div>
          </>
        )}

        {ws.mode === "form" && (
          <>
            <button
              className="mb-3 h-12 rounded-xl bg-zinc-900/40 border border-zinc-800 text-zinc-100 px-4 font-semibold"
              onClick={ws.backToList}
            >
              ← Back
            </button>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
              <div className="text-zinc-100 text-sm font-semibold">
                {ws.draft.id ? "Edit Blotter Record" : "New Blotter Record"}
              </div>

              {/* Required fields */}
              <div className="mt-4 space-y-3">
                <div>
                  <SmartDateInput
                    label="Incident Date *"
                    value={ws.draft.incidentDateISO}
                    onChange={(v) => ws.setDraft((d) => ({ ...d, incidentDateISO: v }))}
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 text-xs mb-1">Location *</label>
                  <input
                    className="h-12 w-full rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 px-3"
                    value={ws.draft.locationText}
                    onChange={(e) => ws.setDraft((d) => ({ ...d, locationText: e.target.value }))}
                  />
                </div>
                
                <ResidentPicker
                    label="Complainant"
                    value={ws.draft.complainant}
                    onChange={(val) => ws.setDraft(d => ({ ...d, complainant: val }))}
                />
                
                <ResidentPicker
                    label="Respondent"
                    value={ws.draft.respondent}
                    onChange={(val) => ws.setDraft(d => ({ ...d, respondent: val }))}
                />

                <div>
                  <label className="block text-zinc-400 text-xs mb-1">Narrative *</label>
                  <textarea
                    className="min-h-[120px] w-full rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 px-3 py-2"
                    value={ws.draft.narrative}
                    onChange={(e) => ws.setDraft((d) => ({ ...d, narrative: e.target.value }))}
                  />
                </div>

                <button
                  className="h-12 w-full rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 font-semibold"
                  onClick={() => ws.setMore(!ws.more)}
                >
                  {ws.more ? "Hide more details" : "More details (optional)"}
                </button>

                {ws.more && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-zinc-400 text-xs mb-1">Complainant Contact</label>
                      <input
                        className="h-12 w-full rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 px-3"
                        value={ws.draft.actionsTaken}
                        onChange={(e) => ws.setDraft((d) => ({ ...d, actionsTaken: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-400 text-xs mb-1">Respondent Contact</label>
                      <input
                        className="h-12 w-full rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 px-3"
                        value={ws.draft.actionsTaken}
                        onChange={(e) => ws.setDraft((d) => ({ ...d, actionsTaken: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-400 text-xs mb-1">Actions Taken</label>
                      <textarea
                        className="min-h-[90px] w-full rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 px-3 py-2"
                        value={ws.draft.actionsTaken}
                        onChange={(e) => ws.setDraft((d) => ({ ...d, actionsTaken: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-400 text-xs mb-1">Settlement</label>
                      <textarea
                        className="min-h-[90px] w-full rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 px-3 py-2"
                        value={ws.draft.settlement}
                        onChange={(e) => ws.setDraft((d) => ({ ...d, settlement: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-400 text-xs mb-1">Notes</label>
                      <textarea
                        className="min-h-[90px] w-full rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 px-3 py-2"
                        value={ws.draft.notes}
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
                    ws.busy || !ws.canSave ? "bg-zinc-800 text-zinc-400 cursor-not-allowed" : "bg-zinc-100 text-zinc-950"
                  ].join(" ")}
                  disabled={ws.busy || !ws.canSave}
                  onClick={() => ws.save(enqueue)}
                >
                  {ws.busy ? "Saving…" : "Save Record"}
                </button>

                <button
                  className={[
                    "h-12 w-full rounded-xl font-semibold border border-zinc-800",
                    ws.busy || !ws.draft.id ? "bg-zinc-900/40 text-zinc-400 cursor-not-allowed" : "bg-zinc-950 text-zinc-100"
                  ].join(" ")}
                  disabled={ws.busy || !ws.draft.id}
                  onClick={() => ws.resolve(enqueue)}
                >
                  Mark as Resolved
                </button>

                <button
                  className={[
                    "h-12 w-full rounded-xl font-semibold border border-zinc-800",
                    !ws.draft.id ? "bg-zinc-900/40 text-zinc-400 cursor-not-allowed" : "bg-zinc-950 text-zinc-100"
                  ].join(" ")}
                  disabled={!ws.draft.id}
                  onClick={onPrint}
                >
                  Print Record
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

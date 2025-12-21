
"use client";

import React from "react";
import { useSyncQueue } from "@/hooks/bos/useSyncQueue";
import { useBlotterWorkstation } from "@/hooks/blotter/useBlotterWorkstation";
import { ResidentPicker } from "@/components/shared/ResidentPicker";
import { SmartDateInput } from "@/components/ui/SmartDateInput";
import AIAssistButton from "@/components/ai/AIAssistButton";
import AIDrawer from "@/components/ai/AIDrawer";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
    <>
      <div className="mx-auto w-full max-w-3xl p-4 md:p-6">
        {ws.mode === "list" && (
          <>
            <div className="mb-4">
              <h1 className="text-white text-xl font-semibold">Blotter Records</h1>
              <p className="text-slate-200 text-sm mt-1">Logbook for community incidents.</p>
            </div>

            {ws.banner && (
              <div className={[
                "mb-4 rounded-2xl border p-4",
                ws.banner.kind === "error" ? "border-red-900/50 bg-red-950/30" : "border-emerald-900/40 bg-emerald-950/20"
              ].join(" ")}>
                <div className="text-white text-sm font-semibold">
                  {ws.banner.kind === "error" ? "Error" : "Success"}
                </div>
                <div className="text-slate-200 text-sm mt-1">{ws.banner.msg}</div>
              </div>
            )}

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
              <Input
                className="h-14 text-lg"
                placeholder="Search name, location, or keyword…"
                value={ws.query}
                onChange={(e) => ws.setQuery(e.target.value)}
              />
              <button
                className="mt-3 h-14 w-full rounded-xl bg-zinc-100 text-zinc-950 font-semibold text-lg"
                onClick={ws.newBlotter}
              >
                + File New Blotter
              </button>
              <div className="mt-3 text-xs text-slate-200">
                {ws.loading ? "Loading…" : `${ws.items.length} record(s)`}
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {ws.items.length === 0 && !ws.loading ? (
                <div className="text-slate-200 text-sm p-4 text-center border-2 border-dashed border-zinc-800 rounded-2xl">No records found. Click 'File New Blotter' to start.</div>
              ) : (
                ws.items.map((b) => (
                  <button
                    key={b.id}
                    className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 text-left hover:bg-zinc-900/60 h-auto"
                    onClick={() => ws.editBlotter(b.id)}
                  >
                    <div className="text-white text-sm font-semibold">
                      {b.complainantName} vs {b.respondentName}
                    </div>
                    <div className="text-slate-200 text-xs mt-1">
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
              className="mb-3 h-12 rounded-xl bg-zinc-900/40 border border-zinc-800 text-white px-4 font-semibold"
              onClick={ws.backToList}
            >
              ← Back to List
            </button>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
              <div className="text-white text-lg font-semibold mb-4">
                {ws.draft.id ? "Edit Blotter Record" : "New Blotter Record"}
              </div>

              {/* Required fields */}
              <div className="space-y-6">
                <SmartDateInput
                  labelText="Date of Incident *"
                  value={ws.draft.incidentDateISO}
                  onChange={(v) => ws.setDraft((d) => ({ ...d, incidentDateISO: v }))}
                />

                <div>
                  <label className="block text-slate-200 text-sm mb-1 font-medium">Location of Incident *</label>
                  <Input
                    className="h-14 text-lg"
                    value={ws.draft.locationText}
                    onChange={(e) => ws.setDraft((d) => ({ ...d, locationText: e.target.value }))}
                  />
                  {!ws.draft.locationText.trim() && ws.banner && <p className="text-red-400 text-sm mt-1">{ws.banner.msg}</p>}
                </div>
                
                <ResidentPicker
                    label="Complainant *"
                    value={ws.draft.complainant}
                    onChange={(val) => ws.setDraft(d => ({ ...d, complainant: val }))}
                    allowManual={false}
                    errorMessage="A valid resident must be selected as complainant."
                />
                
                <ResidentPicker
                    label="Respondent *"
                    value={ws.draft.respondent}
                    onChange={(val) => ws.setDraft(d => ({ ...d, respondent: val }))}
                    allowManual={false}
                    errorMessage="A valid resident must be selected as respondent."
                />

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-slate-200 text-sm font-medium">Narrative *</label>
                  </div>
                  <Textarea
                    className="min-h-[150px] text-lg"
                    value={ws.draft.narrative}
                    onChange={(e) => ws.setDraft((d) => ({ ...d, narrative: e.target.value }))}
                  />
                  {!ws.draft.narrative.trim() && ws.banner && <p className="text-red-400 text-sm mt-1">{ws.banner.msg}</p>}
                </div>

                {ws.banner && ws.banner.kind === "error" && (
                  <div className="rounded-2xl border border-red-900/50 bg-red-950/30 p-3">
                    <div className="text-white text-sm font-semibold">Please fix this</div>
                    <div className="text-slate-200 text-sm mt-1">{ws.banner.msg}</div>
                  </div>
                )}

                <button
                  className={[
                    "h-14 w-full rounded-xl font-semibold text-lg flex items-center justify-center",
                    ws.busy || !ws.canSave ? "bg-zinc-800 text-slate-200 cursor-not-allowed" : "bg-zinc-100 text-zinc-950"
                  ].join(" ")}
                  disabled={ws.busy || !ws.canSave}
                  onClick={() => ws.save(enqueue)}
                >
                  {ws.busy ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
                  {ws.busy ? "Saving…" : "Save Case"}
                </button>

                <button
                  className={[
                    "h-14 w-full rounded-xl font-semibold border border-zinc-800 text-lg",
                    ws.busy || !ws.draft.id ? "bg-zinc-900/40 text-slate-200 cursor-not-allowed" : "bg-zinc-950 text-white"
                  ].join(" ")}
                  disabled={ws.busy || !ws.draft.id}
                  onClick={() => ws.resolve(enqueue)}
                >
                  Mark as 'Resolved'
                </button>

                <button
                  className={[
                    "h-14 w-full rounded-xl font-semibold border border-zinc-800 text-lg",
                    !ws.draft.id ? "bg-zinc-900/40 text-slate-200 cursor-not-allowed" : "bg-zinc-950 text-white"
                  ].join(" ")}
                  disabled={!ws.draft.id}
                  onClick={onPrint}
                >
                  Print Record
                </button>

                <div className="text-xs text-slate-400 text-center">
                  All changes are saved locally first, then synced to the cloud when online.
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <AIDrawer
        isOpen={ws.isAiDrawerOpen}
        onClose={ws.closeAiDrawer}
        originalText={ws.draft.narrative}
        onDraft={ws.handleAiDraft}
      />
    </>
  );
}

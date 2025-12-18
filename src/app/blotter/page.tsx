"use client";

import React from "react";
import TerminalShell from "@/components/shell/TerminalShell";
import { useSyncQueue } from "@/hooks/bos/useSyncQueue";
import { useBlotterWorkstation } from "@/hooks/blotter/useBlotterWorkstation";

function pillClass(active: boolean) {
  return [
    "h-12 rounded-xl border px-4 text-sm font-semibold",
    active
      ? "bg-zinc-100 text-zinc-950 border-zinc-100"
      : "bg-zinc-950 text-zinc-300 border-zinc-800",
  ].join(" ");
}

export default function BlotterPage() {
  const { enqueue } = useSyncQueue();
  const ws = useBlotterWorkstation("draft:blotter:new");

  return (
    <TerminalShell>
      <div className="mx-auto w-full max-w-6xl p-4 md:p-6">
        <div className="mb-4">
          <h1 className="text-zinc-100 text-xl font-semibold">Blotter</h1>
          <p className="text-zinc-400 text-sm mt-1">Record incidents, queue offline, and keep an audit trail.</p>
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
              {ws.banner.kind === "error" ? "Action required" : "Status"}
            </div>
            <div className="text-zinc-300 text-sm mt-1">{ws.banner.msg}</div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* LEFT: Logbook */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
            <div className="flex items-center gap-2">
              <input
                className="h-12 w-full rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 px-3"
                placeholder="Search name, location, keywords, ID…"
                value={ws.query}
                onChange={(e) => ws.setQuery(e.target.value)}
              />
              <button className="h-12 rounded-xl bg-zinc-100 text-zinc-950 px-4 font-semibold" onClick={ws.reload}>
                Refresh
              </button>
            </div>

            <div className="mt-3 flex gap-2">
              <button className={pillClass(ws.statusFilter === "All")} onClick={() => ws.setStatusFilter("All")}>
                All
              </button>
              <button className={pillClass(ws.statusFilter === "Pending")} onClick={() => ws.setStatusFilter("Pending")}>
                Pending
              </button>
              <button className={pillClass(ws.statusFilter === "Resolved")} onClick={() => ws.setStatusFilter("Resolved")}>
                Resolved
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {ws.items.length === 0 ? (
                <div className="text-zinc-400 text-sm">No records found.</div>
              ) : (
                ws.items.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => ws.loadExisting(b.id)}
                    className={[
                      "w-full text-left rounded-2xl border p-4",
                      ws.selectedId === b.id
                        ? "border-zinc-100 bg-zinc-950"
                        : "border-zinc-800 bg-zinc-950/40 hover:bg-zinc-950",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-zinc-100 text-sm font-semibold truncate">
                        {b.complainantName} vs {b.respondentName}
                      </div>
                      <div className={["text-xs font-semibold", b.status === "Pending" ? "text-amber-300" : "text-emerald-300"].join(" ")}>
                        {b.status}
                      </div>
                    </div>
                    <div className="mt-1 text-zinc-400 text-xs truncate">{b.locationText}</div>
                    <div className="mt-2 text-zinc-400 text-xs truncate">ID: {b.id}</div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* RIGHT: Workstation */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
            {ws.hasDraft && !ws.selectedId && (
              <div className="mb-3 rounded-2xl border border-zinc-700 bg-zinc-950 p-4">
                <div className="text-zinc-100 text-sm font-semibold">Draft detected</div>
                <div className="text-zinc-400 text-xs mt-1">Your inputs are autosaved. Continue editing or start fresh.</div>
                <button className="mt-3 h-12 rounded-xl bg-zinc-800 text-zinc-100 px-4 font-semibold" onClick={ws.startNew}>
                  Start New (Clear Draft)
                </button>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="text-zinc-100 text-sm font-semibold">
                {ws.selectedId ? "Edit Blotter Record" : "New Blotter Record"}
              </div>
              <button className="h-12 rounded-xl bg-zinc-800 text-zinc-100 px-4 font-semibold" onClick={ws.startNew}>
                New
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label className="block text-zinc-400 text-xs mb-1">Incident Date</label>
                <input
                  type="date"
                  className="h-12 w-full rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 px-3"
                  value={ws.draft.incidentDateISO.slice(0, 10)}
                  onChange={(e) => {
                    const iso = new Date(e.target.value + "T00:00:00").toISOString();
                    ws.setDraft((d) => ({ ...d, incidentDateISO: iso }));
                  }}
                />
              </div>

              <div>
                <label className="block text-zinc-400 text-xs mb-1">Time (optional)</label>
                <input
                  className="h-12 w-full rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 px-3"
                  placeholder="e.g., 3:30 PM"
                  value={ws.draft.incidentTimeText ?? ""}
                  onChange={(e) => ws.setDraft((d) => ({ ...d, incidentTimeText: e.target.value }))}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-zinc-400 text-xs mb-1">Location</label>
                <input
                  className="h-12 w-full rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 px-3"
                  placeholder="Sitio / Purok / Street"
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
                <label className="block text-zinc-400 text-xs mb-1">Complainant Contact (optional)</label>
                <input
                  className="h-12 w-full rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 px-3"
                  value={ws.draft.complainantContact ?? ""}
                  onChange={(e) => ws.setDraft((d) => ({ ...d, complainantContact: e.target.value }))}
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
                <label className="block text-zinc-400 text-xs mb-1">Respondent Contact (optional)</label>
                <input
                  className="h-12 w-full rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 px-3"
                  value={ws.draft.respondentContact ?? ""}
                  onChange={(e) => ws.setDraft((d) => ({ ...d, respondentContact: e.target.value }))}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-zinc-400 text-xs mb-1">Narrative</label>
                <textarea
                  className="min-h-[130px] w-full rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 p-3"
                  placeholder="Describe the incident clearly…"
                  value={ws.draft.narrative}
                  onChange={(e) => ws.setDraft((d) => ({ ...d, narrative: e.target.value }))}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-zinc-400 text-xs mb-1">Actions Taken (optional)</label>
                <textarea
                  className="min-h-[90px] w-full rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 p-3"
                  placeholder="Mediation steps / warnings / referrals…"
                  value={ws.draft.actionsTaken ?? ""}
                  onChange={(e) => ws.setDraft((d) => ({ ...d, actionsTaken: e.target.value }))}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-zinc-400 text-xs mb-1">Settlement (optional)</label>
                <textarea
                  className="min-h-[90px] w-full rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 p-3"
                  placeholder="Agreement terms / resolution…"
                  value={ws.draft.settlement ?? ""}
                  onChange={(e) => ws.setDraft((d) => ({ ...d, settlement: e.target.value }))}
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

              <div>
                <label className="block text-zinc-400 text-xs mb-1">Tags (optional)</label>
                <input
                  className="h-12 w-full rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 px-3"
                  placeholder="noise, boundary, assault…"
                  value={ws.draft.tagsText ?? ""}
                  onChange={(e) => ws.setDraft((d) => ({ ...d, tagsText: e.target.value }))}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-zinc-400 text-xs mb-1">Notes (optional)</label>
                <textarea
                  className="min-h-[80px] w-full rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 p-3"
                  value={ws.draft.notes ?? ""}
                  onChange={(e) => ws.setDraft((d) => ({ ...d, notes: e.target.value }))}
                />
              </div>
            </div>

            <button
              className={[
                "mt-4 h-12 w-full rounded-xl font-semibold",
                ws.loading ? "bg-zinc-800 text-zinc-400 cursor-not-allowed" : "bg-zinc-100 text-zinc-950",
              ].join(" ")}
              disabled={ws.loading}
              onClick={() => ws.saveLocalAndQueue(enqueue)}
            >
              {ws.loading ? "Saving…" : "Save (Queue for Sync)"}
            </button>

            <div className="mt-3 text-xs text-zinc-400">
              Offline-safe: saved locally first, then queued. No silent failures.
            </div>
          </div>
        </div>
      </div>
    </TerminalShell>
  );
}

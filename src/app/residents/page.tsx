"use client";

import React, { useEffect } from "react";
import TerminalShell from "@/components/shell/TerminalShell";
import { useSyncQueue } from "@/hooks/bos/useSyncQueue";
import { useResidents } from "@/hooks/useResidents";
import { useResidentWorkstation } from "@/hooks/residents/useResidentWorkstation";

export default function ResidentsPage() {
  const { enqueue } = useSyncQueue();
  const list = useResidents();
  const ws = useResidentWorkstation();

  // when we return to list, refresh visible list
  useEffect(() => {
    if (ws.mode === "list") list.reload();
  }, [ws.mode, list]);

  return (
    <TerminalShell>
      <div className="mx-auto w-full max-w-3xl p-4 md:p-6">
        {/* LIST VIEW */}
        {ws.mode === "list" && (
          <>
            <div className="mb-4">
              <h1 className="text-zinc-100 text-xl font-semibold">Residents</h1>
              <p className="text-zinc-400 text-sm mt-1">Offline-first resident directory.</p>
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
                <div className="text-zinc-100 text-sm font-semibold">
                  {ws.banner.kind === "error" ? "Action required" : "Saved"}
                </div>
                <div className="text-zinc-300 text-sm mt-1">{ws.banner.msg}</div>
              </div>
            )}

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
              <input
                className="h-12 w-full rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 px-3"
                placeholder="Search name, household no, ID…"
                value={list.query}
                onChange={(e) => list.setQuery(e.target.value)}
              />
              <button
                className="mt-3 h-12 w-full rounded-xl bg-zinc-100 text-zinc-950 font-semibold"
                onClick={ws.newResident}
              >
                + New Resident
              </button>
              <div className="mt-3 text-xs text-zinc-400">
                {list.loading ? "Loading…" : `${list.items.length} result(s)`}
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {list.items.length === 0 && !list.loading ? (
                <div className="text-zinc-400 text-sm">No residents found.</div>
              ) : (
                list.items.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => ws.editResident(r.id)}
                    className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 text-left hover:bg-zinc-900/60"
                  >
                    <div className="text-zinc-100 text-sm font-semibold">{r.fullName}</div>
                    <div className="text-zinc-400 text-xs mt-1">
                      {r.householdNo ? `Household: ${r.householdNo}` : "Household: —"} • ID: {r.id}
                    </div>
                  </button>
                ))
              )}
            </div>
          </>
        )}

        {/* FORM VIEW */}
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
                {ws.selectedId ? "Edit Resident" : "New Resident"}
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-zinc-400 text-xs mb-1">Full Name *</label>
                  <input
                    className="h-12 w-full rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 px-3"
                    value={ws.draft.fullName}
                    onChange={(e) => ws.setDraft((d) => ({ ...d, fullName: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 text-xs mb-1">Household No.</label>
                  <input
                    className="h-12 w-full rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 px-3"
                    value={ws.draft.householdNo}
                    onChange={(e) => ws.setDraft((d) => ({ ...d, householdNo: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 text-xs mb-1">Address</label>
                  <input
                    className="h-12 w-full rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 px-3"
                    value={ws.draft.addressText}
                    onChange={(e) => ws.setDraft((d) => ({ ...d, addressText: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 text-xs mb-1">Contact</label>
                  <input
                    className="h-12 w-full rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 px-3"
                    value={ws.draft.contact}
                    onChange={(e) => ws.setDraft((d) => ({ ...d, contact: e.target.value }))}
                  />
                </div>

                {ws.banner && ws.banner.kind === "error" && (
                  <div className="rounded-2xl border border-red-900/50 bg-red-950/30 p-3">
                    <div className="text-zinc-100 text-sm font-semibold">Fix this</div>
                    <div className="text-zinc-300 text-sm mt-1">{ws.banner.msg}</div>
                  </div>
                )}

                <button
                  className={[
                    "h-12 w-full rounded-xl font-semibold",
                    !ws.canSave || ws.loading
                      ? "bg-zinc-800 text-zinc-400 cursor-not-allowed"
                      : "bg-zinc-100 text-zinc-950",
                  ].join(" ")}
                  disabled={!ws.canSave || ws.loading}
                  onClick={() => ws.save(enqueue)}
                >
                  {ws.loading ? "Saving…" : "Save Resident"}
                </button>

                <div className="text-xs text-zinc-400">
                  Works offline: saved locally first, queued for sync automatically.
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </TerminalShell>
  );
}

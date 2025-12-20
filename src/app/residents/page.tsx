
"use client";

import React, { useEffect } from "react";
import { useSyncQueue } from "@/hooks/bos/useSyncQueue";
import { useResidents } from "@/hooks/useResidents";
import { useResidentWorkstation } from "@/hooks/residents/useResidentWorkstation";
import { FolderOpen } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ResidentsPage() {
  const router = useRouter();
  const { enqueue } = useSyncQueue();
  const list = useResidents();
  const ws = useResidentWorkstation();

  // when we return to list, refresh visible list
  useEffect(() => {
    if (ws.mode === "list") list.reload();
  }, [ws.mode, list]);

  return (
      <div className="mx-auto w-full max-w-3xl p-4 md:p-6">
        {/* LIST VIEW */}
        {ws.mode === "list" && (
          <>
            <div className="mb-4">
              <h1 className="text-white text-xl font-semibold">Listahan ng Residente</h1>
              <p className="text-slate-200 text-sm mt-1">Direktoryo ng mga residente (gumagana offline).</p>
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
                <div className="text-white text-sm font-semibold">
                  {ws.banner.kind === "error" ? "May problema" : "Nai-save"}
                </div>
                <div className="text-slate-200 text-sm mt-1">{ws.banner.msg}</div>
              </div>
            )}

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
              <input
                className="h-12 w-full rounded-xl bg-zinc-950 border border-zinc-800 text-white px-3"
                placeholder="Hanapin ang pangalan, household no, o ID…"
                value={list.query}
                onChange={(e) => list.setQuery(e.target.value)}
              />
              <button
                className="mt-3 h-12 w-full rounded-xl bg-zinc-100 text-zinc-950 font-semibold"
                onClick={() => router.push('/residents/new')}
              >
                + Mag-add ng Residente
              </button>
              <div className="mt-3 text-xs text-slate-200">
                {list.loading ? "Nagloload…" : `${list.items.length} resulta(s)`}
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {list.items.length === 0 && !list.loading ? (
                 <div className="text-center p-12 border-2 border-dashed border-zinc-800 rounded-2xl">
                    <FolderOpen className="mx-auto h-12 w-12 text-blue-500" />
                    <p className="mt-4 text-slate-200">Walang laman. Pindutin ang 'Mag-add' para magsimula.</p>
                </div>
              ) : (
                list.items.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => ws.editResident(r.id)}
                    className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 text-left hover:bg-zinc-900/60 h-auto"
                  >
                    <div className="text-white text-sm font-semibold">{r.fullName}</div>
                    <div className="text-slate-200 text-xs mt-1">
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
              className="mb-3 h-12 rounded-xl bg-zinc-900/40 border border-zinc-800 text-white px-4 font-semibold"
              onClick={ws.backToList}
            >
              ← Bumalik
            </button>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
              <div className="text-white text-sm font-semibold">
                {ws.selectedId ? "I-edit ang Residente" : "Bagong Residente"}
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-slate-200 text-xs mb-1">Buong Pangalan *</label>
                  <input
                    className="h-12 w-full rounded-xl bg-zinc-950 border border-zinc-800 text-white px-3"
                    value={ws.draft.fullName}
                    onChange={(e) => ws.setDraft((d) => ({ ...d, fullName: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-slate-200 text-xs mb-1">Household No.</label>
                  <input
                    className="h-12 w-full rounded-xl bg-zinc-950 border border-zinc-800 text-white px-3"
                    value={ws.draft.householdNo}
                    onChange={(e) => ws.setDraft((d) => ({ ...d, householdNo: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-slate-200 text-xs mb-1">Tirahan</label>
                  <input
                    className="h-12 w-full rounded-xl bg-zinc-950 border border-zinc-800 text-white px-3"
                    value={ws.draft.addressText}
                    onChange={(e) => ws.setDraft((d) => ({ ...d, addressText: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-slate-200 text-xs mb-1">Kontak</label>
                  <input
                    className="h-12 w-full rounded-xl bg-zinc-950 border border-zinc-800 text-white px-3"
                    value={ws.draft.contact}
                    onChange={(e) => ws.setDraft((d) => ({ ...d, contact: e.target.value }))}
                  />
                </div>

                {ws.banner && ws.banner.kind === "error" && (
                  <div className="rounded-2xl border border-red-900/50 bg-red-950/30 p-3">
                    <div className="text-white text-sm font-semibold">Ayusin ito</div>
                    <div className="text-slate-200 text-sm mt-1">{ws.banner.msg}</div>
                  </div>
                )}

                <button
                  className={[
                    "h-12 w-full rounded-xl font-semibold",
                    !ws.canSave || ws.loading
                      ? "bg-zinc-800 text-slate-200 cursor-not-allowed"
                      : "bg-zinc-100 text-zinc-950",
                  ].join(" ")}
                  disabled={!ws.canSave || ws.loading}
                  onClick={() => ws.save(enqueue)}
                >
                  {ws.loading ? "Nagse-save…" : "I-save ang Residente"}
                </button>

                <div className="text-xs text-slate-200">
                  Gumagana offline: naka-save muna sa device, tapos naka-sync.
                </div>
              </div>
            </div>
          </>
        )}
      </div>
  );
}

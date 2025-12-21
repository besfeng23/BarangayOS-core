
"use client";

import React from "react";
import { useSyncQueue } from "@/hooks/bos/useSyncQueue";
import { useBusinessPermitsWorkstation } from "@/hooks/permits/useBusinessPermitsWorkstation";
import { ResidentPicker } from "@/components/shared/ResidentPicker";
import { Loader2 } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/button";

export default function BusinessPermitsPage() {
  const { enqueue } = useSyncQueue();
  const ws = useBusinessPermitsWorkstation();

  return (
      <div className="mx-auto w-full max-w-3xl p-4 md:p-6">
        {/* LIST VIEW */}
        {ws.mode === "list" && (
          <>
            <div className="mb-4">
              <h1 className="text-zinc-100 text-xl font-semibold">Business Permits</h1>
              <p className="text-zinc-400 text-sm mt-1">Register new businesses or search to renew permits.</p>
            </div>

            {ws.banner && (
              <div className={[
                "mb-4 rounded-2xl border p-4",
                ws.banner.kind === "error" ? "border-red-900/50 bg-red-950/30" : "border-emerald-900/40 bg-emerald-950/20"
              ].join(" ")}>
                <div className="text-zinc-100 text-sm font-semibold">
                  {ws.banner.kind === "error" ? "Error" : "Success"}
                </div>
                <div className="text-zinc-300 text-sm mt-1">{ws.banner.msg}</div>
              </div>
            )}

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
              <input
                className="h-12 w-full rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 px-3"
                placeholder="Search business, owner, address…"
                value={ws.query}
                onChange={(e) => ws.setQuery(e.target.value)}
              />
              <button
                className="mt-3 h-12 w-full rounded-xl bg-zinc-100 text-zinc-950 font-semibold"
                onClick={ws.newBusiness}
              >
                + New Business
              </button>
              <div className="mt-3 text-xs text-zinc-400">
                {ws.loading ? "Loading…" : `${(ws.items || []).length} business(es)`}
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {ws.items && ws.items.length === 0 && !ws.loading ? (
                <div className="pt-8">
                    <EmptyState
                        type={ws.query ? 'no-results' : 'no-data'}
                        title={ws.query ? 'No Matches Found' : 'No Businesses Registered'}
                        body={ws.query ? 'Try a different search term.' : 'Register the first business to get started.'}
                        actionText={ws.query ? 'Clear Search' : 'Register Business'}
                        onAction={ws.query ? () => ws.setQuery('') : ws.newBusiness}
                    />
                </div>
              ) : (
                (ws.items || []).map((b) => (
                  <button
                    key={b.id}
                    className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 text-left hover:bg-zinc-900/60"
                    onClick={() => ws.openBusiness(b.id)}
                  >
                    <div className="text-zinc-100 text-sm font-semibold">{b.businessName}</div>
                    <div className="text-zinc-400 text-xs mt-1">
                      Owner: {b.ownerName} • {b.status} • Last Renewed: {b.latestYear}
                    </div>
                  </button>
                ))
              )}
            </div>
          </>
        )}

        {/* BUSINESS FORM */}
        {ws.mode === "businessForm" && (
          <>
            <button
              className="mb-3 h-12 rounded-xl bg-zinc-900/40 border border-zinc-800 text-zinc-100 px-4 font-semibold"
              onClick={ws.backToList}
            >
              ← Back to List
            </button>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
              <div className="text-zinc-100 text-sm font-semibold">
                {ws.bizDraft.id ? "Edit Business Details" : "Register New Business"}
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-zinc-400 text-sm mb-1">Business Name *</label>
                  <input
                    className="h-12 w-full rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 px-3"
                    value={ws.bizDraft.businessName}
                    onChange={(e) => ws.setBizDraft((d) => ({ ...d, businessName: e.target.value }))}
                  />
                </div>

                <ResidentPicker
                    label="Owner *"
                    value={ws.bizDraft.owner}
                    onChange={(val) => ws.setBizDraft(d => ({ ...d, owner: val }))}
                    allowManual={true}
                />

                <div>
                  <label className="block text-zinc-400 text-sm mb-1">Business Address *</label>
                  <input
                    className="h-12 w-full rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 px-3"
                    value={ws.bizDraft.addressText}
                    onChange={(e) => ws.setBizDraft((d) => ({ ...d, addressText: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="block text-zinc-400 text-sm mb-1">Category</label>
                  <input
                    className="h-12 w-full rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 px-3"
                    value={ws.bizDraft.category}
                    onChange={(e) => ws.setBizDraft((d) => ({ ...d, category: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 text-sm mb-1">Contact</label>
                  <input
                    className="h-12 w-full rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 px-3"
                    value={ws.bizDraft.contact}
                    onChange={(e) => ws.setBizDraft((d) => ({ ...d, contact: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 text-sm mb-1">Notes</label>
                  <textarea
                    className="min-h-[90px] w-full rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 px-3 py-2"
                    value={ws.bizDraft.notes}
                    onChange={(e) => ws.setBizDraft((d) => ({ ...d, notes: e.target.value }))}
                  />
                </div>

                {ws.banner && ws.banner.kind === "error" && (
                  <div className="rounded-2xl border border-red-900/50 bg-red-950/30 p-3">
                    <div className="text-zinc-100 text-sm font-semibold">Please fix this</div>
                    <div className="text-zinc-300 text-sm mt-1">{ws.banner.msg}</div>
                  </div>
                )}

                <Button
                  className="h-12 w-full font-semibold"
                  disabled={ws.busy || !ws.canSaveBusiness}
                  onClick={() => ws.saveBusiness(enqueue)}
                >
                  {ws.busy ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
                  {ws.busy ? "Saving…" : "Save Business"}
                </Button>

                {ws.bizDraft.id && (
                  <Button
                    variant="secondary"
                    className="h-12 w-full"
                    onClick={() => ws.startRenew(ws.bizDraft.id!)}
                  >
                    Renew Permit
                  </Button>
                )}

                <div className="text-xs text-zinc-400 text-center">
                  Changes are saved locally and synced when online.
                </div>
              </div>
            </div>
          </>
        )}

        {/* RENEW FORM */}
        {ws.mode === "renewForm" && (
          <>
            <Button
              variant="outline"
              className="mb-3 h-12"
              onClick={ws.backToList}
            >
              ← Back to List
            </Button>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
              <div className="text-zinc-100 text-sm font-semibold">Renew Permit</div>
              <p className="text-sm text-muted-foreground mt-1">
                For business: <span className="font-bold">{ws.bizDraft.businessName}</span>
              </p>


              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-zinc-400 text-sm mb-1">Year *</label>
                  <input
                    type="number"
                    className="h-12 w-full rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 px-3"
                    value={ws.renewDraft.year}
                    onChange={(e) => ws.setRenewDraft((d) => ({ ...d, year: Number(e.target.value) }))}
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 text-sm mb-1">Fee Amount (₱) *</label>
                  <input
                    type="number"
                    className="h-12 w-full rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 px-3"
                    value={ws.renewDraft.feeAmount}
                    onChange={(e) => ws.setRenewDraft((d) => ({ ...d, feeAmount: Number(e.target.value) }))}
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 text-sm mb-1">O.R. No. (optional)</label>
                  <input
                    className="h-12 w-full rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 px-3"
                    value={ws.renewDraft.orNo}
                    onChange={(e) => ws.setRenewDraft((d) => ({ ...d, orNo: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 text-sm mb-1">Remarks (optional)</label>
                  <input
                    className="h-12 w-full rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 px-3"
                    value={ws.renewDraft.remarks}
                    onChange={(e) => ws.setRenewDraft((d) => ({ ...d, remarks: e.target.value }))}
                  />
                </div>

                <Button
                  className="h-12 w-full font-semibold"
                  disabled={ws.busy || !ws.canRenew}
                  onClick={() => ws.renewAndPrint(enqueue)}
                >
                  {ws.busy ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
                  {ws.busy ? "Renewing…" : "Renew & Print"}
                </Button>

                <div className="text-xs text-zinc-400 text-center">
                  Renewal is saved locally, queued for sync, and printed.
                </div>
              </div>
            </div>
          </>
        )}
      </div>
  );
}

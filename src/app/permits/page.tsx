"use client";

import React, { useMemo, useState } from "react";
import TerminalShell from "@/components/shell/TerminalShell";
import { useSyncQueue } from "@/hooks/bos/useSyncQueue";
import { useBusinessPermitsWorkstation } from "@/hooks/businessPermits/useBusinessPermitsWorkstation";
import { PrintFrame } from "@/components/print/PrintFrame";
import { buildBusinessPermitHTML } from "@/lib/businessPermits/templates/permitA4";
import { db } from "@/lib/bosDb";

function money(n: number) {
  const x = Number(n || 0);
  return isFinite(x) ? x : 0;
}

function formatIssuedAt(date: Date) {
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export default function BusinessPermitsPage() {
  const { enqueue } = useSyncQueue();
  const ws = useBusinessPermitsWorkstation();

  const [printHTML, setPrintHTML] = useState<string | null>(null);

  const canSaveBusiness = useMemo(() => {
    const d = ws.businessDraft;
    return Boolean(d.businessName.trim() && d.ownerName.trim() && d.addressText.trim());
  }, [ws.businessDraft]);

  const canRenew = useMemo(() => {
    const r = ws.renewalDraft;
    return Boolean(ws.selectedId && r.year && money(r.feeAmount) >= 0);
  }, [ws.selectedId, ws.renewalDraft]);

  const handleRenewAndPrint = async () => {
    const res = await ws.renewQueueFirst(enqueue);
    if (!res.ok) return;

    const business = await db.businesses.get(res.businessId);
    if (!business) return;

    const now = new Date();
    const meta = {
      barangayName: "DAU",
      municipality: "Mabalacat City",
      province: "Pampanga",
      captainName: "Punong Barangay",
      secretaryName: "Barangay Secretary",
    };

    const html = buildBusinessPermitHTML({
      ...meta,
      businessName: business.businessName,
      ownerName: business.ownerName,
      addressText: business.addressText,
      category: business.category,
      year: res.issuance.year,
      feeAmount: res.issuance.feeAmount,
      orNo: res.issuance.orNo,
      issuedAtText: formatIssuedAt(now),
      controlNo: res.issuance.controlNo,
    });

    setPrintHTML(html);

    // audit print locally (best-effort)
    await db.audit_queue.add({
      eventType: "PERMIT_PRINTED",
      details: { issuanceId: res.issuance.id, controlNo: res.issuance.controlNo },
      occurredAtISO: new Date().toISOString(),
      synced: 0,
    });
  };

  return (
    <TerminalShell>
      <div className="mx-auto w-full max-w-6xl p-4 md:p-6">
        <div className="mb-4">
          <h1 className="text-zinc-100 text-xl font-semibold">Business Permits</h1>
          <p className="text-zinc-400 text-sm mt-1">Search businesses, renew permits, print, and sync later.</p>
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
                placeholder="Search business, owner, address…"
                value={ws.query}
                onChange={(e) => ws.setQuery(e.target.value)}
              />
              <button className="h-12 rounded-xl bg-zinc-800/50 text-zinc-100 px-4 font-semibold" onClick={ws.reload}>
                Refresh
              </button>
            </div>
            
            <div className="mt-4 space-y-2">
              {ws.items.length === 0 ? (
                <div className="text-zinc-400 text-sm">No businesses found.</div>
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
                        {b.businessName}
                      </div>
                      <div className={["text-xs font-semibold", b.status === "Active" ? "text-emerald-300" : "text-amber-300"].join(" ")}>
                        {b.status} • {b.latestYear}
                      </div>
                    </div>
                    <div className="mt-1 text-zinc-400 text-xs truncate">{b.ownerName}</div>
                    <div className="mt-1 text-zinc-500 text-xs truncate">ID: {b.id}</div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* RIGHT: Workstation */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
            <div className="text-zinc-100 text-sm font-semibold">
              {ws.selectedId ? "Edit Business / Renew Permit" : "Register New Business"}
            </div>

             <button className="mt-3 w-full h-12 rounded-xl bg-zinc-800 text-zinc-100 px-4 font-semibold" onClick={ws.startNew}>
                + New Business
              </button>
              
            {/* Business Details */}
            <div className="mt-4 space-y-3 border-b border-zinc-800 pb-4">
                <h3 className="text-zinc-300 text-xs uppercase font-bold">Business Details</h3>
                 <div>
                    <label className="block text-zinc-400 text-xs mb-1">Business Name</label>
                    <input
                        className="h-12 w-full rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 px-3"
                        value={ws.businessDraft.businessName}
                        onChange={(e) => ws.setBusinessDraft((d) => ({ ...d, businessName: e.target.value }))}
                    />
                </div>
                 <div>
                    <label className="block text-zinc-400 text-xs mb-1">Owner Name</label>
                    <input
                        className="h-12 w-full rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 px-3"
                        value={ws.businessDraft.ownerName}
                        onChange={(e) => ws.setBusinessDraft((d) => ({ ...d, ownerName: e.target.value }))}
                    />
                </div>
                 <div>
                    <label className="block text-zinc-400 text-xs mb-1">Address</label>
                    <input
                        className="h-12 w-full rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 px-3"
                        value={ws.businessDraft.addressText}
                        onChange={(e) => ws.setBusinessDraft((d) => ({ ...d, addressText: e.target.value }))}
                    />
                </div>
                <button
                    className={[
                        "h-12 w-full rounded-xl font-semibold",
                        ws.loading || !canSaveBusiness ? "bg-zinc-800 text-zinc-400 cursor-not-allowed" : "bg-zinc-100 text-zinc-950",
                    ].join(" ")}
                    disabled={ws.loading || !canSaveBusiness}
                    onClick={() => ws.saveLocalAndQueue(enqueue)}
                    >
                    {ws.loading ? "Saving…" : (ws.selectedId ? "Save Changes" : "Save New Business")}
                </button>
            </div>
            
            {/* Renewal Section */}
             <div className={`mt-4 space-y-3 ${!ws.selectedId ? 'opacity-50 pointer-events-none' : ''}`}>
                <h3 className="text-zinc-300 text-xs uppercase font-bold">Renew & Print Permit</h3>
                <div className="grid grid-cols-2 gap-3">
                     <div>
                        <label className="block text-zinc-400 text-xs mb-1">Year</label>
                        <input
                            type="number"
                            className="h-12 w-full rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 px-3"
                            value={ws.renewalDraft.year}
                             onChange={(e) => ws.setRenewalDraft((d) => ({ ...d, year: Number(e.target.value) }))}
                        />
                    </div>
                     <div>
                        <label className="block text-zinc-400 text-xs mb-1">Fee</label>
                        <input
                            type="number"
                            className="h-12 w-full rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 px-3"
                            value={ws.renewalDraft.feeAmount}
                            onChange={(e) => ws.setRenewalDraft((d) => ({ ...d, feeAmount: Number(e.target.value) }))}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-zinc-400 text-xs mb-1">OR No. (optional)</label>
                    <input
                        className="h-12 w-full rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 px-3"
                        value={ws.renewalDraft.orNo ?? ''}
                        onChange={(e) => ws.setRenewalDraft((d) => ({ ...d, orNo: e.target.value }))}
                    />
                </div>
                 <button
                    className={[
                        "h-12 w-full rounded-xl font-semibold",
                        ws.loading || !canRenew ? "bg-zinc-800 text-zinc-400 cursor-not-allowed" : "bg-blue-600 text-white",
                    ].join(" ")}
                    disabled={ws.loading || !canRenew}
                    onClick={handleRenewAndPrint}
                    >
                    {ws.loading ? "Renewing…" : "Renew & Print Permit"}
                </button>
             </div>
          </div>
        </div>
      </div>
      {printHTML && (
          <PrintFrame
            html={printHTML}
            onAfterPrint={() => setPrintHTML(null)}
            onError={(e) => {
              console.error(e);
              setBanner({ kind: 'error', msg: `Print failed: ${e.message}` });
            }}
          />
        )}
    </TerminalShell>
  );
}

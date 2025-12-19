"use client";

import React, { useMemo, useState } from "react";
import TerminalShell from "@/components/shell/TerminalShell";
import { useSyncQueue } from "@/hooks/bos/useSyncQueue";
import { useBusinessPermitsWorkstation } from "@/hooks/businessPermits/useBusinessPermitsWorkstation";
import PrintFrame from "@/components/print/PrintFrame";
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
      <div className="mx-auto w-full max-w-4xl p-4 md:p-6">
        <div className="mb-4">
          <h1 className="text-zinc-100 text-xl font-semibold">Business Permits</h1>
          <p className="text-zinc-400 text-sm mt-1">Register new businesses, or search to renew permits.</p>
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

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
            <input
                className="h-12 w-full rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 px-3"
                placeholder="Search business, owner, address…"
                value={ws.query}
                onChange={(e) => ws.setQuery(e.target.value)}
            />
            <button className="mt-3 h-12 w-full rounded-xl bg-zinc-100 text-zinc-950 font-semibold" onClick={ws.startNew}>
                + New Business
            </button>
        </div>

        <div className="mt-4 space-y-2">
            {ws.items.length === 0 ? (
                <div className="text-zinc-400 text-sm text-center py-8">No businesses found.</div>
            ) : (
                ws.items.map((b) => (
                <button
                    key={b.id}
                    onClick={() => ws.loadExisting(b.id)}
                    className={[
                      "w-full text-left rounded-2xl border p-4",
                      ws.selectedId === b.id
                        ? "border-zinc-100 bg-zinc-950"
                        : "border-zinc-800 bg-zinc-900/40 hover:bg-zinc-950",
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
                </button>
                ))
            )}
        </div>

      {printHTML && (
          <PrintFrame
            html={printHTML}
            onAfterPrint={() => setPrintHTML(null)}
            onError={(e) => {
              console.error(e);
            }}
          />
        )}
    </div>
    </TerminalShell>
  );
}

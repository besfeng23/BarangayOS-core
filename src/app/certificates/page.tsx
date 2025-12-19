"use client";

import React, { useMemo, useState } from "react";
import TerminalShell from "@/components/shell/TerminalShell";
import PrintFrame from "@/components/print/PrintFrame";
import { useSyncQueue } from "@/hooks/bos/useSyncQueue";
import { useResidents } from "@/hooks/useResidents";
import { useIssueCertificate, CertType } from "@/hooks/certificates/useIssueCertificate";

export default function CertificatesPage() {
  const { enqueue } = useSyncQueue();
  const residents = useResidents();
  const issue = useIssueCertificate();

  const [residentQuery, setResidentQuery] = useState("");
  const [selectedResidentId, setSelectedResidentId] = useState<string | null>(null);
  const [selectedResidentName, setSelectedResidentName] = useState<string>("");
  const [certType, setCertType] = useState<CertType>("Barangay Clearance");
  const [purpose, setPurpose] = useState("");

  // lightweight resident search: re-use residents hook query
  // keep it simple: typing in this box writes to residents query too
  const filtered = useMemo(() => residents.items.slice(0, 6), [residents.items]);

  const canIssue = Boolean(selectedResidentId && purpose.trim() && !issue.busy);

  const handleSelect = (id: string, name: string) => {
    setSelectedResidentId(id);
    setSelectedResidentName(name);
  };

  const onIssue = async () => {
    await issue.issueAndPreparePrint({
      residentId: selectedResidentId ?? "",
      residentName: selectedResidentName ?? "",
      certType,
      purpose,
      enqueue,
    });
  };

  return (
    <TerminalShell>
      <div className="mx-auto w-full max-w-3xl p-4 md:p-6">
        <div className="mb-4">
          <h1 className="text-zinc-100 text-xl font-semibold">Certificates</h1>
          <p className="text-zinc-400 text-sm mt-1">Issue, print, and queue for sync (offline-safe).</p>
        </div>

        {issue.banner && (
          <div className={[
            "mb-4 rounded-2xl border p-4",
            issue.banner.kind === "error"
              ? "border-red-900/50 bg-red-950/30"
              : "border-emerald-900/40 bg-emerald-950/20",
          ].join(" ")}>
            <div className="text-zinc-100 text-sm font-semibold">
              {issue.banner.kind === "error" ? "Fix this" : "Status"}
            </div>
            <div className="text-zinc-300 text-sm mt-1">{issue.banner.msg}</div>
          </div>
        )}

        {/* Workstation card (Residents baseline) */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
          {/* Step 1: Select resident */}
          <div className="text-zinc-100 text-sm font-semibold">1) Select Resident</div>
          <input
            className="mt-2 h-12 w-full rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 px-3"
            placeholder="Search resident by name…"
            value={residentQuery}
            onChange={(e) => {
              const v = e.target.value;
              setResidentQuery(v);
              residents.setQuery(v);
            }}
          />

          <div className="mt-3 space-y-2">
            {selectedResidentId ? (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
                <div className="text-zinc-100 text-sm font-semibold">{selectedResidentName}</div>
                <div className="text-zinc-400 text-xs mt-1">ID: {selectedResidentId}</div>
                <button
                  className="mt-3 h-12 w-full rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 font-semibold"
                  onClick={() => {
                    setSelectedResidentId(null);
                    setSelectedResidentName("");
                  }}
                >
                  Change Resident
                </button>
              </div>
            ) : (
              <>
                {filtered.length === 0 ? (
                  <div className="text-zinc-400 text-sm">No residents found.</div>
                ) : (
                  filtered.map((r) => (
                    <button
                      key={r.id}
                      className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 text-left hover:bg-zinc-900/60"
                      onClick={() => handleSelect(r.id, r.fullName)}
                    >
                      <div className="text-zinc-100 text-sm font-semibold">{r.fullName}</div>
                      <div className="text-zinc-400 text-xs mt-1">
                        {r.householdNo ? `Household: ${r.householdNo}` : "Household: —"} • ID: {r.id}
                      </div>
                    </button>
                  ))
                )}
              </>
            )}
          </div>

          {/* Step 2: Details */}
          <div className="mt-6 text-zinc-100 text-sm font-semibold">2) Certificate Details</div>

          <label className="block text-zinc-400 text-xs mt-2 mb-1">Certificate Type</label>
          <select
            className="h-12 w-full rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 px-3"
            value={certType}
            onChange={(e) => setCertType(e.target.value as any)}
          >
            <option>Barangay Clearance</option>
            <option>Certificate of Residency</option>
            <option>Indigency</option>
            <option>Business Clearance</option>
          </select>

          <label className="block text-zinc-400 text-xs mt-3 mb-1">Purpose *</label>
          <input
            className="h-12 w-full rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 px-3"
            placeholder="e.g., Employment"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
          />

          {/* Primary action */}
          <button
            className={[
              "mt-4 h-12 w-full rounded-xl font-semibold",
              canIssue ? "bg-zinc-100 text-zinc-950" : "bg-zinc-800 text-zinc-400 cursor-not-allowed",
            ].join(" ")}
            disabled={!canIssue}
            onClick={onIssue}
          >
            {issue.busy ? "Issuing…" : "Issue & Print"}
          </button>

          <div className="mt-3 text-xs text-zinc-400">
            Works offline: saved locally first, queued for sync automatically.
          </div>
        </div>

        {/* Hidden print frame */}
        <PrintFrame
          html={issue.printingHTML}
          onAfterPrint={issue.afterPrint}
          onError={(e) => {
            console.error("Print error:", e);
          }}
        />
      </div>
    </TerminalShell>
  );
}


"use client";

import React, { useMemo, useState } from "react";
import PrintFrame from "@/components/print/PrintFrame";
import { useSyncQueue } from "@/hooks/bos/useSyncQueue";
import { useResidents } from "@/hooks/useResidents";
import { useIssueCertificate, CertType } from "@/hooks/certificates/useIssueCertificate";
import AIAssistButton from "@/components/ai/AIAssistButton";
import AIDrawer from "@/components/ai/AIDrawer";
import { Loader2 } from "lucide-react";

export default function CertificatesPage() {
  const { enqueue } = useSyncQueue();
  const residents = useResidents();
  const issue = useIssueCertificate();

  const [residentQuery, setResidentQuery] = useState("");
  const [selectedResidentId, setSelectedResidentId] = useState<string | null>(null);
  const [selectedResidentName, setSelectedResidentName] = useState<string>("");
  const [certType, setCertType] = useState<CertType>("Barangay Clearance");
  const [purpose, setPurpose] = useState("");

  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);

  // lightweight resident search: re-use residents hook query
  // keep it simple: typing in this box writes to residents query too
  const filtered = useMemo(() => residents.items.slice(0, 6), [residents.items]);

  const canIssue = Boolean(selectedResidentId && purpose.trim() && !issue.busy);

  const handleSelect = (id: string, name: string) => {
    setSelectedResidentId(id);
    setSelectedResidentName(name);
    setResidentQuery(name);
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

  const handleAiDraft = (newText: string) => {
    setPurpose(newText);
  };

  return (
    <>
      <div className="mx-auto w-full max-w-3xl p-4 md:p-6">
        <div className="mb-4">
          <h1 className="text-white text-xl font-semibold">Issue Certificate</h1>
          <p className="text-slate-200 text-sm mt-1">Issue, print, and sync certificates (offline-safe).</p>
        </div>

        {issue.banner && (
          <div className={[
            "mb-4 rounded-2xl border p-4",
            issue.banner.kind === "error"
              ? "border-red-900/50 bg-red-950/30"
              : "border-emerald-900/40 bg-emerald-950/20",
          ].join(" ")}>
            <div className="text-white text-sm font-semibold">
              {issue.banner.kind === "error" ? "Error" : "Status"}
            </div>
            <div className="text-slate-200 text-sm mt-1">{issue.banner.msg}</div>
          </div>
        )}

        {/* Workstation card (Residents baseline) */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
          {/* Step 1: Select resident */}
          <div className="text-white text-sm font-semibold">1. Select a Resident</div>
          <input
            className="mt-2 h-12 w-full rounded-xl bg-zinc-950 border border-zinc-800 text-white px-3"
            placeholder="Search for a resident by name…"
            value={residentQuery}
            onChange={(e) => {
              const v = e.target.value;
              setResidentQuery(v);
              residents.setQuery(v);
            }}
          />
          {!selectedResidentId && !purpose && (
             <p className="text-sm text-yellow-400 mt-2">Select a resident to continue.</p>
          )}

          <div className="mt-3 space-y-2">
            {selectedResidentId ? (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
                <div className="text-white text-sm font-semibold">{selectedResidentName}</div>
                <div className="text-slate-200 text-xs mt-1">ID: {selectedResidentId}</div>
                <button
                  className="mt-3 h-12 w-full rounded-xl bg-zinc-950 border border-zinc-800 text-white font-semibold"
                  onClick={() => {
                    setSelectedResidentId(null);
                    setSelectedResidentName("");
                    setResidentQuery("");
                    residents.setQuery("");
                  }}
                >
                  Change Resident
                </button>
              </div>
            ) : (
              <>
                {residents.loading ? (
                    <div className="text-slate-400 text-sm p-4 text-center">Searching...</div>
                ) : filtered.length === 0 && residentQuery ? (
                  <div className="text-slate-400 text-sm p-4 text-center">No residents found.</div>
                ) : (
                  filtered.map((r) => (
                    <button
                      key={r.id}
                      className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 text-left hover:bg-zinc-900/60 h-auto"
                      onClick={() => handleSelect(r.id, r.fullName)}
                    >
                      <div className="text-white text-sm font-semibold">{r.fullName}</div>
                      <div className="text-slate-200 text-xs mt-1">
                        {r.householdNo ? `Household: ${r.householdNo}` : "No household"} • ID: {r.id}
                      </div>
                    </button>
                  ))
                )}
              </>
            )}
          </div>

          {/* Step 2: Details */}
          <div className="mt-6 text-white text-sm font-semibold">2. Certificate Details</div>
          {!purpose.trim() && (
             <p className="text-sm text-yellow-400 mt-2">Enter a purpose to continue.</p>
          )}

          <label className="block text-slate-200 text-xs mt-2 mb-1">Certificate Type</label>
          <select
            className="h-12 w-full rounded-xl bg-zinc-950 border border-zinc-800 text-white px-3"
            value={certType}
            onChange={(e) => setCertType(e.target.value as any)}
          >
            <option>Barangay Clearance</option>
            <option>Certificate of Residency</option>
            <option>Indigency</option>
          </select>

          <div className="flex justify-between items-center mt-3 mb-1">
            <label className="block text-slate-200 text-xs">Purpose *</label>
            <AIAssistButton onClick={() => setIsAiDrawerOpen(true)} disabled={!purpose.trim()} />
          </div>
          <input
            className="h-12 w-full rounded-xl bg-zinc-950 border border-zinc-800 text-white px-3"
            placeholder="e.g., For Local Employment"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
          />

          {/* Primary action */}
          <button
            className={[
              "mt-4 h-12 w-full rounded-xl font-semibold flex items-center justify-center",
              canIssue ? "bg-zinc-100 text-zinc-950" : "bg-zinc-800 text-slate-400 cursor-not-allowed",
            ].join(" ")}
            disabled={!canIssue}
            onClick={onIssue}
          >
            {issue.busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {issue.busy ? "Issuing…" : "Issue & Print"}
          </button>

          <div className="mt-3 text-xs text-slate-400 text-center">
            All records are saved locally first, then synced to the cloud.
          </div>
        </div>
      </div>

      <AIDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        originalText={purpose}
        onDraft={handleAiDraft}
      />
    </>
  );
}

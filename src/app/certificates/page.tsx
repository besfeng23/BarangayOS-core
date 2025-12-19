"use client";

import React, { useEffect, useMemo, useState } from "react";
import TerminalShell from "@/components/shell/TerminalShell";
import { PrintFrame } from "@/components/print/PrintFrame";
import { useSyncQueue } from "@/hooks/bos/useSyncQueue";
import { loadDraft, saveDraft, clearDraft } from "@/lib/bos/localDraft";
import { buildGenericCertificateHTML } from "@/lib/certificates/templates/generic";
import {
  useCertificateIssue,
  CertificateDraft,
} from "@/hooks/certificates/useCertificateIssue";
import { useResidents } from "@/hooks/useResidents";
import { ResidentLocal } from "@/lib/bosDb";

const DRAFT_KEY = "draft:certificates:v2";

function formatIssuedAt(date: Date) {
  const months = [
    "January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December",
  ];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export default function CertificatesPage() {
  const { enqueue } = useSyncQueue();
  const residentSearch = useResidents();
  const [selectedResident, setSelectedResident] = useState<ResidentLocal | null>(null);

  const [draft, setDraft] = useState<CertificateDraft>(() => {
    return (
      loadDraft<CertificateDraft>(DRAFT_KEY) ?? {
        residentId: "",
        issuedToName: "",
        certificateType: "Barangay Clearance",
        purpose: "",
        customBody: "",
      }
    );
  });

  const [printHTML, setPrintHTML] = useState<string | null>(null);

  const { issue, loading, lastError, lastStatus } = useCertificateIssue({
    draftKey: DRAFT_KEY,
    enqueue,
  });

  useEffect(() => {
    if (selectedResident) {
      setDraft(d => ({
        ...d,
        residentId: selectedResident.id,
        issuedToName: selectedResident.fullName
      }));
    }
  }, [selectedResident, setDraft]);


  useEffect(() => {
    saveDraft(DRAFT_KEY, draft);
  }, [draft]);

  const canPrint = useMemo(() => {
    return Boolean(draft.issuedToName.trim() && draft.purpose.trim() && draft.certificateType);
  }, [draft]);

  const handleIssueAndPrint = async () => {
    const now = new Date();
    const issuedAtText = formatIssuedAt(now);

    const printableMeta = {
      barangayName: "DAU",
      municipality: "Mabalacat City",
      province: "Pampanga",
      captainName: "Punong Barangay",
      secretaryName: "Barangay Secretary",
    };

    const result = await issue(draft, printableMeta);
    if (!result.ok) return;

    const title = draft.certificateType;
    const controlNo = result.controlNo;

    const body =
      draft.certificateType === "Generic"
        ? draft.customBody ?? ""
        : "This certificate is issued upon request of the above-named individual, subject to barangay records and applicable rules.";

    const html = buildGenericCertificateHTML({
      ...printableMeta,
      title,
      body,
      issuedToName: draft.issuedToName,
      purpose: draft.purpose,
      issuedAtText,
      controlNo,
    });

    setPrintHTML(html);
  };
  
  const clearSelection = () => {
      setSelectedResident(null);
      setDraft(d => ({
        ...d,
        residentId: "",
        issuedToName: ""
      }));
  }

  return (
    <TerminalShell>
      <div className="mx-auto w-full max-w-4xl p-4 md:p-6">
        <div className="mb-4">
          <h1 className="text-zinc-100 text-xl font-semibold">Certificates</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Issue, print, and queue for sync (offline-safe).
          </p>
        </div>

        {(lastError || lastStatus) && (
          <div
            className={[
              "mb-4 rounded-2xl border p-4",
              lastError ? "border-red-900/50 bg-red-950/30" : "border-emerald-900/40 bg-emerald-950/20",
            ].join(" ")}
          >
            <div className="text-zinc-100 text-sm font-medium">
              {lastError ? "Action required" : "Status"}
            </div>
            <div className="text-zinc-300 text-sm mt-1">{lastError ?? lastStatus}</div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            
            {/* Resident Picker */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-4">
                <div>
                    <div className="text-zinc-100 text-sm font-semibold mb-1">1. Select Resident</div>
                    <input
                        className="h-12 w-full rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 px-3"
                        placeholder="Search resident by name..."
                        value={residentSearch.query}
                        onChange={(e) => residentSearch.setQuery(e.target.value)}
                        disabled={!!selectedResident}
                    />
                </div>
                
                {selectedResident ? (
                    <div className="bg-zinc-950 border border-zinc-700 rounded-xl p-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-bold text-zinc-100">{selectedResident.fullName}</p>
                                <p className="text-sm text-zinc-400">ID: {selectedResident.id}</p>
                            </div>
                            <button onClick={clearSelection} className="text-sm text-blue-400 hover:underline">Change</button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {residentSearch.items.map(res => (
                             <button
                                key={res.id}
                                onClick={() => setSelectedResident(res)}
                                className="w-full rounded-xl border border-zinc-800 bg-zinc-950/40 p-3 text-left hover:bg-zinc-900/60"
                            >
                                <div className="text-zinc-100 text-sm font-semibold">{res.fullName}</div>
                                <div className="text-zinc-400 text-xs mt-1">{res.addressText || 'No address'}</div>
                            </button>
                        ))}
                         {residentSearch.items.length === 0 && residentSearch.query && <p className="text-sm text-zinc-500 text-center py-4">No residents found.</p>}
                    </div>
                )}
            </div>

            {/* Certificate Form */}
            <div className={`rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-4 transition-opacity ${!selectedResident ? 'opacity-50 pointer-events-none' : ''}`}>
                 <div>
                    <div className="text-zinc-100 text-sm font-semibold mb-1">2. Certificate Details</div>
                    <p className="text-xs text-zinc-500">Fill this out after selecting a resident.</p>
                 </div>
                <div>
                  <label className="block text-zinc-400 text-xs mb-1">Certificate Type</label>
                  <select
                    className="h-12 w-full rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 px-3"
                    value={draft.certificateType}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, certificateType: e.target.value as CertificateDraft["certificateType"] }))
                    }
                  >
                    <option>Barangay Clearance</option>
                    <option>Certificate of Indigency</option>
                    <option>Barangay Residency</option>
                    <option>Generic</option>
                  </select>
                </div>
                 <div>
                  <label className="block text-zinc-400 text-xs mb-1">Purpose</label>
                  <input
                    className="h-12 w-full rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 px-3"
                    value={draft.purpose}
                    onChange={(e) => setDraft((d) => ({ ...d, purpose: e.target.value }))}
                    placeholder="e.g., Employment, Scholarship"
                  />
                </div>

                {draft.certificateType === "Generic" && (
                     <div>
                        <label className="block text-zinc-400 text-xs mb-1">Custom Body</label>
                        <textarea
                        className="h-full min-h-[120px] w-full rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 p-3"
                        value={draft.customBody ?? ""}
                        onChange={(e) => setDraft((d) => ({ ...d, customBody: e.target.value }))}
                        placeholder="Write the custom certificate text here..."
                        />
                    </div>
                )}
                
                <div className="pt-4">
                     <button
                      className={[
                        "h-12 w-full rounded-xl font-semibold",
                        canPrint && !loading
                          ? "bg-zinc-100 text-zinc-950"
                          : "bg-zinc-800 text-zinc-400 cursor-not-allowed",
                      ].join(" ")}
                      disabled={!canPrint || loading}
                      onClick={handleIssueAndPrint}
                    >
                      {loading ? "Queuing…" : "Issue & Print"}
                    </button>
                </div>
            </div>
        </div>
        
        {printHTML && (
          <PrintFrame
            html={printHTML}
            onAfterPrint={() => setPrintHTML(null)}
            onError={(e) => {
              console.error(e);
              alert("Print failed: " + e.message);
            }}
          />
        )}
      </div>
    </TerminalShell>
  );
}

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { PrintFrame } from "@/components/print/PrintFrame";
import { useSyncQueue } from "@/hooks/bos/useSyncQueue";
import { loadDraft, saveDraft } from "@/lib/bos/localDraft";
import { buildGenericCertificateHTML } from "@/lib/certificates/templates/generic";
import { useCertificateIssue, CertificateDraft } from "@/hooks/certificates/useCertificateIssue";

const DRAFT_KEY = "draft:certificates:new";

function formatIssuedAt(date: Date) {
  // simple readable format; no locale surprises
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export default function CertificatesPage() {
  const { enqueue } = useSyncQueue();

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

  // Draft autosave every keystroke
  useEffect(() => {
    saveDraft(DRAFT_KEY, draft);
  }, [draft]);

  const canPrint = useMemo(() => {
    return Boolean(draft.issuedToName.trim() && draft.purpose.trim() && draft.certificateType);
  }, [draft]);

  const handleIssueAndPrint = async () => {
    // Build printable HTML first (ensures print does not depend on Firestore)
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
        ? (draft.customBody ?? "")
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

  return (
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

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div className="text-zinc-100 text-sm font-semibold mb-3">Certificate Details</div>

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
                  <label className="block text-zinc-400 text-xs mb-1">Issued To (Name)</label>
                  <input
                    className="h-12 w-full rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 px-3"
                    value={draft.issuedToName}
                    onChange={(e) => setDraft((d) => ({ ...d, issuedToName: e.target.value }))}
                    placeholder="Juan Dela Cruz"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 text-xs mb-1">Purpose</label>
                  <input
                    className="h-12 w-full rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 px-3"
                    value={draft.purpose}
                    onChange={(e) => setDraft((d) => ({ ...d, purpose: e.target.value }))}
                    placeholder="Employment / Scholarship / etc."
                  />
                </div>
              </div>

              {draft.certificateType === "Generic" ? (
                <div className="space-y-3">
                    <div className="text-zinc-100 text-sm font-semibold mb-3 opacity-0">.</div>
                    <div>
                        <label className="block text-zinc-400 text-xs mb-1">Custom Body</label>
                        <textarea
                        className="h-full min-h-[188px] w-full rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 p-3"
                        value={draft.customBody ?? ""}
                        onChange={(e) => setDraft((d) => ({ ...d, customBody: e.target.value }))}
                        placeholder="Write the certificate text..."
                        />
                    </div>
                </div>
              ) : <div />}
            </div>

            <div className="mt-4 border-t border-zinc-800 pt-4">
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
        
        {printHTML && (
          <PrintFrame
            html={printHTML}
            onAfterPrint={() => setPrintHTML(null)}
            onError={(e) => {
              console.error(e);
              // keep html so user can retry by clicking again
              alert("Print failed: " + e.message);
            }}
          />
        )}
      </div>
  );
}

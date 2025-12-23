"use client";

import React from "react";
import { useIssueCertificate } from "@/hooks/certificates/useIssueCertificate";
import { Loader2 } from "lucide-react";
import { ResidentPicker } from "@/components/shared/ResidentPicker";
import { useSyncQueue } from "@/hooks/bos/useSyncQueue";
import {
  LolaBanner,
  LolaCard,
  LolaHeader,
  LolaInput,
  LolaPage,
  LolaPrimaryButton,
  LolaSection,
  LolaSelect,
} from "@/components/lola";


export default function CertificatesPage() {
  const { enqueue } = useSyncQueue();
  const {
    draft,
    setDraft,
    issueAndPreparePrint,
    busy: isIssuing,
    banner,
    canIssue,
  } = useIssueCertificate(enqueue);

  const onIssue = async () => {
    await issueAndPreparePrint();
  };

  return (
    <LolaPage>
      <LolaHeader
        title="Issue Certificate"
        subtitle="Large controls and single actions to avoid mistakes."
      />

      <div className="space-y-4">
        {banner && (
          <LolaBanner
            variant={banner.kind === "error" ? "error" : "success"}
            title={banner.kind === "error" ? "Error" : "Status"}
            message={banner.msg}
          />
        )}

        <LolaCard className="space-y-5">
          <LolaSection title="1. Select a resident" subtitle="Search by name; tap a row to lock it in.">
            <ResidentPicker
              label="Resident"
              value={draft.resident}
              onChange={(val) => setDraft(d => ({...d, resident: val}))}
              allowManual={false}
              errorMessage="A valid resident must be selected."
            />
            {!draft.resident?.residentId && (
              <p className="text-sm text-amber-700">Select a resident to continue.</p>
            )}
          </LolaSection>

          <LolaSection title="2. Certificate details">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-base font-semibold text-slate-800">Certificate Type</label>
                <LolaSelect onChange={(e) => setDraft(d => ({...d, certType: e.target.value as any}))} value={draft.certType}>
                  <option value="">Select type...</option>
                  <option value="Barangay Clearance">Barangay Clearance</option>
                  <option value="Certificate of Residency">Certificate of Residency</option>
                  <option value="Indigency">Certificate of Indigency</option>
                </LolaSelect>
                <p className="text-sm text-slate-600">Choose the document to personalize the printout.</p>
              </div>

              <div className="space-y-2">
                <label className="block text-base font-semibold text-slate-800">Purpose *</label>
                <LolaInput
                  placeholder="e.g., For Local Employment"
                  value={draft.purpose}
                  onChange={(e) => setDraft(d => ({...d, purpose: e.target.value}))}
                />
                <p className="text-sm text-slate-600">State the purpose so it prints correctly.</p>
                {!draft.purpose.trim() && (
                  <p className="text-sm font-semibold text-amber-700">Enter a purpose to continue.</p>
                )}
              </div>
            </div>
          </LolaSection>

          <LolaPrimaryButton
            className="mt-2"
            disabled={!canIssue}
            onClick={onIssue}
          >
            {isIssuing ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Issuing…
              </span>
            ) : (
              "Issue & Print"
            )}
          </LolaPrimaryButton>

          <div className="text-center text-sm text-slate-600">
            All records are saved locally first, then synced to the cloud.
          </div>
        </LolaCard>
      </div>
    </LolaPage>
  );
}

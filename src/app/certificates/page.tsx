
"use client";

import React, { useState } from "react";
import { useIssueCertificate } from "@/hooks/certificates/useIssueCertificate";
import { Loader2 } from "lucide-react";
import { ResidentPicker } from "@/components/shared/ResidentPicker";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSyncQueue } from "@/hooks/bos/useSyncQueue";


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

  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);

  const onIssue = async () => {
    await issueAndPreparePrint();
  };
  
  const handleAiDraft = (newText: string) => {
    setDraft(d => ({...d, purpose: newText}));
  };

  return (
    <>
      <div className="mx-auto w-full max-w-3xl p-4 md:p-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold">Issue Certificate</h1>
          <p className="text-muted-foreground text-sm mt-1">Issue, print, and sync certificates (offline-safe).</p>
        </div>

        {banner && (
          <div className={[
            "mb-4 rounded-xl border p-4",
            banner.kind === "error"
              ? "border-destructive/50 bg-destructive/10 text-destructive-foreground"
              : "border-emerald-500/50 bg-emerald-500/10 text-emerald-700",
          ].join(" ")}>
            <div className="font-semibold">
              {banner.kind === "error" ? "Error" : "Status"}
            </div>
            <div className="text-sm mt-1">{banner.msg}</div>
          </div>
        )}

        <div className="rounded-xl border bg-card p-4 space-y-4">
          
          <ResidentPicker 
            label="1. Select a Resident"
            value={draft.resident}
            onChange={(val) => setDraft(d => ({...d, resident: val}))}
            allowManual={false}
            errorMessage="A valid resident must be selected."
          />
          {!draft.resident?.residentId && (
             <p className="text-sm text-yellow-600 -mt-2 ml-1">Select a resident to continue.</p>
          )}

          <div>
            <h2 className="text-sm font-semibold">2. Certificate Details</h2>
            <div className="space-y-4 mt-2">
               <label className="block text-xs mt-2 mb-1">Certificate Type</label>
                <Select onValueChange={(e) => setDraft(d => ({...d, certType: e as any}))} value={draft.certType}>
                    <SelectTrigger className="h-12 text-lg bg-background">
                        <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Barangay Clearance">Barangay Clearance</SelectItem>
                        <SelectItem value="Certificate of Residency">Certificate of Residency</SelectItem>
                        <SelectItem value="Indigency">Certificate of Indigency</SelectItem>
                    </SelectContent>
                </Select>

              <div>
                <div className="flex justify-between items-center mt-3 mb-1">
                  <label className="block text-xs">Purpose *</label>
                </div>
                <Input
                  placeholder="e.g., For Local Employment"
                  value={draft.purpose}
                  onChange={(e) => setDraft(d => ({...d, purpose: e.target.value}))}
                   className="h-12 text-lg bg-background"
                />
                 {!draft.purpose.trim() && (
                    <p className="text-sm text-yellow-600 mt-2">Enter a purpose to continue.</p>
                 )}
              </div>
            </div>
          </div>
          

          <button
            className={[
              "mt-4 h-14 w-full rounded-xl font-bold flex items-center justify-center text-lg",
              canIssue ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground cursor-not-allowed",
            ].join(" ")}
            disabled={!canIssue}
            onClick={onIssue}
          >
            {isIssuing && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            {isIssuing ? "Issuing…" : "Issue & Print"}
          </button>

          <div className="mt-3 text-xs text-muted-foreground text-center">
            All records are saved locally first, then synced to the cloud.
          </div>
        </div>
      </div>
    </>
  );
}

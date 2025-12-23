"use client";

import React from "react";
import { useSyncQueue } from "@/hooks/bos/useSyncQueue";
import { useBlotterWorkstation } from "@/hooks/blotter/useBlotterWorkstation";
import { ResidentPicker } from "@/components/shared/ResidentPicker";
import { SmartDateInput } from "@/components/ui/SmartDateInput";
import { Loader2 } from "lucide-react";
import {
  LolaBanner,
  LolaCard,
  LolaEmptyState,
  LolaHeader,
  LolaInput,
  LolaPage,
  LolaPrimaryButton,
  LolaRowLink,
  LolaSecondaryButton,
  LolaSection,
  LolaSkeleton,
  LolaTextarea,
} from "@/components/lola";

export default function BlotterPage() {
  const { enqueue } = useSyncQueue();
  const ws = useBlotterWorkstation();

  const onPrint = async () => {
    try {
      await ws.buildAndPrint();
    } catch (e: any) {
      ws.setBanner({ kind: "error", msg: e?.message ?? String(e) });
    }
  };

  return (
    <LolaPage>
      <LolaHeader
        title="Blotter Records"
        subtitle="Large inputs and single actions to log incidents clearly."
        action={
          ws.mode === "list" ? (
            <LolaPrimaryButton className="w-full sm:w-auto" onClick={ws.newBlotter}>
              + File New Blotter
            </LolaPrimaryButton>
          ) : undefined
        }
      />

      {ws.banner && (
        <LolaBanner
          variant={ws.banner.kind === "error" ? "error" : "success"}
          title={ws.banner.kind === "error" ? "Error" : "Saved"}
          message={ws.banner.msg}
        />
      )}

      {ws.mode === "list" && (
        <div className="space-y-4">
          <LolaCard className="space-y-3">
            <LolaInput
              placeholder="Search name, location, or keyword…"
              value={ws.query}
              onChange={(e) => ws.setQuery(e.target.value)}
            />
            <p className="text-sm text-slate-600">Filter incidents. Results update instantly.</p>
            <LolaPrimaryButton onClick={ws.newBlotter}>+ File New Blotter</LolaPrimaryButton>
            <div className="text-sm text-slate-600">
              {ws.loading ? "Loading…" : `${ws.items.length} record(s)`}
            </div>
          </LolaCard>

          {ws.loading ? (
            <LolaCard className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <LolaSkeleton key={i} className="h-20 w-full" />
              ))}
            </LolaCard>
          ) : ws.items.length === 0 ? (
            <LolaEmptyState
              title="No blotter records yet"
              message="Tap “File New Blotter” to start your first case log."
              action={<LolaPrimaryButton onClick={ws.newBlotter}>Start a record</LolaPrimaryButton>}
            />
          ) : (
            <div className="space-y-3">
              {ws.items.map((b) => (
                <LolaRowLink
                  key={b.id}
                  title={`${b.complainantName} vs ${b.respondentName}`}
                  description={`${new Date(b.incidentDateISO).toLocaleDateString()} • ${b.locationText}`}
                  meta={b.status}
                  onClick={() => ws.editBlotter(b.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {ws.mode === "form" && (
        <div className="space-y-4">
          <LolaSecondaryButton fullWidth={false} onClick={ws.backToList}>
            ← Back to list
          </LolaSecondaryButton>

          <LolaCard className="space-y-6">
            <div className="text-xl font-semibold text-slate-900">
              {ws.draft.id ? "Edit Blotter Record" : "New Blotter Record"}
            </div>

            <LolaSection title="Incident details">
              <SmartDateInput
                labelText="Date of Incident *"
                helperText="Use quick buttons for today or yesterday."
                value={ws.draft.incidentDateISO}
                onChange={(v) => ws.setDraft((d) => ({ ...d, incidentDateISO: v }))}
              />

              <div className="space-y-2">
                <label className="block text-base font-semibold text-slate-800">Location of Incident *</label>
                <LolaInput
                  value={ws.draft.locationText}
                  onChange={(e) => ws.setDraft((d) => ({ ...d, locationText: e.target.value }))}
                  placeholder="Barangay hall, Purok 2"
                />
                <p className="text-sm text-slate-600">Where did it happen? Be specific for records.</p>
                {!ws.draft.locationText.trim() && ws.banner && <p className="text-sm font-semibold text-red-600">{ws.banner.msg}</p>}
              </div>
            </LolaSection>
            
            <LolaSection title="Parties involved">
              <ResidentPicker
                label="Complainant *"
                value={ws.draft.complainant}
                onChange={(val) => ws.setDraft(d => ({ ...d, complainant: val }))}
                allowManual={false}
                errorMessage="A valid resident must be selected as complainant."
              />
              
              <ResidentPicker
                label="Respondent *"
                value={ws.draft.respondent}
                onChange={(val) => ws.setDraft(d => ({ ...d, respondent: val }))}
                allowManual={false}
                errorMessage="A valid resident must be selected as respondent."
              />
            </LolaSection>

            <LolaSection title="Narrative">
              <div className="space-y-2">
                <label className="block text-base font-semibold text-slate-800">Narrative *</label>
                <LolaTextarea
                  value={ws.draft.narrative}
                  onChange={(e) => ws.setDraft((d) => ({ ...d, narrative: e.target.value }))}
                  placeholder="Summarize the incident in simple sentences."
                />
                <p className="text-sm text-slate-600">Keep it short and factual.</p>
                {!ws.draft.narrative.trim() && ws.banner && <p className="text-sm font-semibold text-red-600">{ws.banner.msg}</p>}
              </div>
            </LolaSection>

            {ws.banner && ws.banner.kind === "error" && (
              <LolaBanner variant="error" title="Please fix this" message={ws.banner.msg} />
            )}

            <div className="space-y-3">
              <LolaPrimaryButton
                disabled={ws.busy || !ws.canSave}
                onClick={() => ws.save(enqueue)}
              >
                {ws.busy ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Saving…
                  </span>
                ) : (
                  "Save Case"
                )}
              </LolaPrimaryButton>

              <LolaSecondaryButton
                disabled={ws.busy || !ws.draft.id}
                onClick={() => ws.resolve(enqueue)}
              >
                Mark as "Resolved"
              </LolaSecondaryButton>

              <LolaSecondaryButton
                disabled={!ws.draft.id}
                onClick={onPrint}
              >
                Print Record
              </LolaSecondaryButton>

              <p className="text-center text-sm text-slate-600">
                All changes are saved locally first, then synced to the cloud when online.
              </p>
            </div>
          </LolaCard>
        </div>
      )}
    </LolaPage>
  );
}

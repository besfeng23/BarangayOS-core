"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useLocation } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useBlotterData } from "@/hooks/useBlotterData";
import { Party } from "@/lib/bosDb";
import { PartyPicker } from "@/features/blotter/components/PartyPicker";

const baseInput =
  "w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-slate-100 " +
  "focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-950";

function Field({ label, children }: any) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-slate-500 uppercase font-medium ml-1">{label}</label>
      {children}
    </div>
  );
}

export default function BlotterCreatePage() {
  const router = useRouter();
  const location = useLocation() as any;
  const { toast } = useToast();
  const { createBlotter, blotterNewDraft, upsertDraft, clearDraft } = useBlotterData();

  const [form, setForm] = useState({
    incidentDateISO: "",
    hearingDateISO: "",
    narrative: "",
    tags: ["Noise"] as string[],
    complainants: [] as Party[],
    respondents: [] as Party[],
  });

  const [saving, setSaving] = useState(false);

  // Prefill from Resident Profile -> Blotter Create
  useEffect(() => {
    const prefill = location?.state?.prefill;
    if (!prefill) return;

    setForm((p) => ({
      ...p,
      ...prefill,
    }));

    // Clear router state (kiosk-safe, prevents re-prefill on refresh)
    router.replace("/blotter/new", { state: {} } as any);
  }, [location, router]);

  // Restore draft
  useEffect(() => {
    if (blotterNewDraft?.payload) {
      setForm((p: any) => ({ ...p, ...blotterNewDraft.payload }));
      toast({ title: "Draft restored" });
    }
  }, [blotterNewDraft, toast]);

  // Debounced autosave
  useEffect(() => {
    const t = setTimeout(() => {
      const hasAny =
        (form.complainants?.length || 0) > 0 ||
        (form.respondents?.length || 0) > 0 ||
        !!form.narrative ||
        !!form.incidentDateISO;
      if (hasAny) upsertDraft("blotter:new", form);
    }, 500);
    return () => clearTimeout(t);
  }, [form, upsertDraft]);

  async function submit() {
    if (!form.incidentDateISO || !form.narrative) return;
    if (!form.complainants?.length || !form.respondents?.length) return;

    setSaving(true);
    try {
      const rec = await createBlotter({
        incidentDateISO: form.incidentDateISO,
        hearingDateISO: form.hearingDateISO || "",
        complainants: form.complainants,
        respondents: form.respondents,
        narrative: form.narrative,
        tags: form.tags,
        status: "ACTIVE",
      });

      await clearDraft("blotter:new");
      router.push(`/blotter/${rec.id}?toast=${encodeURIComponent("Case saved offline — queued for sync")}`);
    } finally {
      setSaving(false);
    }
  }

  return (
      <div className="min-h-screen bg-slate-950 text-slate-100 pb-24">
        <div className="max-w-2xl mx-auto px-4 pt-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-slate-100">New Blotter Case</h1>
                <p className="text-slate-400">Search Resident OR Type Name • Offline Ready</p>
              </div>
              <button
                onClick={() => router.back()}
                className="px-4 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-slate-300
                  focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-950"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 gap-5 mt-6">
              <PartyPicker
                label="Who is complaining? *"
                parties={form.complainants}
                onChange={(next) => setForm((p) => ({ ...p, complainants: next }))}
              />

              <PartyPicker
                label="Against whom? *"
                parties={form.respondents}
                onChange={(next) => setForm((p) => ({ ...p, respondents: next }))}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Incident Date *">
                  <input
                    type="date"
                    className={baseInput}
                    value={form.incidentDateISO}
                    onChange={(e) => setForm((p) => ({ ...p, incidentDateISO: e.target.value }))}
                  />
                </Field>
                <Field label="Hearing Date (optional)">
                  <input
                    type="date"
                    className={baseInput}
                    value={form.hearingDateISO}
                    onChange={(e) => setForm((p) => ({ ...p, hearingDateISO: e.target.value }))}
                  />
                </Field>
              </div>

              <Field label="What happened? *">
                <textarea
                  className={baseInput}
                  rows={6}
                  value={form.narrative}
                  onChange={(e) => setForm((p) => ({ ...p, narrative: e.target.value }))}
                />
              </Field>

              <Field label="Tag (quick)">
                <select
                  className={baseInput}
                  value={form.tags[0]}
                  onChange={(e) => setForm((p) => ({ ...p, tags: [e.target.value] }))}
                >
                  <option>Noise</option>
                  <option>Debt</option>
                  <option>Theft</option>
                  <option>Physical Injury</option>
                  <option>Property</option>
                </select>
              </Field>
            </div>

            <button
              disabled={saving}
              onClick={submit}
              className="w-full mt-6 py-4 rounded-2xl bg-slate-100 text-slate-950 font-bold text-lg disabled:opacity-60
                focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-950"
            >
              {saving ? "Saving..." : "Save Case"}
            </button>
          </div>
        </div>
      </div>
  );
}

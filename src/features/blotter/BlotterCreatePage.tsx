import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useLocation } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useBlotterData } from "@/hooks/useBlotterData";
import { Party } from "@/lib/bosDb";
import { PartyPicker } from "@/features/blotter/components/PartyPicker";

const baseInput =
  "w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-2xl text-zinc-100 " +
  "focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 ring-offset-zinc-950";

function Field({ label, children }: any) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-zinc-500 uppercase font-medium ml-1">{label}</label>
      {children}
    </div>
  );
}

export default function BlotterCreatePage() {
  const router = useRouter();
  const location = useLocation() as any;
  const { toast } = useToast();
  const { createBlotter, blotterNewDraft, upsertDraft, clearDraft } = useBlotterData();

  const [form, setForm] = useState<any>({
    barangayId: "default", // TODO: pull from Settings later
    incidentDate: Date.now(),
    hearingDate: undefined,
    complainants: [],
    respondents: [],
    narrative: "",
    tags: ["Other"],
    status: "ACTIVE",
  });

  const [saving, setSaving] = useState(false);

  // Prefill from Resident Profile
  useEffect(() => {
    const prefill = location?.state?.prefill;
    if (!prefill) return;

    setForm((p: any) => ({ ...p, ...prefill }));
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
        (form.narrative || "").trim().length > 0;
      if (hasAny) upsertDraft("blotter:new", form);
    }, 500);
    return () => clearTimeout(t);
  }, [form, upsertDraft]);

  const canSave = useMemo(() => {
    return (
      (form.complainants?.length || 0) > 0 &&
      (form.respondents?.length || 0) > 0 &&
      (form.narrative || "").trim().length >= 10
    );
  }, [form]);

  async function submit() {
    if (!canSave) return;
    setSaving(true);
    try {
      const rec = await createBlotter(form);
      await clearDraft("blotter:new");
      router.push(`/blotter/${rec.id}?toast=${encodeURIComponent("Blotter saved offline — queued for sync")}`);
    } finally {
      setSaving(false);
    }
  }

  return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-24">
        <div className="max-w-3xl mx-auto px-4 pt-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-zinc-100">New Blotter Case</h1>
                <p className="text-zinc-400">Offline Ready • Hybrid Parties</p>
              </div>
              <button
                onClick={() => router.back()}
                className="px-4 py-2 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-300
                  focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 ring-offset-zinc-950"
              >
                Cancel
              </button>
            </div>

            <PartyPicker
              label="Who is complaining? *"
              parties={form.complainants}
              onChange={(next) => setForm((p: any) => ({ ...p, complainants: next }))}
            />

            <PartyPicker
              label="Against whom? *"
              parties={form.respondents}
              onChange={(next) => setForm((p: any) => ({ ...p, respondents: next }))}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Incident Date *">
                <input
                  type="datetime-local"
                  className={baseInput}
                  value={new Date(form.incidentDate).toISOString().slice(0, 16)}
                  onChange={(e) => setForm((p: any) => ({ ...p, incidentDate: new Date(e.target.value).getTime() }))}
                />
              </Field>

              <Field label="Hearing Date (optional)">
                <input
                  type="datetime-local"
                  className={baseInput}
                  value={form.hearingDate ? new Date(form.hearingDate).toISOString().slice(0, 16) : ""}
                  onChange={(e) =>
                    setForm((p: any) => ({
                      ...p,
                      hearingDate: e.target.value ? new Date(e.target.value).getTime() : undefined,
                    }))
                  }
                />
              </Field>
            </div>

            <Field label="What happened? * (min 10 chars)">
              <textarea
                className={baseInput + " min-h-[140px]"}
                value={form.narrative}
                onChange={(e) => setForm((p: any) => ({ ...p, narrative: e.target.value }))}
                placeholder="Type the narrative..."
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Status *">
                <select
                  className={baseInput}
                  value={form.status}
                  onChange={(e) => setForm((p: any) => ({ ...p, status: e.target.value }))}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="SETTLED">SETTLED</option>
                  <option value="FILED_TO_COURT">FILED_TO_COURT</option>
                  <option value="DISMISSED">DISMISSED</option>
                </select>
              </Field>

              <Field label="Tag *">
                <select
                  className={baseInput}
                  value={form.tags?.[0] || "Other"}
                  onChange={(e) => setForm((p: any) => ({ ...p, tags: [e.target.value] }))}
                >
                  <option>Debt</option>
                  <option>Noise</option>
                  <option>Theft</option>
                  <option>Physical Injury</option>
                  <option>Other</option>
                </select>
              </Field>
            </div>

            <button
              disabled={saving || !canSave}
              onClick={submit}
              className="w-full mt-2 py-4 rounded-2xl bg-zinc-100 text-zinc-950 font-bold text-lg disabled:opacity-60
                focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 ring-offset-zinc-950"
            >
              {saving ? "Saving..." : "Save Case"}
            </button>
          </div>
        </div>

      </div>
  );
}

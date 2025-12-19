"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { useBlotterData } from "@/hooks/useBlotterData";
import { Party } from "@/lib/bosDb";
import { norm } from "@/lib/uuid";
import { useResidentQuickSearch } from "@/hooks/useResidentQuickSearch";

const TAGS = ["Debt", "Noise", "Theft", "Physical Injury", "Trespassing", "Harassment", "Threats", "Property Damage"];

const baseInput =
  "w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-2xl text-zinc-100 " +
  "focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950";

function Field({ label, hint, children }: any) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-zinc-500 uppercase font-medium ml-1">{label}</label>
      {hint && <div className="text-xs text-zinc-600 ml-1">{hint}</div>}
      {children}
    </div>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-full border text-sm whitespace-nowrap min-h-[44px]
        ${active ? "bg-zinc-800 border-zinc-700 text-zinc-100" : "bg-zinc-950 border-zinc-800 text-zinc-300"}
        focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950`}
      aria-label={`Tag ${label}`}
      type="button"
    >
      {label}
    </button>
  );
}

function PartyPicker({
  label,
  party,
  setParty,
}: {
  label: string;
  party: Party[];
  setParty: React.Dispatch<React.SetStateAction<Party[]>>;
}) {
  const [q, setQ] = useState("");
  const results = useResidentQuickSearch(q, 8);

  function addTyped() {
    const name = q.trim();
    if (!name) return;
    setParty((p) => [...p, { name, nameNorm: norm(name) }]);
    setQ("");
  }

  function addResident(residentId: string, name: string) {
    setParty((p) => [...p, { residentId, name, nameNorm: norm(name) }]);
    setQ("");
  }

  function removeAt(idx: number) {
    setParty((p) => p.filter((_, i) => i !== idx));
  }

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-3">
      <div className="text-zinc-100 font-semibold">{label}</div>

      {/* selected parties */}
      {party.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {party.map((p, idx) => (
            <button
              key={`${p.residentId || "raw"}-${idx}`}
              type="button"
              onClick={() => removeAt(idx)}
              className="px-3 py-2 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm
                focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
              aria-label={`Remove ${p.name}`}
              title="Tap to remove"
            >
              {p.name}{p.residentId ? " • (Resident)" : ""}
            </button>
          ))}
        </div>
      )}

      {/* search input */}
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          className={baseInput}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search resident or type name..."
          aria-label={`${label} search`}
        />
        <button
          type="button"
          onClick={addTyped}
          className="px-4 py-3 rounded-2xl bg-zinc-800 border border-zinc-700 text-zinc-100 font-semibold min-h-[48px]
            focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
          aria-label="Add typed name"
        >
          Add Name
        </button>
      </div>

      {/* results */}
      {q.trim() && results.length > 0 && (
        <div className="space-y-2">
          {results.map((r) => {
            const display = `${r.lastName.toUpperCase()}, ${r.firstName}`;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => addResident(r.id, display)}
                className="w-full text-left p-3 rounded-2xl bg-zinc-900 border border-zinc-800 min-h-[48px]
                  focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
                aria-label={`Select resident ${display}`}
              >
                <div className="text-zinc-100 font-semibold">{display}</div>
                <div className="text-zinc-400 text-sm truncate">{r.purok} • {r.addressLine1}</div>
              </button>
            );
          })}
        </div>
      )}

      {q.trim() && results.length === 0 && (
        <div className="text-zinc-500 text-sm">No matching resident found. Use <span className="text-zinc-300 font-semibold">Add Name</span> for outsiders.</div>
      )}
    </div>
  );
}

export default function BlotterCreatePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { createBlotter } = useBlotterData();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [complainants, setComplainants] = useState<Party[]>([]);
  const [respondents, setRespondents] = useState<Party[]>([]);
  const [incidentDate, setIncidentDate] = useState<string>(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });

  const [tags, setTags] = useState<string[]>([]);
  const [narrative, setNarrative] = useState("");
  const [saving, setSaving] = useState(false);

  const canNext1 = useMemo(() => complainants.length > 0 && respondents.length > 0, [complainants, respondents]);
  const canNext2 = useMemo(() => !!incidentDate && tags.length >= 0, [incidentDate, tags]);
  const canSave = useMemo(() => narrative.trim().length >= 15, [narrative]);

  function toggleTag(t: string) {
    setTags((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]));
  }

  async function saveCase() {
    if (!canSave) return;
    setSaving(true);

    try {
      const rec = await createBlotter({
        barangayId: "TEST-BARANGAY-1", // Replace with real ID from settings/auth
        incidentDate: new Date(incidentDate).getTime(),
        complainants,
        respondents,
        narrative,
        tags,
        status: "ACTIVE", // Default status for new cases
      });

      toast({ title: "Case saved offline — queued for sync" });
      router.push(`/blotter/${rec.id}`);
    } finally {
      setSaving(false);
    }
  }

  return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-24">
        <div className="max-w-3xl mx-auto px-4 pt-6 space-y-4">
          {/* Header */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-zinc-100">New Blotter Case</h1>
                <p className="text-zinc-400">Offline Ready • Wizard Flow</p>
              </div>
              <button
                onClick={() => router.back()}
                className="px-4 py-2 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-300 min-h-[48px]
                  focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
                aria-label="Cancel"
                type="button"
              >
                Cancel
              </button>
            </div>

            {/* Stepper */}
            <div className="mt-4 flex items-center gap-2 text-sm text-zinc-400">
              <div className={`px-3 py-2 rounded-full border ${step === 1 ? "bg-zinc-800 border-zinc-700 text-zinc-100" : "bg-zinc-950 border-zinc-800"}`}>1 • Parties</div>
              <div className="text-zinc-600">→</div>
              <div className={`px-3 py-2 rounded-full border ${step === 2 ? "bg-zinc-800 border-zinc-700 text-zinc-100" : "bg-zinc-950 border-zinc-800"}`}>2 • Details</div>
              <div className="text-zinc-600">→</div>
              <div className={`px-3 py-2 rounded-full border ${step === 3 ? "bg-zinc-800 border-zinc-700 text-zinc-100" : "bg-zinc-950 border-zinc-800"}`}>3 • Narrative</div>
            </div>
          </div>

          {/* Step 1 */}
          {step === 1 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
              <div className="text-zinc-100 font-semibold">Step 1: Who is complaining? Against whom?</div>

              <PartyPicker label="Complainants" party={complainants} setParty={setComplainants} />
              <PartyPicker label="Respondents" party={respondents} setParty={setRespondents} />

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={!canNext1}
                  onClick={() => setStep(2)}
                  className="flex-1 py-4 rounded-2xl bg-zinc-100 text-zinc-950 font-bold text-lg disabled:opacity-60 min-h-[56px]
                    focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
                  aria-label="Next step"
                >
                  Next
                </button>
              </div>

              {!canNext1 && (
                <div className="text-zinc-500 text-sm">Add at least 1 complainant and 1 respondent.</div>
              )}
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
              <div className="text-zinc-100 font-semibold">Step 2: When and what type of case?</div>

              <Field label="Incident Date *">
                <input
                  type="date"
                  className={baseInput}
                  value={incidentDate}
                  onChange={(e) => setIncidentDate(e.target.value)}
                  aria-label="Incident date"
                />
              </Field>

              <Field label="Tags (optional)" hint="Tap to select. Helps searching later.">
                <div className="flex flex-wrap gap-2">
                  {TAGS.map((t) => (
                    <Chip key={t} label={t} active={tags.includes(t)} onClick={() => toggleTag(t)} />
                  ))}
                </div>
              </Field>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-100 min-h-[56px]
                    focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
                  aria-label="Back"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={!canNext2}
                  onClick={() => setStep(3)}
                  className="flex-1 py-4 rounded-2xl bg-zinc-100 text-zinc-950 font-bold text-lg disabled:opacity-60 min-h-[56px]
                    focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
                  aria-label="Next step"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
              <div className="text-zinc-100 font-semibold">Step 3: What happened?</div>

              <Field
                label="Narrative *"
                hint="Minimum ~15 chars. Write the story briefly but clearly."
              >
                <textarea
                  className={`${baseInput} min-h-[180px]`}
                  value={narrative}
                  onChange={(e) => setNarrative(e.target.value)}
                  placeholder="Describe what happened..."
                  aria-label="Narrative"
                />
              </Field>

              {!canSave && (
                <div className="text-zinc-500 text-sm">Add more detail to the narrative to enable saving.</div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-100 min-h-[56px]
                    focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
                  aria-label="Back"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={saving || !canSave}
                  onClick={saveCase}
                  className="flex-1 py-4 rounded-2xl bg-zinc-100 text-zinc-950 font-bold text-lg disabled:opacity-60 min-h-[56px]
                    focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
                  aria-label="Save case"
                >
                  {saving ? "Saving..." : "Save Case"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
  );
}

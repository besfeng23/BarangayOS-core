import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useBlotterData } from "@/hooks/useBlotterData";
import { Party } from "@/lib/bosDb";
import { PartyPickerSheet } from "@/features/blotter/components/PartyPickerSheet";
import { PartyChips } from "@/features/blotter/components/PartyChips";

const baseInput =
  "w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-slate-100 " +
  "min-h-[48px] focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-950";

function Field({ label, children }: any) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-slate-500 uppercase font-medium ml-1">{label}</label>
      {children}
    </div>
  );
}

function AddRow({
  value,
  setValue,
  onAddTyped,
  onAddLinked,
  label,
}: {
  value: string;
  setValue: (s: string) => void;
  onAddTyped: () => void;
  onAddLinked: () => void;
  label: string;
}) {
  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 space-y-3">
      <div className="text-slate-300 text-sm font-medium">{label}</div>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          className={baseInput}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Type full name (outsider allowed)"
        />

        <button
          onClick={onAddTyped}
          className="px-4 py-3 rounded-2xl bg-slate-800 border border-slate-700 text-slate-100 font-semibold min-h-[48px]
            focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-950"
        >
          Add Typed
        </button>

        <button
          onClick={onAddLinked}
          className="px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 min-h-[48px]
            focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-950"
        >
          Link Resident
        </button>
      </div>
    </div>
  );
}

export default function BlotterCreatePage() {
  const router = useRouter();
  const { createBlotter } = useBlotterData();

  const [incidentDate, setIncidentDate] = useState("");
  const [hearingDate, setHearingDate] = useState("");
  const [tags, setTags] = useState("Noise, Debt");
  const [narrative, setNarrative] = useState("");
  const [saving, setSaving] = useState(false);

  // Parties
  const [complainants, setComplainants] = useState<Party[]>([]);
  const [respondents, setRespondents] = useState<Party[]>([]);

  // Typed inputs
  const [cName, setCName] = useState("");
  const [rName, setRName] = useState("");

  // Sheet states
  const [pickSide, setPickSide] = useState<"complainant" | "respondent" | null>(null);

  const canSave = useMemo(() => {
    return complainants.length > 0 && respondents.length > 0 && !!incidentDate && !!narrative;
  }, [complainants, respondents, incidentDate, narrative]);

  function addTyped(side: "complainant" | "respondent") {
    const name = (side === "complainant" ? cName : rName).trim();
    if (!name) return;

    const item: Party = { name };
    if (side === "complainant") {
      setComplainants((p) => [...p, item]);
      setCName("");
    } else {
      setRespondents((p) => [...p, item]);
      setRName("");
    }
  }

  function onPickResident(side: "complainant" | "respondent", resident: any) {
    const item: Party = {
      residentId: resident.id,
      name: `${resident.lastName.toUpperCase()}, ${resident.firstName}`,
    };
    if (side === "complainant") setComplainants((p) => [...p, item]);
    else setRespondents((p) => [...p, item]);
    setPickSide(null);
  }

  async function save() {
    if (!canSave) return;
    setSaving(true);
    try {
      const rec = await createBlotter({
        incidentDate,
        hearingDate: hearingDate || "",
        complainants,
        respondents,
        narrative,
        status: "ACTIVE",
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      });

      router.push(`/blotter/${rec.id}?toast=${encodeURIComponent("Case saved offline — queued for sync")}`);
    } finally {
      setSaving(false);
    }
  }

  return (
      <div className="min-h-screen bg-slate-950 text-slate-100 pb-24">
        <div className="max-w-4xl mx-auto px-4 pt-6 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-slate-100">New Blotter Case</h1>
                <p className="text-slate-400">Hybrid Parties • Offline Ready</p>
              </div>
              <button
                onClick={() => router.back()}
                className="px-4 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-slate-300 min-h-[48px]
                  focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-950"
              >
                Cancel
              </button>
            </div>

            {/* Who */}
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-3">
                <AddRow
                  label="Who is complaining? *"
                  value={cName}
                  setValue={setCName}
                  onAddTyped={() => addTyped("complainant")}
                  onAddLinked={() => setPickSide("complainant")}
                />
                <PartyChips
                  items={complainants}
                  onRemove={(idx) => setComplainants((p) => p.filter((_, i) => i !== idx))}
                />
              </div>

              <div className="space-y-3">
                <AddRow
                  label="Against whom? *"
                  value={rName}
                  setValue={setRName}
                  onAddTyped={() => addTyped("respondent")}
                  onAddLinked={() => setPickSide("respondent")}
                />
                <PartyChips
                  items={respondents}
                  onRemove={(idx) => setRespondents((p) => p.filter((_, i) => i !== idx))}
                />
              </div>
            </div>

            {/* Dates + tags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <Field label="Incident Date *">
                <input type="date" className={baseInput} value={incidentDate} onChange={(e) => setIncidentDate(e.target.value)} />
              </Field>
              <Field label="Hearing Date (optional)">
                <input type="date" className={baseInput} value={hearingDate} onChange={(e) => setHearingDate(e.target.value)} />
              </Field>

              <div className="sm:col-span-2">
                <Field label="Tags (comma separated)">
                  <input className={baseInput} value={tags} onChange={(e) => setTags(e.target.value)} />
                </Field>
              </div>

              <div className="sm:col-span-2">
                <Field label="Narrative / What Happened? *">
                  <textarea
                    className={baseInput + " min-h-[180px]"}
                    value={narrative}
                    onChange={(e) => setNarrative(e.target.value)}
                    placeholder="Write the incident narrative here..."
                  />
                </Field>
              </div>
            </div>

            <button
              disabled={!canSave || saving}
              onClick={save}
              className="w-full mt-6 py-4 rounded-2xl bg-slate-100 text-slate-950 font-bold text-lg disabled:opacity-60
                focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-950"
            >
              {saving ? "Saving..." : "Save Case"}
            </button>

            {!canSave && (
              <div className="mt-3 text-xs text-zinc-500">
                Required: at least 1 complainant, 1 respondent, incident date, and narrative.
              </div>
            )}
          </div>
        </div>

        {/* Resident picker sheet */}
        <PartyPickerSheet
          open={pickSide !== null}
          onClose={() => setPickSide(null)}
          onPick={(r) => onPickResident(pickSide as any, r)}
          title={pickSide === "complainant" ? "Link Complainant (Resident)" : "Link Respondent (Resident)"}
        />
      </div>
  );
}

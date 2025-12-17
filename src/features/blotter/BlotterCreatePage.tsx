import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useBlotterData } from "@/hooks/useBlotterData";
import { Party } from "@/lib/bosDb";

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

export default function BlotterCreatePage() {
  const router = useRouter();
  const { createBlotter } = useBlotterData();

  const [complainantName, setComplainantName] = useState("");
  const [respondentName, setRespondentName] = useState("");
  const [incidentDate, setIncidentDate] = useState("");
  const [hearingDate, setHearingDate] = useState("");
  const [tags, setTags] = useState("Noise, Debt");
  const [narrative, setNarrative] = useState("");
  const [saving, setSaving] = useState(false);

  const canSave = useMemo(() => {
    return !!(complainantName && respondentName && incidentDate && narrative);
  }, [complainantName, respondentName, incidentDate, narrative]);

  async function save() {
    if (!canSave) return;
    setSaving(true);
    try {
      const complainants: Party[] = [{ name: complainantName.trim() }];
      const respondents: Party[] = [{ name: respondentName.trim() }];

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
        <div className="max-w-3xl mx-auto px-4 pt-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-slate-100">New Blotter Case</h1>
                <p className="text-slate-400">Offline Ready • Minimal Required Fields</p>
              </div>
              <button
                onClick={() => router.back()}
                className="px-4 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-slate-300 min-h-[48px]
                  focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-950"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <Field label="Complainant Name *">
                <input className={baseInput} value={complainantName} onChange={(e) => setComplainantName(e.target.value)} />
              </Field>
              <Field label="Respondent Name *">
                <input className={baseInput} value={respondentName} onChange={(e) => setRespondentName(e.target.value)} />
              </Field>

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
                    className={baseInput + " min-h-[160px]"}
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
          </div>
        </div>
      </div>
  );
}

"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useResidentsData, calcAge } from "@/hooks/useResidentsData";
import { useToast } from "@/components/ui/toast";

export default function ResidentCreatePage() {
  const router = useRouter();
  const { createResident, checkDuplicateLocal, residentNewDraft, upsertDraft, clearDraft } = useResidentsData();
  const { toast } = useToast();

  const [form, setForm] = useState({
    lastName: "",
    firstName: "",
    middleName: "",
    suffix: "",
    sex: "Male",
    birthdate: "",
    civilStatus: "Single",
    purok: "",
    addressLine1: "",
  });

  const [dup, setDup] = useState<{ id: string; name: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const age = useMemo(() => (form.birthdate ? calcAge(form.birthdate) : 0), [form.birthdate]);

  // Restore draft
  useEffect(() => {
    if (residentNewDraft?.payload) {
      setForm((p) => ({ ...p, ...residentNewDraft.payload }));
      toast({title: "Draft restored"});
    }
  }, [residentNewDraft, toast]);

  // Debounced autosave
  useEffect(() => {
    const t = setTimeout(() => {
      if (form.lastName || form.firstName) upsertDraft("resident:new", form);
    }, 500);
    return () => clearTimeout(t);
  }, [form, upsertDraft]);

  async function submit(force: boolean) {
    if (!form.lastName || !form.firstName || !form.birthdate || !form.purok || !form.addressLine1) return;

    setSaving(true);
    try {
      if (!force) {
        const match = await checkDuplicateLocal(form.lastName, form.firstName, form.birthdate);
        if (match) {
          setDup({ id: match.id, name: `${match.lastName.toUpperCase()}, ${match.firstName}` });
          setSaving(false);
          return;
        }
      }

      const rec = await createResident({ ...form, status: "ACTIVE" });
      await clearDraft("resident:new");
      router.push(`/residents/${rec.id}?toast=${encodeURIComponent("Resident saved offline — queued for sync")}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-24">
        <div className="max-w-2xl mx-auto px-4 pt-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-zinc-100">Register Resident</h1>
                <p className="text-zinc-400">New Record • Offline Ready</p>
              </div>
              <button
                onClick={() => router.back()}
                className="px-4 py-2 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-300
                  focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <Field label="Last Name *"><Input value={form.lastName} onChange={(v: string) => setForm((p) => ({ ...p, lastName: v }))} /></Field>
              <Field label="First Name *"><Input value={form.firstName} onChange={(v: string) => setForm((p) => ({ ...p, firstName: v }))} /></Field>
              <Field label="Middle Name"><Input value={form.middleName} onChange={(v: string) => setForm((p) => ({ ...p, middleName: v }))} /></Field>
              <Field label="Suffix"><Input value={form.suffix} onChange={(v: string) => setForm((p) => ({ ...p, suffix: v }))} /></Field>

              <Field label="Birthdate *"><Input type="date" value={form.birthdate} onChange={(v: string) => setForm((p) => ({ ...p, birthdate: v }))} /></Field>
              <Field label="Age (auto)"><div className="px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-2xl text-zinc-400">{form.birthdate ? age : "-"}</div></Field>

              <Field label="Sex *">
                <Select value={form.sex} onChange={(v: string) => setForm((p) => ({ ...p, sex: v }))}>
                  <option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                </Select>
              </Field>
              <Field label="Civil Status *">
                <Select value={form.civilStatus} onChange={(v: string) => setForm((p) => ({ ...p, civilStatus: v }))}>
                  <option value="Single">Single</option><option value="Married">Married</option><option value="Widowed">Widowed</option><option value="Separated">Separated</option><option value="Unknown">Unknown</option>
                </Select>
              </Field>

              <Field label="Purok *"><Input value={form.purok} onChange={(v: string) => setForm((p) => ({ ...p, purok: v }))} /></Field>
              <Field label="Address Line 1 *"><Input value={form.addressLine1} onChange={(v: string) => setForm((p) => ({ ...p, addressLine1: v }))} /></Field>
            </div>

            <button
              disabled={saving}
              onClick={() => submit(false)}
              className="w-full mt-6 py-4 rounded-2xl bg-zinc-100 text-zinc-950 font-bold text-lg disabled:opacity-60
                focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
            >
              {saving ? "Saving..." : "Save Resident Record"}
            </button>
          </div>
        </div>
      </div>

      

      {/* Duplicate Modal */}
      {dup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-zinc-100 mb-2">Possible Duplicate</h3>
            <p className="text-zinc-400 mb-6">
              A record for <span className="text-zinc-100 font-semibold">{dup.name}</span> already exists locally.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => router.push(`/residents/${dup.id}`)}
                className="w-full py-3 bg-zinc-800 text-zinc-100 font-semibold rounded-2xl border border-zinc-700
                  focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
              >
                View Existing Record
              </button>
              <button
                onClick={() => { setDup(null); submit(true); }}
                className="w-full py-3 bg-zinc-950 text-zinc-300 font-medium rounded-2xl border border-zinc-800
                  focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
              >
                Create Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const baseInput =
  "w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-2xl text-zinc-100 " +
  "focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950";

function Field({ label, children }: any) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-zinc-500 uppercase font-medium ml-1">{label}</label>
      {children}
    </div>
  );
}
function Input({ value, onChange, type = "text" }: any) {
  return <input type={type} className={baseInput} value={value} onChange={(e) => onChange(e.target.value)} />;
}
function Select({ value, onChange, children }: any) {
  return (
    <select className={baseInput} value={value} onChange={(e) => onChange(e.target.value)}>
      {children}
    </select>
  );
}

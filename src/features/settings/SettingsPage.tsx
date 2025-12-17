import React, { useEffect, useState } from "react";
import MainLayout from "@/components/shell/MainLayout";
import { useSettings } from "@/hooks/useSettings";

export default function SettingsPage() {
  const { settings, upsert } = useSettings();

  const [form, setForm] = useState({
    barangayName: "",
    barangayAddress: "",
    punongBarangay: "",
    secretaryName: "",
    isTrialAccount: true,
    daysRemaining: 5,
  });

  useEffect(() => {
    if (!settings) return;
    setForm({
      barangayName: settings.barangayName || "",
      barangayAddress: settings.barangayAddress || "",
      punongBarangay: settings.punongBarangay || "",
      secretaryName: settings.secretaryName || "",
      isTrialAccount: settings.trial?.isTrialAccount ?? true,
      daysRemaining: settings.trial?.daysRemaining ?? 5,
    });
  }, [settings]);

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h1 className="text-2xl font-bold text-zinc-100">Settings</h1>
          <p className="text-zinc-400 mt-1">Barangay information • Trial</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <Field label="Barangay Name">
              <Input value={form.barangayName} onChange={(v: string) => setForm((p) => ({ ...p, barangayName: v }))} />
            </Field>
            <Field label="Barangay Address">
              <Input value={form.barangayAddress} onChange={(v: string) => setForm((p) => ({ ...p, barangayAddress: v }))} />
            </Field>
            <Field label="Punong Barangay">
              <Input value={form.punongBarangay} onChange={(v: string) => setForm((p) => ({ ...p, punongBarangay: v }))} />
            </Field>
            <Field label="Secretary Name">
              <Input value={form.secretaryName} onChange={(v: string) => setForm((p) => ({ ...p, secretaryName: v }))} />
            </Field>

            <Field label="Trial Account">
              <select
                className={baseInput}
                value={String(form.isTrialAccount)}
                onChange={(e) => setForm((p) => ({ ...p, isTrialAccount: e.target.value === "true" }))}
              >
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </select>
            </Field>

            <Field label="Days Remaining">
              <Input
                type="number"
                value={String(form.daysRemaining)}
                onChange={(v: string) => setForm((p) => ({ ...p, daysRemaining: Number(v || 0) }))}
              />
            </Field>
          </div>

          <button
            onClick={async () => {
              await upsert({
                barangayName: form.barangayName,
                barangayAddress: form.barangayAddress,
                punongBarangay: form.punongBarangay,
                secretaryName: form.secretaryName,
                trial: { isTrialAccount: form.isTrialAccount, daysRemaining: form.daysRemaining },
              });
              alert("Saved");
            }}
            className="w-full mt-6 py-4 rounded-2xl bg-zinc-100 text-zinc-950 font-extrabold text-lg min-h-[48px]
              focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
          >
            Save Settings
          </button>
        </div>
      </div>
    </MainLayout>
  );
}

const baseInput =
  "w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-2xl text-zinc-100 min-h-[48px] " +
  "focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950";

function Field({ label, children }: any) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-zinc-500 uppercase font-semibold ml-1">{label}</label>
      {children}
    </div>
  );
}
function Input({ value, onChange, type = "text" }: any) {
  return <input type={type} className={baseInput} value={value} onChange={(e) => onChange(e.target.value)} />;
}


"use client";
import React, { useEffect, useState } from "react";
import { isReadOnly, useSettings } from "@/lib/bos/settings/useSettings";
import { useToast } from "@/components/ui/toast";
import Link from 'next/link';


export default function SettingsPage() { 
  const { settings, save, saving, loading } = useSettings();
  const { toast } = useToast();
  
  const [form, setForm] = useState(settings);

  useEffect(() => {
    if (!loading) {
      setForm(settings);
    }
  }, [settings, loading]);

  const readOnly = isReadOnly(settings);

  const handleSave = async () => {
    const trimmedForm = {
      ...form,
      barangayName: form.barangayName.trim(),
      barangayAddress: form.barangayAddress.trim(),
      punongBarangay: form.punongBarangay.trim(),
      secretaryName: form.secretaryName.trim(),
      trialDaysRemaining: Math.max(0, Math.min(365, form.trialDaysRemaining)),
      controlPrefix: (form.controlPrefix || "BRGY").trim().toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 12)
    };
    
    await save(trimmedForm);
    
    toast({ title: "Settings saved (offline-safe)" });
  };
  
  if(loading){
      return (
          <div className="max-w-2xl mx-auto px-4 pt-6 text-center text-zinc-400">Loading settings...</div>
      )
  }

  return (
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h1 className="text-2xl font-bold text-zinc-100">Settings</h1>
          <p className="text-zinc-400 mt-1">Barangay Profile & System Settings</p>

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

             <Field label="Control Prefix" hint="For document IDs">
              <Input value={form.controlPrefix} onChange={(v: string) => setForm((p) => ({ ...p, controlPrefix: v }))} />
            </Field>

             <Field label="System Mode">
              <select
                className={baseInput}
                value={String(form.readOnlyMode)}
                onChange={(e) => setForm((p) => ({ ...p, readOnlyMode: e.target.value === "true" }))}
              >
                <option value="false">Full Access</option>
                <option value="true">Read-Only</option>
              </select>
            </Field>

            <Field label="Trial Account">
              <select
                className={baseInput}
                value={String(form.trialEnabled)}
                onChange={(e) => setForm((p) => ({ ...p, trialEnabled: e.target.value === "true" }))}
              >
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </select>
            </Field>

            <Field label="Days Remaining">
              <Input
                type="number"
                value={String(form.trialDaysRemaining)}
                onChange={(v: string) => setForm((p) => ({ ...p, trialDaysRemaining: Number(v || 0) }))}
                disabled={!form.trialEnabled}
              />
            </Field>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || readOnly}
            className="w-full mt-6 py-4 rounded-2xl bg-zinc-100 text-zinc-950 font-extrabold text-lg min-h-[48px] disabled:opacity-50
              focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
           {readOnly && <p className="text-center text-amber-400 text-xs mt-2">Read-only mode. Changes cannot be saved.</p>}

           <div className="mt-6 text-center">
            <Link href="/status" className="text-sm text-zinc-400 hover:text-zinc-100 underline">
              View System Status
            </Link>
          </div>
        </div>
      </div>
  );
}

const baseInput =
  "w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-2xl text-zinc-100 min-h-[48px] disabled:opacity-50 disabled:bg-zinc-900/50 " +
  "focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950";

function Field({ label, children, hint }: any) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-zinc-500 uppercase font-semibold ml-1">{label}</label>
       {hint && <p className="text-xs text-zinc-600 ml-1">{hint}</p>}
      {children}
    </div>
  );
}
function Input({ value, onChange, type = "text", ...props }: any) {
  return <input type={type} className={baseInput} value={value} onChange={(e) => onChange(e.target.value)} {...props} />;
}


"use client";
import React, { useEffect, useState } from "react";
import { useAISettings } from "@/hooks/useAISettings";
import { useToast } from "@/components/ui/toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function AIProfileTab() {
  const { settings, save, saving, loading } = useAISettings();
  const { toast } = useToast();
  const [form, setForm] = useState(settings);

  useEffect(() => {
    if (!loading) {
      setForm(settings);
    }
  }, [settings, loading]);

  const handleSave = async () => {
    await save(form);
    toast({ title: "AI Settings saved (offline-safe)" });
  };
  
  if (loading) {
    return <div className="p-6 text-center text-zinc-400">Loading AI settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border border-zinc-800 p-4">
            <div className="space-y-0.5">
                <Label htmlFor="enableAI" className="text-base">Enable AI Features</Label>
                <p className="text-sm text-zinc-400">
                    Enable drafting assistants, NLQ search, and other AI helpers.
                </p>
            </div>
             <Switch
                id="enableAI"
                checked={form.enableAI}
                onCheckedChange={(checked) => setForm(p => ({ ...p, enableAI: checked }))}
            />
        </div>

        <div className={`space-y-4 transition-opacity ${!form.enableAI ? 'opacity-50 pointer-events-none' : ''}`}>
             <div className="flex items-center justify-between rounded-lg border border-zinc-800 p-4">
                <div className="space-y-0.5">
                    <Label htmlFor="allowPII" className="text-base">Allow Personal Info in Prompts</Label>
                     <p className="text-sm text-red-400">
                        Warning: Disabling redaction may send names and addresses to the AI provider.
                    </p>
                </div>
                <Switch
                    id="allowPII"
                    checked={form.allowPII}
                    onCheckedChange={(checked) => setForm(p => ({ ...p, allowPII: checked }))}
                />
            </div>
             <div className="flex items-center justify-between rounded-lg border border-zinc-800 p-4">
                <div className="space-y-0.5">
                    <Label htmlFor="demoMode" className="text-base">Enable AI Demo Panel</Label>
                    <p className="text-sm text-zinc-400">
                        Shows a "quick demo" panel on the dashboard for showcasing AI capabilities.
                    </p>
                </div>
                <Switch
                    id="demoMode"
                    checked={form.demoMode}
                    onCheckedChange={(checked) => setForm(p => ({ ...p, demoMode: checked }))}
                />
            </div>
        </div>
      </div>

       <button
        onClick={handleSave}
        disabled={saving}
        className="w-full mt-6 py-4 rounded-2xl bg-zinc-100 text-zinc-950 font-extrabold text-lg min-h-[48px] disabled:opacity-50
          focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
      >
        {saving ? "Saving AI Settings..." : "Save AI Settings"}
      </button>
    </div>
  );
}


"use client";
import React, { useEffect, useState } from "react";
import { useSettings } from "@/hooks/useSettings";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus } from "lucide-react";

export default function DeviceSettingsTab() {
  const { settings, save, saving, loading } = useSettings();
  const { toast } = useToast();
  const [deviceTypes, setDeviceTypes] = useState<string[]>([]);
  const [newType, setNewType] = useState("");

  useEffect(() => {
    if (!loading) {
      setDeviceTypes(settings.securityDeviceTypes || []);
    }
  }, [settings.securityDeviceTypes, loading]);

  const handleSave = async () => {
    const updatedSettings = { ...settings, securityDeviceTypes: deviceTypes };
    await save(updatedSettings as any);
    toast({ title: "Device Settings Saved" });
  };

  const handleAddType = () => {
    if (newType && !deviceTypes.includes(newType.toUpperCase() as any)) {
      setDeviceTypes([...deviceTypes, newType.toUpperCase().replace(/ /g, '_') as any]);
      setNewType("");
    }
  };

  const handleRemoveType = (typeToRemove: string) => {
    setDeviceTypes(deviceTypes.filter(type => type !== typeToRemove));
  };

  if (loading) {
    return <div className="p-6 text-center text-zinc-400">Loading device settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Manage Device Types</h3>
        <p className="text-sm text-zinc-400 mb-4">Add or remove device types available in the Security module.</p>
        <div className="space-y-2">
          {deviceTypes.map((type) => (
            <div key={type} className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-lg">
              <span className="font-mono text-sm">{type}</span>
              <Button variant="ghost" size="icon" onClick={() => handleRemoveType(type)}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-4">
          <Input 
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            placeholder="Add new type (e.g., DRONE)"
            className="h-12 text-lg bg-zinc-950 border-zinc-700"
          />
          <Button onClick={handleAddType} size="lg" className="h-12">
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full mt-6 py-4 rounded-2xl bg-zinc-100 text-zinc-950 font-extrabold text-lg min-h-[48px] disabled:opacity-50
          focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
      >
        {saving ? "Saving Device Settings..." : "Save Device Settings"}
      </button>
    </div>
  );
}

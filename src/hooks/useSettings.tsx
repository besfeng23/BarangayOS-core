
"use client";
import React, { createContext, useContext, ReactNode, useCallback, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/bosDb";
import { writeActivity } from "@/lib/bos/activity/writeActivity";

export type BarangaySettings = {
  barangayName: string;
  barangayAddress: string;
  punongBarangay: string;
  secretaryName: string;
  trialEnabled: boolean;
  trialDaysRemaining: number;
  controlPrefix: string;
  readOnlyMode: boolean;
  updatedAtISO: string;
};

const KEY = "barangaySettings";

const DEFAULTS: BarangaySettings = {
  barangayName: "Barangay Dau",
  barangayAddress: "Mabalacat, Pampanga",
  punongBarangay: "Hon. Juan Dela Cruz",
  secretaryName: "Maria Clara",
  trialEnabled: true,
  trialDaysRemaining: 5,
  controlPrefix: "BRGY",
  readOnlyMode: false,
  updatedAtISO: new Date().toISOString(),
};

function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

interface SettingsContextType {
  settings: BarangaySettings;
  loading: boolean;
  saving: boolean;
  save: (next: Partial<BarangaySettings>) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [saving, setSaving] = useState(false);

  const settingsData = useLiveQuery(() => db.settings.get(KEY), [], null);
  const settings = settingsData?.value as BarangaySettings ?? DEFAULTS;
  const loading = settingsData === null;

  const save = useCallback(async (updates: Partial<BarangaySettings>) => {
    setSaving(true);
    try {
      const currentSettings = (await db.settings.get(KEY))?.value || DEFAULTS;
      const payload: BarangaySettings = {
        ...currentSettings,
        ...updates,
        updatedAtISO: new Date().toISOString(),
      };

      await db.settings.put({ key: KEY, value: payload });

      await db.sync_queue.add({
        id: uuid() as any,
        jobType: "SETTINGS_UPSERT",
        payload,
        occurredAtISO: payload.updatedAtISO,
        synced: 0,
        status: "pending",
      } as any);

      await writeActivity({
        type: "SETTINGS_UPDATED",
        entityType: "system",
        entityId: "settings",
        status: "ok",
        title: "Settings updated",
        subtitle: `${payload.barangayName} • ${payload.barangayAddress}`,
      });
    } finally {
      setSaving(false);
    }
  }, []);
  
  const value = { settings, loading, saving, save };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};


export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export function isReadOnly(s: BarangaySettings) {
  if (s.readOnlyMode) return true;
  if (s.trialEnabled && s.trialDaysRemaining <= 0) return true;
  return false;
}

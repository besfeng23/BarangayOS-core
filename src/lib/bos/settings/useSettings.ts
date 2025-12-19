"use client";

import { useCallback, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/bosDb";
import { writeActivity } from "../activity/writeActivity";

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

export function useSettings() {
  const [saving, setSaving] = useState(false);

  const settingsData = useLiveQuery(
    () => (db as any).settings?.get(KEY),
    [],
    null
  );

  const settings = settingsData?.value as BarangaySettings ?? DEFAULTS;
  const loading = settingsData === null;

  const save = useCallback(async (next: Omit<BarangaySettings, "updatedAtISO">) => {
    setSaving(true);
    try {
      const payload: BarangaySettings = {
        ...next,
        updatedAtISO: new Date().toISOString()
      };
      
      await (db as any).settings.put({ key: KEY, value: payload });

      await (db as any).sync_queue.add({
        id: uuid(),
        jobType: "SETTINGS_UPSERT",
        payload,
        occurredAtISO: payload.updatedAtISO,
        synced: 0,
        status: "pending",
      });

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

  return { settings, loading, saving, save };
}

export function isReadOnly(s: BarangaySettings) {
  if (s.readOnlyMode) return true;
  if (s.trialEnabled && s.trialDaysRemaining <= 0) return true;
  return false;
}

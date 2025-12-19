"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { db } from "@/lib/bosDb";

export type BarangaySettings = {
  barangayName: string;
  barangayAddress: string;
  punongBarangay: string;
  secretaryName: string;
  trialEnabled: boolean;
  trialDaysRemaining: number;
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
  updatedAtISO: new Date().toISOString(),
};

export function useSettings() {
  const [settings, setSettings] = useState<BarangaySettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadLocal = useCallback(async () => {
    const row = await (db as any).settings?.get(KEY).catch(() => null);
    if (!row?.value) {
      await (db as any).settings?.put({ key: KEY, value: DEFAULTS }).catch(() => {});
      setSettings(DEFAULTS);
    } else {
      setSettings(row.value as BarangaySettings);
    }
  }, []);

  const save = useCallback(async (next: Omit<BarangaySettings, "updatedAtISO">) => {
    setSaving(true);
    try {
      const payload: BarangaySettings = { ...next, updatedAtISO: new Date().toISOString() };
      await (db as any).settings.put({ key: KEY, value: payload });

      // enqueue sync
      await (db as any).syncQueue.add({
        jobType: "SETTINGS_UPSERT",
        payload,
        occurredAtISO: payload.updatedAtISO,
        synced: 0,
        status: "pending",
      });

      setSettings(payload);
    } finally {
      setSaving(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadLocal();
      setLoading(false);
    })();
  }, [loadLocal]);

  return { settings, setSettings, loading, saving, save };
}

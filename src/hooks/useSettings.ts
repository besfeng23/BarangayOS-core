"use client";
import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, BOSSettings } from "@/lib/bosDb";
import { uuid } from "@/lib/uuid";

const SETTINGS_KEY = "barangay";

const defaults: BOSSettings["value"] = {
  barangayName: "Barangay Dau",
  barangayAddress: "Mabalacat, Pampanga",
  punongBarangay: "Hon. Juan Dela Cruz",
  secretaryName: "Maria Clara",
  trial: { isTrialAccount: true, daysRemaining: 5 },
};

export function useSettings() {
  const liveSettings = useLiveQuery(() => db.settings.get(SETTINGS_KEY), [], null);

  const settings = useMemo(() => liveSettings?.value ?? defaults, [liveSettings]);

  const upsert = async (next: Partial<BOSSettings["value"]>) => {
    const now = Date.now();
    const existing = await db.settings.get(SETTINGS_KEY);
    const payload: BOSSettings = {
      id: SETTINGS_KEY,
      key: "barangay",
      value: { ...(existing?.value ?? defaults), ...next },
      updatedAt: now,
    };

    await db.transaction("rw", db.settings, db.syncQueue, async () => {
      await db.settings.put(payload);
      await db.syncQueue.add({
        id: uuid(),
        entityType: "setting",
        entityId: SETTINGS_KEY,
        op: "UPSERT",
        payload,
        createdAt: now,
        updatedAt: now,
        status: "pending",
        tryCount: 0,
      } as any);
    });

    return payload;
  };

  return { settings, upsert };
}

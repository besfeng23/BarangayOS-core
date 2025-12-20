
"use client";

import { useCallback, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/bosDb";
import { writeActivity } from "@/lib/bos/activity/writeActivity";

export type AISettings = {
  enableAI: boolean;
  allowPII: boolean;
  demoMode: boolean;
  storeLogs: boolean;
  updatedAtISO: string;
};

const KEY = "aiSettings";

const DEFAULTS: AISettings = {
  enableAI: true,
  allowPII: false, // Default to privacy-first
  demoMode: true,
  storeLogs: true,
  updatedAtISO: new Date().toISOString(),
};

function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function useAISettings() {
  const [saving, setSaving] = useState(false);

  const settingsData = useLiveQuery(
    () => db.ai_settings.get(KEY),
    [],
    null
  );
  
  const settings = settingsData?.value as AISettings ?? DEFAULTS;
  const loading = settingsData === null;

  const save = useCallback(async (updates: Partial<AISettings>) => {
    setSaving(true);
    try {
      const currentSettings = (await db.ai_settings.get(KEY))?.value || DEFAULTS;
      const payload: AISettings = {
        ...currentSettings,
        ...updates,
        updatedAtISO: new Date().toISOString(),
      };
      
      await db.ai_settings.put({ key: KEY, value: payload });

      await db.sync_queue.add({
        id: uuid() as any,
        jobType: "AI_SETTINGS_UPSERT",
        payload,
        occurredAtISO: payload.updatedAtISO,
        synced: 0,
        status: "pending",
      } as any);

      await writeActivity({
        type: "SETTINGS_UPDATED",
        entityType: "system",
        entityId: "ai_settings",
        status: "ok",
        title: "AI Settings updated",
        subtitle: `AI Features: ${payload.enableAI ? 'Enabled' : 'Disabled'}`,
      });

    } finally {
      setSaving(false);
    }
  }, []);

  return { settings, loading, saving, save };
}

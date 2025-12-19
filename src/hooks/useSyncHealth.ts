"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/bosDb";

export function useSyncHealth() {
  const pendingCount = useLiveQuery(async () => {
    try {
      return await db.sync_queue.where("status").anyOf(["pending", "syncing"]).count();
    } catch {
      return 0;
    }
  }, [], 0);

  const errorCount = useLiveQuery(async () => {
    try {
      return await db.sync_queue.where("status").equals("failed").count();
    } catch {
      return 0;
    }
  }, [], 0);
  
  const lastSync = useLiveQuery(async () => {
      try {
        const last = await db.meta.get('lastSyncAt');
        return last?.value ? new Date(last.value as number) : null;
      } catch {
        return null;
      }
  }, [], null);

  const state: "synced" | "syncing" | "failed" | "offline" = (() => {
    // This part does not need navigator.onLine as useNetworkStatus handles it better.
    // Assuming online status is handled by a provider or another hook.
    if (errorCount && errorCount > 0) return "failed";
    if (pendingCount && pendingCount > 0) return "syncing";
    return "synced";
  })();

  return { state, pendingCount: pendingCount || 0, errorCount: errorCount || 0, lastSync };
}

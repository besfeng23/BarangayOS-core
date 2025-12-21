
"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/bosDb";
import { useNetworkStatus } from "./useNetworkStatus";

export function useSyncHealth() {
  const { isOnline } = useNetworkStatus();

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
    if (!isOnline) return "offline";
    if (errorCount && errorCount > 0) return "failed";
    if (pendingCount && pendingCount > 0) return "syncing";
    return "synced";
  })();

  return { state, pendingCount: pendingCount || 0, errorCount: errorCount || 0, lastSync };
}

"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/bosDb";
import { useOnlineStatus } from "./useOnlineStatus";

export function useSyncHealth() {
  const online = useOnlineStatus();

  // prefer camelCase; fallback to snake_case if needed
  const syncTable: any = (db as any).syncQueue ?? (db as any).sync_queue;
  const metaTable: any = (db as any).meta;

  const pendingCount = useLiveQuery(async () => {
    if (!syncTable) return 0;
    // status field is optional; treat missing as pending by default
    const pending = await syncTable.where("status").anyOf(["pending", "syncing"]).count().catch(() => 0);
    if (pending > 0) return pending;
    // fallback: if status not indexed or missing, count unsynced
    const unsynced = await syncTable.where("synced").equals(0).count().catch(() => 0);
    return unsynced;
  }, [], 0);

  const errorCount = useLiveQuery(async () => {
    if (!syncTable) return 0;
    const failed = await syncTable.where("status").equals("failed").count().catch(() => 0);
    return failed;
  }, [], 0);

  const state: "synced" | "syncing" | "failed" | "offline" = (() => {
    if (!online) return "offline";
    if (errorCount && errorCount > 0) return "failed";
    if (pendingCount && pendingCount > 0) return "syncing";
    return "synced";
  })();
  
  const lastSync = useLiveQuery(async () => {
      if (!metaTable) return null;
      const last = await metaTable.get('lastSyncAt').catch(() => null);
      return last?.value ? new Date(last.value as number) : null;
  }, [], null);

  return { state, pendingCount: pendingCount || 0, errorCount: errorCount || 0, lastSync };
}

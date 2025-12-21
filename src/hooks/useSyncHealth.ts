"use client";
import { useMemo } from "react";
import { useSyncStatus } from "./useSyncStatus";

export function useSyncHealth() {
  const { snapshot, state, isOnline } = useSyncStatus();

  const mappedState: "synced" | "syncing" | "failed" | "offline" = useMemo(() => {
    if (state === "offline") return "offline";
    if (state === "error") return "failed";
    if (state === "queued") return "syncing";
    return "synced";
  }, [state]);

  return {
    state: mappedState,
    pendingCount: snapshot.pending + snapshot.syncing,
    errorCount: snapshot.failed,
    lastSync: snapshot.lastSyncAt ? new Date(snapshot.lastSyncAt) : null,
    isOnline,
  };
}

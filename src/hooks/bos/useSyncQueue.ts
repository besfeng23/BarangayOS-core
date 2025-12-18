import { useCallback } from "react";
import { db } from "@/lib/bos/dexie/db";

// Required minimal queue API:
// enqueue({ type, payload }) stores a job locally, marked unsynced.

export function useSyncQueue() {
  const enqueue = useCallback(async (job: { type: string; payload: any }) => {
    const now = new Date().toISOString();
    await db.sync_queue.add({
      jobType: job.type,
      payload: job.payload,
      occurredAtISO: now,
      synced: 0,
    });
  }, []);

  return { enqueue };
}

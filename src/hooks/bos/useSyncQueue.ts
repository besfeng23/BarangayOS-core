import { useCallback } from "react";
import { db } from "@/lib/bosDb";

export function useSyncQueue() {
  const enqueue = useCallback(async (job: { type: string; payload: any }) => {
    await db.sync_queue.add({
      jobType: job.type,
      payload: job.payload,
      occurredAtISO: new Date().toISOString(),
      synced: 0,
    });
  }, []);

  return { enqueue };
}

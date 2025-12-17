import { useLiveQuery } from "dexie-react-hooks";
import { bosDb } from "@/lib/bosDb";

export function useSyncHealth() {
  const pending = useLiveQuery(
    () => bosDb.syncQueue.where("status").anyOf(["pending", "syncing"]).count(),
    [],
    0
  );
  const failed = useLiveQuery(
    () => bosDb.syncQueue.where("status").equals("failed").count(),
    [],
    0
  );

  const state: "synced" | "syncing" | "failed" =
    (failed || 0) > 0 ? "failed" : (pending || 0) > 0 ? "syncing" : "synced";

  return { state, pending: pending || 0, failed: failed || 0 };
}

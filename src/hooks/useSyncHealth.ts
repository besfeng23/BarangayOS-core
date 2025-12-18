
import { useLiveQuery } from "dexie-react-hooks";
import { bosDb } from "@/lib/bosDb";

export function useSyncHealth() {
  // Check both generic syncQueue and specific transactions table
  const pendingSync = useLiveQuery(
    () => bosDb.syncQueue.where("status").anyOf(["pending", "syncing"]).count(),
    [],
    0
  );
  const failedSync = useLiveQuery(
    () => bosDb.syncQueue.where("status").equals("failed").count(),
    [],
    0
  );
  const pendingTx = useLiveQuery(
    () => bosDb.transactions.where("status").equals("pending").count(),
    [],
    0
  );
  const failedTx = useLiveQuery(
    () => bosDb.transactions.where("status").equals("failed").count(),
    [],
    0
  );

  const pending = (pendingSync || 0) + (pendingTx || 0);
  const failed = (failedSync || 0) + (failedTx || 0);

  const state: "synced" | "syncing" | "failed" =
    failed > 0 ? "failed" : pending > 0 ? "syncing" : "synced";

  return { state, pending, failed };
}

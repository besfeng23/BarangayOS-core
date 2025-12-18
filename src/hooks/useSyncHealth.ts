
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/bosDb";
import { useOnlineStatus } from "./useOnlineStatus";

export function useSyncHealth() {
  const online = useOnlineStatus();

  const pendingCount = useLiveQuery(
    () => db.syncQueue.where("status").anyOf(["pending", "syncing"]).count(),
    [],
    0
  );
  const errorCount = useLiveQuery(
    () => db.syncQueue.where("status").equals("failed").count(),
    [],
    0
  );

  const state: "synced" | "syncing" | "failed" | "offline" = (() => {
    if (!online) return "offline";
    if (errorCount && errorCount > 0) return "failed";
    if (pendingCount && pendingCount > 0) return "syncing";
    return "synced";
  })();
  
  const lastSync = useLiveQuery(async () => {
      const last = await db.meta.get('lastSyncAt');
      return last ? new Date(last.value as number) : null;
  }, [], null);

  return { state, pendingCount: pendingCount || 0, errorCount: errorCount || 0, lastSync };
}

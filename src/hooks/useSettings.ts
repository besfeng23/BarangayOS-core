
import { useCallback } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, BOSSettings } from "@/lib/bosDb";
import { uuid } from "@/lib/uuid";

export function useSettings() {
  const settings = useLiveQuery(async () => {
    const s = await db.settings?.where("key").equals("barangay").first();
    return s as BOSSettings | undefined;
  }, [], undefined);

  const upsert = useCallback(async (value: BOSSettings["value"]) => {
    const now = Date.now();
    const existing = await db.settings.where("key").equals("barangay").first();
    if (existing) {
      await db.settings.update(existing.id, { value, updatedAt: now });
      return;
    }
    await db.settings.add({
      id: uuid(),
      key: "barangay",
      value,
      updatedAt: now,
    });
  }, []);

  return { settings: settings?.value, raw: settings, upsert };
}

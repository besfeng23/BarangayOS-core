import { useCallback } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { bosDb } from "@/lib/bosDb";
import { uuid } from "@/lib/uuid";

export type BOSSettings = {
  id: string;
  key: "barangay";
  value: {
    barangayName: string;
    barangayAddress: string;
    punongBarangay: string;
    secretaryName: string;
    trial?: {
      isTrialAccount: boolean;
      daysRemaining: number;
    };
  };
  updatedAt: number;
};

export function useSettings() {
  const settings = useLiveQuery(async () => {
    const s = await (bosDb as any).settings?.where("key").equals("barangay").first();
    return s as BOSSettings | undefined;
  }, [], undefined);

  const upsert = useCallback(async (value: BOSSettings["value"]) => {
    const now = Date.now();
    const existing = await (bosDb as any).settings.where("key").equals("barangay").first();
    if (existing) {
      await (bosDb as any).settings.update(existing.id, { value, updatedAt: now });
      return;
    }
    await (bosDb as any).settings.add({
      id: uuid(),
      key: "barangay",
      value,
      updatedAt: now,
    });
  }, []);

  return { settings: settings?.value, raw: settings, upsert };
}

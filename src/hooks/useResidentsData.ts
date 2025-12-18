
import { useCallback, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { bosDb, ActivityLogItem, DraftItem, ResidentRecord } from "@/lib/bosDb";
import { norm, uuid } from "@/lib/uuid";
import { logTransaction } from "@/lib/transactions";
import { useToast } from "@/components/ui/toast";

export type ResidentFilterState = {
  q: string;
  purok?: string;
  sex?: string;
  status?: string;
};

export function calcAge(birthdateISO: string): number {
  if (!birthdateISO) return 0;
  const d = new Date(birthdateISO);
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return Math.max(0, age);
}

async function logActivity(item: Omit<ActivityLogItem, "id" | "createdAt">) {
  await bosDb.activityLog.add({
    id: uuid(),
    createdAt: Date.now(),
    ...item,
  } as ActivityLogItem);
}

export function useResidentsData() {
  const [filters, setFilters] = useState<ResidentFilterState>({ q: "" });
  const { toast } = useToast();

  const queueCount = useLiveQuery(
    () => bosDb.syncQueue.where("status").anyOf(["pending", "syncing", "failed"]).count(),
    [],
    0
  );

  const snapshot = useLiveQuery(
    async () => {
      const total = await bosDb.residents.count();
      const active = await bosDb.residents.where("status").equals("ACTIVE").count();
      const inactive = await bosDb.residents.where("status").equals("INACTIVE").count();
      return { total, active, inactive };
    },
    [],
    { total: 0, active: 0, inactive: 0 }
  );

  const residents = useLiveQuery(async () => {
    const q = norm(filters.q);
    const { purok, sex, status } = filters;

    let base: ResidentRecord[];

    if (purok) {
      base = await bosDb.residents.where("purok").equals(purok).toArray();
    } else if (status) {
      base = await bosDb.residents.where("status").equals(status).toArray();
    } else if (sex) {
      base = await bosDb.residents.where("sex").equals(sex as any).toArray();
    } else if (q) {
      const byLast = await bosDb.residents.where("lastNameNorm").startsWithIgnoreCase(q).toArray();
      const byFirst = await bosDb.residents.where("firstNameNorm").startsWithIgnoreCase(q).toArray();
      const map = new Map<string, ResidentRecord>();
      byLast.forEach((r) => map.set(r.id, r));
      byFirst.forEach((r) => map.set(r.id, r));
      base = Array.from(map.values());
    } else {
      base = await bosDb.residents.toCollection().toArray();
    }

    const results = base
      .filter((r) => {
        if (purok && r.purok !== purok) return false;
        if (sex && r.sex !== sex) return false;
        if (status && r.status !== status) return false;

        if (q) {
          const nameMatch = r.lastNameNorm.startsWith(q) || r.firstNameNorm.startsWith(q);
          const hay = `${r.lastNameNorm} ${r.firstNameNorm} ${r.id} ${norm(r.addressLine1)} ${norm(r.purok)}`;
          return nameMatch || hay.includes(q);
        }
        return true;
      })
      .sort((a, b) => a.lastNameNorm.localeCompare(b.lastNameNorm));

    return results;
  }, [filters], []);

  const residentNewDraft = useLiveQuery<DraftItem | undefined>(
    () => bosDb.drafts.where("[module+key]").equals(["residents", "resident:new"]).first(),
    [],
    undefined
  );

  const upsertDraft = useCallback(async (key: string, payload: any) => {
    const now = Date.now();
    const existing = await bosDb.drafts.where("[module+key]").equals(["residents", key]).first();
    if (existing) {
      await bosDb.drafts.update(existing.id, { payload, updatedAt: now });
      return;
    }
    await bosDb.drafts.add({ id: uuid(), module: "residents", key, payload, updatedAt: now });
  }, []);

  const clearDraft = useCallback(async (key: string) => {
    const existing = await bosDb.drafts.where("[module+key]").equals(["residents", key]).first();
    if (existing) await bosDb.drafts.delete(existing.id);
  }, []);

  async function checkDuplicateLocal(lastName: string, firstName: string, birthdate: string) {
    const ln = norm(lastName);
    const fn = norm(firstName);
    const candidates = await bosDb.residents.where("lastNameNorm").equals(ln).toArray();
    return candidates.find((r) => r.firstNameNorm === fn && r.birthdate === birthdate) || null;
  }

  async function createResident(input: any) {
    const now = Date.now();
    const id = uuid();
    const record: ResidentRecord = {
      ...input,
      id,
      createdAt: now,
      lastUpdated: now,
      lastNameNorm: norm(input.lastName),
      firstNameNorm: norm(input.firstName),
      fullNameNorm: norm(`${input.firstName} ${input.middleName || ''} ${input.lastName}`),
      searchTokens: [], // Add logic to populate this
      syncState: "queued",
    };

    await bosDb.transaction("rw", bosDb.residents, bosDb.syncQueue, bosDb.activityLog, bosDb.transactions, async () => {
      await bosDb.residents.add(record);
      await bosDb.syncQueue.add({
        id: uuid(),
        entityType: "resident",
        entityId: id,
        op: "UPSERT",
        payload: record,
        createdAt: now,
        updatedAt: now,
        status: "pending",
        tryCount: 0,
      });
      await bosDb.activityLog.add({
        id: uuid(),
        createdAt: now,
        type: "RESIDENT_CREATE",
        entityType: "resident",
        entityId: id,
      } as ActivityLogItem);
      await logTransaction({
        type: 'resident_created',
        module: 'residents',
        refId: id,
      });
    });

    return record;
  }

  const isResidentQueued = useCallback(async (residentId: string) => {
    const count = await bosDb.syncQueue
      .where("[entityType+entityId]")
      .equals(["resident", residentId])
      .filter((x) => x.status === "pending" || x.status === "syncing" || x.status === "failed")
      .count();
    return count > 0;
  }, []);

  return {
    filters,
    setFilters,
    residents: residents || [],
    snapshot,
    queueCount: queueCount || 0,
    residentNewDraft,
    upsertDraft,
    clearDraft,
    createResident,
    checkDuplicateLocal,
    isResidentQueued,
    logActivity,
    toast,
  };
}

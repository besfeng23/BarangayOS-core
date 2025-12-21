

import { useCallback, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, ActivityLogLocal as ActivityLogItem, ResidentLocal as ResidentRecord } from "@/lib/bosDb";
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

export function useResidentsData() {
  const [filters, setFilters] = useState<ResidentFilterState>({ q: "" });
  const { toast } = useToast();

  const queueCount = useLiveQuery(
    () => db.sync_queue.where("status").anyOf(["pending", "syncing", "failed"]).count(),
    [],
    0
  );

  const snapshot = useLiveQuery(
    async () => {
      const total = await db.residents.count();
      const active = await db.residents.where("status").equals("ACTIVE" as any).count();
      const inactive = await db.residents.where("status").equals("INACTIVE" as any).count();
      return { total, active, inactive };
    },
    [],
    { total: 0, active: 0, inactive: 0 }
  );

  const residents = useLiveQuery(async () => {
    const q = norm(filters.q);
    const { purok, sex, status } = filters;

    let base: ResidentRecord[] = [];

    if (purok) {
      base = await db.residents.where("purok").equals(purok).toArray();
    } else if (status) {
      base = await db.residents.where("status").equals(status as any).toArray();
    } else if (sex) {
      base = await db.residents.where("sex").equals(sex as any).toArray();
    } else if (q) {
      const byLast = await db.residents.where("lastNameNorm").startsWithIgnoreCase(q).toArray();
      const byFirst = await db.residents.where("firstNameNorm").startsWithIgnoreCase(q).toArray();
      const map = new Map<string, ResidentRecord>();
      byLast.forEach((r:any) => map.set(r.id, r));
      byFirst.forEach((r:any) => map.set(r.id, r));
      base = Array.from(map.values()) as ResidentRecord[];
    } else {
      base = await db.residents.toCollection().toArray() as ResidentRecord[];
    }

    const results = base
      .filter((r: any) => {
        if (purok && r.purok !== purok) return false;
        if (sex && r.sex !== sex) return false;
        if (status && r.status !== status) return false;

        if (q) {
          const nameMatch = (r.lastNameNorm || "").startsWith(q) || (r.firstNameNorm || "").startsWith(q);
          const hay = `${r.lastNameNorm || ""} ${r.firstNameNorm || ""} ${r.id} ${norm(r.addressLine1 || "")} ${norm(r.purok || "")}`;
          return nameMatch || hay.includes(q);
        }
        return true;
      })
      .sort((a:any, b:any) => (a.lastNameNorm || "").localeCompare(b.lastNameNorm || ""));

    return results;
  }, [filters], []);

  const residentNewDraft = useLiveQuery<any | undefined>(
    () => db.table("drafts").where("[module+key]").equals(["residents", "resident:new"]).first(),
    [],
    undefined
  );

  const upsertDraft = useCallback(async (key: string, payload: any) => {
    const now = Date.now();
    const existing = await db.table("drafts").where("[module+key]").equals(["residents", key]).first();
    if (existing) {
      await db.table("drafts").update(existing.id, { payload, updatedAt: now });
      return;
    }
    await db.table("drafts").add({ id: uuid(), module: "residents", key, payload, updatedAt: now });
  }, []);

  const clearDraft = useCallback(async (key: string) => {
    const existing = await db.table("drafts").where("[module+key]").equals(["residents", key]).first();
    if (existing) await db.table("drafts").delete(existing.id);
  }, []);

  async function checkDuplicateLocal(lastName: string, firstName: string, birthdate: string) {
    const ln = norm(lastName);
    const fn = norm(firstName);
    const candidates = await db.residents.where("lastNameNorm").equals(ln).toArray();
    return (candidates as any[]).find((r) => r.firstNameNorm === fn && r.birthdate === birthdate) || null;
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
    } as unknown as ResidentRecord;

    await db.transaction("rw", db.residents, db.sync_queue, db.activity_log, async () => {
      await db.residents.add(record as any);
      await db.sync_queue.add({
        id: uuid(),
        jobType: "RESIDENT_CREATE",
        entityType: "resident",
        entityId: id,
        op: "UPSERT",
        payload: record,
        occurredAtISO: new Date(now).toISOString(),
        updatedAt: now,
        status: "pending",
        tryCount: 0,
      } as any);
      await db.activity_log.add({
        id: uuid(),
        createdAt: now,
        type: "RESIDENT_CREATE",
        entityType: "resident",
        entityId: id,
      } as any);
      await logTransaction({
        type: 'resident_created' as any,
        module: 'residents',
        refId: id,
      });
    });

    return record;
  }

  const isResidentQueued = useCallback(async (residentId: string) => {
    const count = await db.sync_queue
      .where({ entityType: "resident", entityId: residentId } as any)
      .filter((x: any) => x.status === "pending" || x.status === "syncing" || x.status === "failed")
      .count();
    return count > 0;
  }, []);
  
  const logActivity = () => {};

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

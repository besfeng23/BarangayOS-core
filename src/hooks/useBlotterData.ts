import { useCallback, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { bosDb, ActivityLogItem, BlotterRecord, BlotterStatus, Party } from "@/lib/bosDb";
import { norm, uuid } from "@/lib/uuid";
import { generateCaseNumber, tokenise } from "@/lib/blotterUtils";

export type BlotterFilterState = {
  q: string;
  status?: string;
  tag?: string;
};

async function logActivity(item: Omit<ActivityLogItem, "id" | "createdAt">) {
  await bosDb.activityLog.add({ id: uuid(), createdAt: Date.now(), ...item });
}

export function useBlotterData() {
  const [filters, setFilters] = useState<BlotterFilterState>({ q: "" });

  const queueCount = useLiveQuery(
    () => bosDb.syncQueue.where("status").anyOf(["pending", "syncing", "failed"]).count(),
    [],
    0
  );

  const snapshot = useLiveQuery(
    async () => {
      const total = await bosDb.blotters.count();
      const active = await bosDb.blotters.where("status").equals("ACTIVE" as any).count();
      const settled = await bosDb.blotters.where("status").equals("SETTLED" as any).count();
      return { total, active, settled };
    },
    [],
    { total: 0, active: 0, settled: 0 }
  );

  const blotters = useLiveQuery(async () => {
    const q = norm(filters.q);
    const { status, tag } = filters;

    let base: BlotterRecord[];

    if (status) {
      base = await bosDb.blotters.where("status").equals(status as any).toArray();
    } else if (q) {
      // token search: any token match
      const tokens = q.split(" ").filter(Boolean);
      if (tokens.length === 0) base = await bosDb.blotters.toCollection().toArray();
      else {
        // Dexie multiEntry index supports anyOf for tokens
        base = await bosDb.blotters.where("searchTokens").anyOf(tokens).toArray();
      }
    } else {
      base = await bosDb.blotters.toCollection().toArray();
    }

    const results = base
      .filter((b) => {
        if (status && b.status !== status) return false;
        if (tag && !(b.tags || []).includes(tag)) return false;

        if (q) {
          const hay = norm([b.caseNumber, b.narrative, (b.tags || []).join(" ")].join(" "));
          // token index already narrowed; keep a soft contains filter
          return hay.includes(q) || (b.searchTokens || []).some((t) => t.includes(q));
        }
        return true;
      })
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    return results;
  }, [filters], []);

  // Drafts
  const blotterNewDraft = useLiveQuery<any | undefined>(
    () => bosDb.drafts.where("[module+key]").equals(["blotter", "blotter:new"]).first(),
    [],
    undefined
  );

  const upsertDraft = useCallback(async (key: string, payload: any) => {
    const now = Date.now();
    const existing = await bosDb.drafts.where("[module+key]").equals(["blotter", key]).first();
    if (existing) {
      await bosDb.drafts.update(existing.id, { payload, updatedAt: now });
      return;
    }
    await bosDb.drafts.add({ id: uuid(), module: "blotter", key, payload, updatedAt: now } as any);
  }, []);

  const clearDraft = useCallback(async (key: string) => {
    const existing = await bosDb.drafts.where("[module+key]").equals(["blotter", key]).first();
    if (existing) await bosDb.drafts.delete(existing.id);
  }, []);

  async function createBlotter(input: {
    barangayId: string;
    incidentDate: number;
    hearingDate?: number;
    complainants: Party[];
    respondents: Party[];
    narrative: string;
    tags: string[];
    status: string;
  }) {
    const now = Date.now();
    const id = uuid();
    const caseNumber = generateCaseNumber();

    const partyText = [
      ...(input.complainants || []).map((p) => p.name),
      ...(input.respondents || []).map((p) => p.name),
    ].join(" ");

    const searchTokens = tokenise(
      caseNumber,
      input.narrative,
      (input.tags || []).join(" "),
      partyText,
      id
    );

    const record: BlotterRecord = {
      id,
      barangayId: input.barangayId,
      createdAt: now,
      updatedAt: now,
      caseNumber,
      incidentDate: input.incidentDate,
      hearingDate: input.hearingDate,
      complainants: input.complainants || [],
      respondents: input.respondents || [],
      narrative: input.narrative,
      tags: input.tags || [],
      status: input.status as any,
      searchTokens,
      syncState: "queued",
    };

    await bosDb.transaction("rw", bosDb.blotters, bosDb.syncQueue, bosDb.activityLog, async () => {
      await bosDb.blotters.add(record);

      await bosDb.syncQueue.add({
        id: uuid(),
        entityType: "blotter" as any,
        entityId: id,
        op: "UPSERT",
        payload: record,
        createdAt: now,
        updatedAt: now,
        status: "pending",
        tryCount: 0,
      } as any);

      await bosDb.activityLog.add({
        id: uuid(),
        createdAt: now,
        type: "BLOTTER_CREATE" as any,
        entityType: "blotter",
        entityId: id,
      } as any);
    });

    return record;
  }
  
  const updateBlotterStatus = useCallback(
    async (blotterId: string, nextStatus: BlotterStatus, settlementSummary?: string) => {
      const now = Date.now();
      const existing = await bosDb.blotters.get(blotterId);
      if (!existing) throw new Error("Blotter not found");

      const updated: BlotterRecord = {
        ...existing,
        status: nextStatus,
        settlementSummary: settlementSummary || undefined,
        settlementSummaryNorm: settlementSummary ? norm(settlementSummary) : undefined,
        updatedAt: now,
        syncState: "queued",
      };

      await bosDb.transaction("rw", bosDb.blotters, bosDb.syncQueue, bosDb.activityLog, async () => {
        await bosDb.blotters.put(updated);

        await bosDb.syncQueue.add({
          id: uuid(),
          entityType: "blotter",
          entityId: blotterId,
          op: "UPSERT",
          payload: updated,
          createdAt: now,
          updatedAt: now,
          status: "pending",
          tryCount: 0,
        } as any);

        await bosDb.activityLog.add({
          id: uuid(),
          createdAt: now,
          type: "BLOTTER_STATUS_UPDATE",
          entityType: "blotter",
          entityId: blotterId,
          meta: { from: existing.status, to: nextStatus, hasSummary: !!settlementSummary },
        } as any);
      });

      return updated;
    },
    []
  );

  return {
    filters,
    setFilters,
    blotters: blotters || [],
    snapshot,
    queueCount: queueCount || 0,

    blotterNewDraft,
    upsertDraft,
    clearDraft,

    createBlotter,
    updateBlotterStatus,
    logActivity,
  };
}

import { useCallback, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, ActivityLogItem, BlotterRecord, BlotterStatus, Party } from "@/lib/bosDb";
import { norm, uuid } from "@/lib/uuid";
import { generateCaseNumber, tokenize } from "@/lib/blotterUtils";
import { logTransaction } from "@/lib/transactions";
import { useToast } from "@/components/ui/toast";

export type BlotterFilterState = {
  q: string;
  status?: string;
  tag?: string;
};

async function logActivity(item: Omit<ActivityLogItem, "id" | "createdAt" | "occurredAtISO" | "searchTokens" | "synced">) {
    // This function seems to be intended to be imported from another module now.
    // Assuming it's available or should be implemented elsewhere.
}

export function useBlotterData() {
  const [filters, setFilters] = useState<BlotterFilterState>({ q: "" });
  const { toast } = useToast();

  const queueCount = useLiveQuery(
    () => db.syncQueue.where("status").anyOf(["pending", "syncing", "failed"]).count(),
    [],
    0
  );

  const snapshot = useLiveQuery(
    async () => {
      const total = await db.blotters.count();
      const active = await db.blotters.where("status").equals("ACTIVE" as any).count();
      const settled = await db.blotters.where("status").equals("SETTLED" as any).count();
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
      base = await db.blotters.where("status").equals(status as any).toArray();
    } else if (q) {
      const tokens = q.split(" ").filter(Boolean);
      if (tokens.length === 0) base = await db.blotters.toCollection().toArray();
      else {
        base = await db.blotters.where("searchTokens").anyOf(tokens).toArray();
      }
    } else {
      base = await db.blotters.toCollection().toArray();
    }

    const results = base
      .filter((b: any) => { // Using 'any' due to blotter record type discrepancies
        if (status && b.status !== status) return false;
        if (tag && !(b.tags || []).includes(tag)) return false;

        if (q) {
          const hay = norm([b.caseNumber, b.narrative, (b.tags || []).join(" ")].join(" "));
          return hay.includes(q) || (b.searchTokens || []).some((t: string) => t.includes(q));
        }
        return true;
      })
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    return results;
  }, [filters], []);

  const blotterNewDraft = useLiveQuery<any | undefined>(
    () => (db as any).drafts.where("[module+key]").equals(["blotter", "blotter:new"]).first(),
    [],
    undefined
  );

  const upsertDraft = useCallback(async (key: string, payload: any) => {
    const now = Date.now();
    const existing = await (db as any).drafts.where("[module+key]").equals(["blotter", key]).first();
    if (existing) {
      await (db as any).drafts.update(existing.id, { payload, updatedAt: now });
      return;
    }
    await (db as any).drafts.add({ id: uuid(), module: "blotter", key, payload, updatedAt: now } as any);
  }, []);

  const clearDraft = useCallback(async (key: string) => {
    const existing = await (db as any).drafts.where("[module+key]").equals(["blotter", key]).first();
    if (existing) await (db as any).drafts.delete(existing.id);
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

    const searchTokens = tokenize(
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
      caseNumberNorm: norm(caseNumber),
      incidentDate: input.incidentDate,
      hearingDate: input.hearingDate,
      complainants: input.complainants || [],
      respondents: input.respondents || [],
      narrative: input.narrative,
      narrativeNorm: norm(input.narrative),
      status: input.status as any,
      tags: input.tags || [],
      tagsNorm: (input.tags || []).map(norm),
      syncState: "queued",
      searchTokens,
    };

    await db.transaction("rw", db.blotters, db.syncQueue, db.activity_log, (db as any).transactions, async () => {
      await db.blotters.add(record as any);

      await db.syncQueue.add({
        id: uuid() as any,
        entityType: "blotter",
        entityId: id,
        op: "UPSERT",
        payload: record,
        createdAt: now,
        updatedAt: now,
        status: "pending",
        tryCount: 0,
      } as any);

      await db.activity_log.add({
        id: uuid(),
        createdAt: now,
        type: "BLOTTER_CREATE" as any,
        entityType: "blotter",
        entityId: id,
      } as any);

      await logTransaction({
        type: 'blotter_created' as any,
        module: 'blotter',
        refId: id,
      });
    });

    return record;
  }
  
  const updateBlotterStatus = useCallback(
    async (blotterId: string, nextStatus: BlotterStatus, settlementSummary?: string) => {
      const now = Date.now();
      const existing = await db.blotters.get(blotterId);
      if (!existing) throw new Error("Blotter not found");

      const updated: BlotterRecord = {
        ...(existing as any),
        status: nextStatus,
        settlementSummary: settlementSummary || undefined,
        settlementSummaryNorm: settlementSummary ? norm(settlementSummary) : undefined,
        updatedAt: now,
        syncState: "queued",
      };

      await db.transaction("rw", db.blotters, db.syncQueue, db.activity_log, async () => {
        await db.blotters.put(updated as any);

        await db.syncQueue.add({
          id: uuid() as any,
          entityType: "blotter",
          entityId: blotterId,
          op: "UPSERT",
          payload: updated,
          createdAt: now,
          updatedAt: now,
          status: "pending",
          tryCount: 0,
        } as any);

        await db.activity_log.add({
          id: uuid(),
          createdAt: now,
          type: "BLOTTER_STATUS_UPDATE",
          entityType: "blotter",
          entityId: blotterId,
          meta: { from: (existing as any).status, to: nextStatus, hasSummary: !!settlementSummary },
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
    toast,
  };
}

import { useCallback, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { bosDb, BlotterRecord, Party } from "@/lib/bosDb";
import { uuid, norm } from "@/lib/uuid";
import { generateCaseNumber } from "@/lib/blotterUtils";
import { buildTokens } from "@/lib/tokenize";

export type BlotterFilterState = {
  q: string;
  status?: "ACTIVE" | "SETTLED" | "FILED_TO_COURT" | "DISMISSED";
};

export function useBlotterData() {
  const [filters, setFilters] = useState<BlotterFilterState>({ q: "" });

  const blotters = useLiveQuery(async () => {
    const q = norm(filters.q);
    const status = filters.status;

    let base: BlotterRecord[];

    if (status) {
      base = await bosDb.blotters.where("status").equals(status).toArray();
    } else if (q) {
      // token search via *searchTokens (fast) + fallback includes
      const byTokens = await bosDb.blotters.where("searchTokens").equals(q).toArray();
      const byCase = await bosDb.blotters.where("caseNumber").startsWithIgnoreCase(q).toArray();

      const map = new Map<string, BlotterRecord>();
      byTokens.forEach((b) => map.set(b.id, b));
      byCase.forEach((b) => map.set(b.id, b));
      base = Array.from(map.values());
    } else {
      base = await bosDb.blotters.toCollection().toArray();
    }

    const results = base
      .filter((b) => {
        if (status && b.status !== status) return false;
        if (q) {
          const hay = norm(
            `${b.caseNumber} ${b.status} ${b.incidentDate} ${b.narrative} ` +
              `${b.complainants.map((p) => p.name).join(" ")} ` +
              `${b.respondents.map((p) => p.name).join(" ")} ` +
              `${b.tags.join(" ")}`
          );
          return hay.includes(q) || (b.searchTokens || []).includes(q);
        }
        return true;
      })
      .sort((a, b) => b.createdAt - a.createdAt);

    return results;
  }, [filters], []);

  const createBlotter = useCallback(async (input: {
    incidentDate: string;
    hearingDate?: string;
    complainants: Party[];
    respondents: Party[];
    narrative: string;
    status: BlotterRecord["status"];
    tags: string[];
    barangayId?: string;
  }) => {
    const now = Date.now();
    const id = uuid();
    const caseNumber = generateCaseNumber();

    const peopleTokens = buildTokens(
      ...input.complainants.map((p) => p.name),
      ...input.respondents.map((p) => p.name)
    );
    const tagTokens = buildTokens(...input.tags);
    const coreTokens = buildTokens(caseNumber, input.status, input.incidentDate);

    const record: BlotterRecord = {
      id,
      barangayId: input.barangayId,
      createdAt: now,
      updatedAt: now,
      lastUpdated: now,

      caseNumber,
      incidentDate: input.incidentDate,
      hearingDate: input.hearingDate || "",

      complainants: input.complainants,
      respondents: input.respondents,

      narrative: input.narrative,
      status: input.status,
      tags: input.tags || [],

      searchTokens: Array.from(new Set([...peopleTokens, ...tagTokens, ...coreTokens].map(norm))).filter(Boolean),

      syncState: "queued",
    };

    await bosDb.transaction("rw", bosDb.blotters, bosDb.syncQueue, async () => {
      await bosDb.blotters.add(record);

      await bosDb.syncQueue.add({
        id: uuid(),
        entityType: "resident", // keep existing typing? we’ll override safely via payload marker
        entityId: id,
        op: "UPSERT",
        payload: { ...record, __entityType: "blotter" },
        createdAt: now,
        updatedAt: now,
        status: "pending",
        tryCount: 0,
      } as any);
    });

    return record;
  }, []);

  const updateBlotter = useCallback(async (id: string, changes: Partial<BlotterRecord>) => {
    const now = Date.now();
    await bosDb.transaction("rw", bosDb.blotters, bosDb.syncQueue, async () => {
      const existing = await bosDb.blotters.get(id);
      if (existing) {
        const updatedRecord = { ...existing, ...changes, updatedAt: now, lastUpdated: now };
        await bosDb.blotters.put(updatedRecord);
        
        await bosDb.syncQueue.add({
          id: uuid(),
          entityType: "resident", // Using a generic type for now
          entityId: id,
          op: "UPSERT",
          payload: { ...changes, __entityType: "blotter" }, // Only send changes
          createdAt: now,
          updatedAt: now,
          status: "pending",
          tryCount: 0,
        } as any);
      }
    });
  }, []);

  const logBlotterPrint = useCallback(async (blotterId: string, docType: "SUMMONS" | "AMICABLE_SETTLEMENT", controlNo: string, meta?: any) => {
    const now = Date.now();
    const id = uuid();

    await bosDb.transaction("rw", bosDb.blotterPrintLogs, bosDb.syncQueue, async () => {
      await bosDb.blotterPrintLogs.add({
        id,
        createdAt: now,
        blotterId,
        docType,
        controlNo,
        status: "pending",
        tryCount: 0,
        meta,
      });

      await bosDb.syncQueue.add({
        id: uuid(),
        entityType: "print_log",
        entityId: id,
        op: "UPSERT",
        payload: { id, createdAt: now, blotterId, docType, controlNo, meta, __entityType: "blotter_print" },
        createdAt: now,
        updatedAt: now,
        status: "pending",
        tryCount: 0,
      });
    });

    return id;
  }, []);

  return {
    filters,
    setFilters,
    blotters: blotters || [],
    createBlotter,
    updateBlotter,
    logBlotterPrint,
  };
}

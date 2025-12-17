import { useCallback, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { bosDb, ActivityLogItem, BlotterRecord, Party } from "@/lib/bosDb";
import { norm, uuid } from "@/lib/uuid";
import { generateCaseNumber } from "@/lib/blotterUtils";

export type BlotterFilterState = {
  q: string;
  status?: "ACTIVE" | "SETTLED" | "FILED_TO_COURT" | "DISMISSED";
  tag?: string;
};

async function logActivity(item: Omit<ActivityLogItem, "id" | "createdAt">) {
  await bosDb.activityLog.add({ id: uuid(), createdAt: Date.now(), ...item });
}

function tokenizeBlotter(input: {
  caseNumber: string;
  complainants: Party[];
  respondents: Party[];
  tags: string[];
  narrative: string;
  incidentDateISO: string;
}) {
  const tokens = new Set<string>();

  const caseNorm = norm(input.caseNumber);
  tokens.add(caseNorm);
  // allow searching last 4-6 chars
  const tail = caseNorm.replace(/[^a-z0-9]/g, "");
  if (tail.length >= 4) tokens.add(tail.slice(-4));
  if (tail.length >= 6) tokens.add(tail.slice(-6));

  input.complainants.forEach((p) => {
    norm(p.name).split(" ").forEach((t) => t && tokens.add(t));
  });
  input.respondents.forEach((p) => {
    norm(p.name).split(" ").forEach((t) => t && tokens.add(t));
  });

  (input.tags || []).forEach((t) => norm(t).split(" ").forEach((x) => x && tokens.add(x)));

  norm(input.narrative).split(" ").slice(0, 60).forEach((t) => t && tokens.add(t));

  // incident date searchable
  tokens.add(norm(input.incidentDateISO));

  return Array.from(tokens).slice(0, 60);
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
      const active = await bosDb.blotters.where("status").equals("ACTIVE").count();
      const settled = await bosDb.blotters.where("status").equals("SETTLED").count();
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
      base = await bosDb.blotters.where("status").equals(status).toArray();
    } else if (tag) {
      // multiEntry index
      base = await bosDb.blotters.where("tags").equals(tag).toArray();
    } else if (q) {
      // multiEntry searchTokens index (fast)
      base = await bosDb.blotters.where("searchTokens").equals(q).toArray();
      if (base.length === 0) {
        // fallback: try case number prefix
        base = await bosDb.blotters.where("caseNumberNorm").startsWithIgnoreCase(q).toArray();
      }
    } else {
      base = await bosDb.blotters.toCollection().toArray();
    }

    const results = base
      .filter((b) => {
        if (status && b.status !== status) return false;
        if (tag && !(b.tags || []).includes(tag)) return false;
        if (q) {
          const hay = `${b.caseNumberNorm} ${(b.searchTokens || []).join(" ")}`;
          return hay.includes(q);
        }
        return true;
      })
      .sort((a, d) => d.lastUpdated - a.lastUpdated);

    return results;
  }, [filters], []);

  const upsertDraft = useCallback(async (key: string, payload: any) => {
    const now = Date.now();
    const existing = await bosDb.drafts.where("[module+key]").equals(["blotter", key]).first();
    if (existing) {
      await bosDb.drafts.update(existing.id, { payload, updatedAt: now });
      return;
    }
    await bosDb.drafts.add({ id: uuid(), module: "blotter", key, payload, updatedAt: now });
  }, []);

  const clearDraft = useCallback(async (key: string) => {
    const existing = await bosDb.drafts.where("[module+key]").equals(["blotter", key]).first();
    if (existing) await bosDb.drafts.delete(existing.id);
  }, []);

  const blotterNewDraft = useLiveQuery(
    () => bosDb.drafts.where("[module+key]").equals(["blotter", "blotter:new"]).first(),
    [],
    undefined as any
  );

  async function createBlotter(input: {
    incidentDateISO: string;
    hearingDateISO?: string;
    complainants: Party[];
    respondents: Party[];
    narrative: string;
    tags: string[];
    status?: BlotterRecord["status"];
  }) {
    const now = Date.now();
    const id = uuid();
    const caseNumber = generateCaseNumber();

    const complainants = (input.complainants || []).map((p) => ({
      ...p,
      name: p.name?.trim() || "UNKNOWN",
      nameNorm: norm(p.name),
    }));
    const respondents = (input.respondents || []).map((p) => ({
      ...p,
      name: p.name?.trim() || "UNKNOWN",
      nameNorm: norm(p.name),
    }));

    const record: BlotterRecord = {
      id,
      createdAt: now,
      lastUpdated: now,
      caseNumber,
      caseNumberNorm: norm(caseNumber),
      incidentDateISO: input.incidentDateISO,
      hearingDateISO: input.hearingDateISO || "",
      complainants,
      respondents,
      narrative: input.narrative,
      tags: input.tags || [],
      searchTokens: tokenizeBlotter({
        caseNumber,
        complainants,
        respondents,
        tags: input.tags || [],
        narrative: input.narrative,
        incidentDateISO: input.incidentDateISO,
      }),
      status: input.status || "ACTIVE",
      syncState: "queued",
    };

    await bosDb.transaction("rw", bosDb.blotters, bosDb.syncQueue, bosDb.activityLog, async () => {
      await bosDb.blotters.add(record);

      await bosDb.syncQueue.add({
        id: uuid(),
        entityType: "blotter",
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
        type: "BLOTTER_CREATE",
        entityType: "blotter",
        entityId: id,
      });
    });

    return record;
  }

  async function updateBlotter(id: string, patch: Partial<BlotterRecord>) {
    const now = Date.now();
    const existing = await bosDb.blotters.get(id);
    if (!existing) return;

    const merged: BlotterRecord = {
      ...existing,
      ...patch,
      lastUpdated: now,
      caseNumberNorm: norm((patch.caseNumber ?? existing.caseNumber) as any),
    };

    // if narrative/parties/tags changed, refresh tokens
    const tokens = tokenizeBlotter({
      caseNumber: merged.caseNumber,
      complainants: merged.complainants,
      respondents: merged.respondents,
      tags: merged.tags || [],
      narrative: merged.narrative || "",
      incidentDateISO: merged.incidentDateISO,
    });
    merged.searchTokens = tokens;
    merged.syncState = "queued";

    await bosDb.transaction("rw", bosDb.blotters, bosDb.syncQueue, bosDb.activityLog, async () => {
      await bosDb.blotters.put(merged);

      await bosDb.syncQueue.add({
        id: uuid(),
        entityType: "blotter",
        entityId: id,
        op: "UPSERT",
        payload: merged,
        createdAt: now,
        updatedAt: now,
        status: "pending",
        tryCount: 0,
      });

      await bosDb.activityLog.add({
        id: uuid(),
        createdAt: now,
        type: "BLOTTER_UPDATE",
        entityType: "blotter",
        entityId: id,
      });
    });
  }

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
    updateBlotter,
    logActivity,
  };
}

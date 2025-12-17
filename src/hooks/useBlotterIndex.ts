import { useCallback, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { bosDb, BlotterRecord, BlotterStatus } from "@/lib/bosDb";
import { norm } from "@/lib/uuid";

export type BlotterFilterState = {
  q: string;
  status?: BlotterStatus;
  tag?: string;
};

function normTokens(s: string): string[] {
  return norm(s)
    .split(" ")
    .map((t) => t.trim())
    .filter(Boolean);
}

export function useBlotterIndex() {
  const [filters, setFilters] = useState<BlotterFilterState>({ q: "" });

  // O(1) snapshot counts
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

  // Index-first narrowing (NO DOM filtering as primary)
  const blotters = useLiveQuery(async () => {
    const q = norm(filters.q);
    const qTokens = normTokens(q);
    const { status, tag } = filters;

    let base: BlotterRecord[];

    // 1) Most specific: tag index (multiEntry)
    if (tag) {
      base = await bosDb.blotters.where("tagsNorm").equals(norm(tag)).toArray();
    } else if (status) {
      base = await bosDb.blotters.where("status").equals(status).toArray();
    } else if (q) {
      // fast-ish lookup:
      // - caseNumberNorm includes caseNumber and can be searched by startsWithIgnoreCase for quick case # retrieval
      // - fallback to local scan for narrative/name tokens (still on Dexie array)
      const byCase = await bosDb.blotters.where("caseNumberNorm").startsWithIgnoreCase(q).toArray();
      base = byCase.length ? byCase : await bosDb.blotters.toCollection().toArray();
    } else {
      base = await bosDb.blotters.toCollection().toArray();
    }

    // 2) Final refine (token match)
    const results = base
      .filter((b) => {
        if (status && b.status !== status) return false;
        if (tag && !b.tagsNorm?.includes(norm(tag))) return false;

        if (q) {
          const hay = [
            b.caseNumberNorm,
            b.narrativeNorm,
            ...(b.tagsNorm || []),
            // party names are “raw”, so normalize here for search
            ...((b.complainants || []).map((p) => norm(p.name))),
            ...((b.respondents || []).map((p) => norm(p.name))),
          ].join(" ");

          // multi-token AND match
          return qTokens.every((t) => hay.includes(t));
        }
        return true;
      })
      .sort((a, b) => b.incidentDate - a.incidentDate);

    return results;
  }, [filters], []);

  const clearFilters = useCallback(() => setFilters({ q: "" }), []);

  return {
    filters,
    setFilters,
    clearFilters,
    snapshot,
    blotters: blotters || [],
  };
}

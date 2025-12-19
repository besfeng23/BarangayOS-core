
import { useCallback, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, BlotterRecord, BlotterStatus } from "@/lib/bosDb";
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

  const snapshot = useLiveQuery(
    async () => {
      const total = await db.blotters.count();
      const active = await db.blotters.where("status").equals("ACTIVE").count();
      const settled = await db.blotters.where("status").equals("SETTLED").count();
      return { total, active, settled };
    },
    [],
    { total: 0, active: 0, settled: 0 }
  );

  const blotters = useLiveQuery(async () => {
    const q = norm(filters.q);
    const qTokens = normTokens(q);
    const { status, tag } = filters;

    let base: BlotterRecord[];

    if (tag) {
      base = await db.blotters.where("tagsNorm").equals(norm(tag)).toArray();
    } else if (status) {
      base = await db.blotters.where("status").equals(status).toArray();
    } else if (q) {
      const byCase = await db.blotters.where("caseNumberNorm").startsWithIgnoreCase(q).toArray();
      base = byCase.length ? byCase : await db.blotters.toCollection().toArray();
    } else {
      base = await db.blotters.orderBy('incidentDate').reverse().toArray();
    }

    const results = base
      .filter((b: any) => {
        if (status && b.status !== status) return false;
        if (tag && !b.tagsNorm?.includes(norm(tag))) return false;

        if (q) {
          const hay = [
            b.caseNumberNorm,
            b.narrativeNorm,
            ...(b.tagsNorm || []),
            ...((b.complainants || []).map((p: any) => norm(p.name))),
            ...((b.respondents || []).map((p: any) => norm(p.name))),
          ].join(" ");

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



import { useCallback, useEffect, useMemo, useState } from "react";
import { db, ResidentLocal, resetLocalDatabase, DB_VERSION } from "@/lib/bosDb";
import { toTokens } from "@/lib/bos/searchTokens";
import { useLiveQuery } from "dexie-react-hooks";

export function useResidents() {
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: items = [], loading } = useLiveQuery(async () => {
    try {
      const q = query.trim().toUpperCase();
      if (!q) {
        return await db.residents.orderBy("fullNameUpper").limit(200).toArray();
      }
      const first = q.split(/\s+/)[0];
      const hits = await db.residents.where("searchTokens").equals(first).toArray();
      const refined = hits.filter((r: any) => {
        const hay = [
          r.fullNameUpper,
          r.householdNoUpper ?? "",
          r.id,
        ].join(" ");
        return hay.includes(q);
      });
      refined.sort((a: any, b: any) => (a.fullNameUpper > b.fullNameUpper ? 1 : -1));
      return refined;
    } catch (e: any) {
      setError(e?.message ?? String(e));
      return [];
    }
  }, [query], { data: [], loading: true });

  const tools = useMemo(() => {
    return {
      dbVersion: DB_VERSION,
      resetLocalDatabase,
    };
  }, []);

  return { query, setQuery, items, loading, error, tools };
}

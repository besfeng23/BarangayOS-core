import { useCallback, useEffect, useMemo, useState } from "react";
import { db, ResidentLocal, resetLocalDatabase, DB_VERSION } from "@/lib/bosDb";

export function useResidents() {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<ResidentLocal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const q = query.trim().toUpperCase();

      if (!q) {
        const list = await db.residents.orderBy("fullNameUpper").limit(200).toArray();
        setItems(list);
        return;
      }

      const first = q.split(/\s+/)[0];
      const hits = await db.residents.where("searchTokens").equals(first).toArray();

      const refined = hits.filter((r) => {
        const hay = [
          r.fullNameUpper,
          r.householdNoUpper ?? "",
          r.id,
        ].join(" ");
        return hay.includes(q);
      });

      refined.sort((a, b) => (a.fullNameUpper > b.fullNameUpper ? 1 : -1));
      setItems(refined);
    } catch (e: any) {
      setError(e?.message ?? String(e));
      setItems([]);
      console.error("Residents reload failed:", e);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => { reload(); }, [reload]);

  const tools = useMemo(() => {
    return {
      dbVersion: DB_VERSION,
      resetLocalDatabase,
    };
  }, []);

  return { query, setQuery, items, loading, error, reload, tools };
}

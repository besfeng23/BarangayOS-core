

"use client";
import { useCallback, useEffect, useState } from "react";
import { db, ActivityLogLocal } from "@/lib/bosDb";
import { useLiveQuery } from "dexie-react-hooks";

function upper(s: string) { return (s ?? "").trim().toUpperCase(); }

export function useActivityHistory() {
  const [query, setQuery] = useState("");

  const { data: items, loading } = useLiveQuery(async () => {
    const q = upper(query);
    if (!q) {
      return await db.activity_log.orderBy("occurredAtISO").reverse().limit(200).toArray();
    }
    const first = q.split(/\s+/)[0];
    const hits = await db.activity_log.where("searchTokens").equals(first).toArray();
    const refined = hits.filter((a) => {
      const hay = [upper(a.title), upper(a.subtitle), a.type, a.entityType, a.entityId].join(" ");
      return hay.includes(q);
    });
    refined.sort((a, b) => (a.occurredAtISO > b.occurredAtISO ? -1 : 1));
    return refined;
  }, [query], { data: [], loading: true });

  return { query, setQuery, items: items || [], loading };
}

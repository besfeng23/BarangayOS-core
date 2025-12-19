"use client";
import { useCallback, useEffect, useState } from "react";
import { db, ActivityLogLocal } from "@/lib/bosDb";

function upper(s: string) { return (s ?? "").trim().toUpperCase(); }

export function useActivityHistory() {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<ActivityLogLocal[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchList = useCallback(async (qRaw: string) => {
    setLoading(true);
    try {
      const q = upper(qRaw);
      if (!q) {
        const list = await db.activity_log.orderBy("occurredAtISO").reverse().limit(200).toArray();
        setItems(list);
        return;
      }
      const first = q.split(/\s+/)[0];
      const hits = await db.activity_log.where("searchTokens").equals(first).toArray();
      const refined = hits.filter((a) => {
        const hay = [upper(a.title), upper(a.subtitle), a.type, a.entityType, a.entityId].join(" ");
        return hay.includes(q);
      });
      refined.sort((a, b) => (a.occurredAtISO > b.occurredAtISO ? -1 : 1));
      setItems(refined);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchList(query); }, [query, fetchList]);

  return { query, setQuery, items, loading };
}

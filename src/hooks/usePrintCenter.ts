

"use client";
import { useCallback, useEffect, useState } from "react";
import { db, PrintJobLocal } from "@/lib/bosDb";
import { useLiveQuery } from "dexie-react-hooks";

export function usePrintCenter() {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"queued" | "recent">("queued");

  const { data: items, loading } = useLiveQuery(async () => {
    const q = query.trim().toUpperCase();
    let list = await db.print_jobs.orderBy("createdAtISO").reverse().limit(200).toArray();

    list = list.filter((j) => (tab === "queued" ? j.status !== "printed" : j.status === "printed"));

    if (q) {
      list = list.filter((j) => {
        const hay = `${j.title} ${j.subtitle} ${j.docType} ${j.entityType} ${j.entityId}`.toUpperCase();
        return hay.includes(q);
      });
    }

    return list;
  }, [query, tab], { data: [], loading: true });


  const reload = useCallback(() => {
    // This is now handled by useLiveQuery, but we keep the function
    // in case of future imperative needs.
  }, []);

  return { query, setQuery, items: items || [], tab, setTab, loading, reload };
}

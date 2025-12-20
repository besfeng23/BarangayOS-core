
"use client";
import { useCallback, useEffect, useState } from "react";
import { db, PrintJobLocal } from "@/lib/bosDb";

export function usePrintCenter() {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<PrintJobLocal[]>([]);
  const [tab, setTab] = useState<"queued" | "recent">("queued");
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const q = query.trim().toUpperCase();
      let list = await db.print_jobs.orderBy("createdAtISO").reverse().limit(200).toArray();

      list = list.filter((j) => (tab === "queued" ? j.status !== "printed" : j.status === "printed"));

      if (q) {
        list = list.filter((j) => {
          const hay = `${j.title} ${j.subtitle} ${j.docType} ${j.entityType} ${j.entityId}`.toUpperCase();
          return hay.includes(q);
        });
      }

      setItems(list);
    } finally {
      setLoading(false);
    }
  }, [query, tab]);

  useEffect(() => { reload(); }, [reload]);

  return { query, setQuery, items, tab, setTab, loading, reload };
}

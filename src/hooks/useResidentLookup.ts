
import { useCallback, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, ResidentRecord } from "@/lib/bosDb";
import { norm } from "@/lib/uuid";

export function useResidentLookup() {
  const [q, setQ] = useState("");

  const results = useLiveQuery(async () => {
    const query = norm(q);
    if (!query || query.length < 2) return [] as ResidentRecord[];

    // Fast path: multiEntry searchTokens
    const byToken = await db.residents.where("searchTokens").equals(query).toArray();
    if (byToken.length) {
      return byToken
        .filter((r) => r.status === "ACTIVE")
        .sort((a, b) => a.fullNameNorm.localeCompare(b.fullNameNorm))
        .slice(0, 8);
    }

    // Fallback: startsWith name
    const byName = await db.residents.where("fullNameNorm").startsWithIgnoreCase(query).toArray();
    return byName
      .filter((r) => r.status === "ACTIVE")
      .sort((a, b) => a.fullNameNorm.localeCompare(b.fullNameNorm))
      .slice(0, 8);
  }, [q], []);

  const clear = useCallback(() => setQ(""), []);

  return { q, setQ, results: results || [], clear };
}

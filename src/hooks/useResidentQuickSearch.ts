import { useLiveQuery } from "dexie-react-hooks";
import { bosDb, ResidentRecord } from "@/lib/bosDb";
import { norm } from "@/lib/uuid";

export function useResidentQuickSearch(q: string, limit: number = 8) {
  const results = useLiveQuery(async () => {
    const nq = norm(q);
    if (!nq) return [] as ResidentRecord[];

    // Fast path: startsWith on last and first name indexes
    const byLast = await bosDb.residents.where("lastNameNorm").startsWithIgnoreCase(nq).limit(limit).toArray();
    const byFirst = await bosDb.residents.where("firstNameNorm").startsWithIgnoreCase(nq).limit(limit).toArray();

    const map = new Map<string, ResidentRecord>();
    byLast.forEach(r => map.set(r.id, r));
    byFirst.forEach(r => map.set(r.id, r));

    return Array.from(map.values()).slice(0, limit);
  }, [q, limit], []);

  return results || [];
}

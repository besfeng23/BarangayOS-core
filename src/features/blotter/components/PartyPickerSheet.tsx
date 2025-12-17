import React, { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { bosDb, ResidentRecord } from "@/lib/bosDb";
import { norm } from "@/lib/uuid";

export function PartyPickerSheet({
  open,
  onClose,
  onPick,
  title = "Select Resident",
}: {
  open: boolean;
  onClose: () => void;
  onPick: (resident: ResidentRecord) => void;
  title?: string;
}) {
  const [q, setQ] = useState("");

  const results = useLiveQuery(async () => {
    const query = norm(q);
    if (!query) return [];

    // Fast path: tokens + startsWith name norms
    const byLast = await bosDb.residents
      .where("lastNameNorm")
      .startsWithIgnoreCase(query)
      .toArray();
    const byFirst = await bosDb.residents
      .where("firstNameNorm")
      .startsWithIgnoreCase(query)
      .toArray();

    // If you have searchTokens in residents v3/v4, use it too:
    let byTokens: ResidentRecord[] = [];
    try {
      byTokens = await bosDb.residents.where("searchTokens").equals(query).toArray();
    } catch {
      // ignore if index not present
    }

    const map = new Map<string, ResidentRecord>();
    [...byLast, ...byFirst, ...byTokens].forEach((r) => map.set(r.id, r));
    return Array.from(map.values())
      .slice(0, 30)
      .sort((a, b) => a.lastNameNorm.localeCompare(b.lastNameNorm));
  }, [q], []);

  const has = useMemo(() => (results || []).length > 0, [results]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 flex items-end sm:items-center justify-center p-3" role="dialog" aria-modal="true">
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="p-4 flex items-center justify-between border-b border-zinc-800">
          <div className="text-zinc-100 font-bold">{title}</div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-300 min-h-[48px]
              focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
          >
            Close
          </button>
        </div>

        <div className="p-4 space-y-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search resident by name..."
            className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-2xl text-zinc-100 min-h-[48px]
              focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
            autoFocus
          />

          {!q ? (
            <div className="text-zinc-500 text-sm p-3 border border-dashed border-zinc-800 rounded-2xl">
              Type a name to search locally.
            </div>
          ) : !has ? (
            <div className="text-zinc-500 text-sm p-3 border border-dashed border-zinc-800 rounded-2xl">
              No matches found.
            </div>
          ) : (
            <div className="max-h-[50vh] overflow-y-auto space-y-2 pr-1">
              {(results || []).map((r) => (
                <button
                  key={r.id}
                  onClick={() => onPick(r)}
                  className="w-full text-left p-4 bg-zinc-950 border border-zinc-800 rounded-2xl min-h-[48px]
                    focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-zinc-100 font-semibold truncate">
                      {r.lastName.toUpperCase()}, {r.firstName}
                    </div>
                    <div className="text-xs text-zinc-500 font-mono truncate">{r.id.slice(0, 8)}…</div>
                  </div>
                  <div className="text-zinc-400 text-sm truncate">
                    {r.purok} • {r.addressLine1}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-3 border-t border-zinc-800 text-xs text-zinc-500">
          Offline search runs on local IndexedDB.
        </div>
      </div>
    </div>
  );
}

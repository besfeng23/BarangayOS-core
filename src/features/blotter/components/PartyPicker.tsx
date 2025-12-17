import React, { useMemo, useState } from "react";
import { Party, ResidentRecord } from "@/lib/bosDb";
import { norm, uuid } from "@/lib/uuid";
import { useResidentLookup } from "@/hooks/useResidentLookup";

const baseInput =
  "w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-2xl text-zinc-100 " +
  "focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950";

function Pill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-zinc-800 border border-zinc-700">
      <span className="text-zinc-100 text-sm font-medium">{label}</span>
      <button
        onClick={onRemove}
        className="w-8 h-8 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-300
          focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
        aria-label={`Remove ${label}`}
      >
        ✕
      </button>
    </div>
  );
}

export function PartyPicker({
  label,
  parties,
  onChange,
  placeholder = "Search resident or type name...",
}: {
  label: string;
  parties: Party[];
  onChange: (next: Party[]) => void;
  placeholder?: string;
}) {
  const { q, setQ, results, clear } = useResidentLookup();
  const [freeText, setFreeText] = useState("");

  const existingKeySet = useMemo(() => {
    const set = new Set<string>();
    (parties || []).forEach((p) => set.add((p.residentId || "") + "::" + p.nameNorm));
    return set;
  }, [parties]);

  function addResident(r: ResidentRecord) {
    const p: Party = {
      residentId: r.id,
      name: `${r.lastName.toUpperCase()}, ${r.firstName}`,
      nameNorm: norm(`${r.lastName} ${r.firstName}`),
    };
    const key = (p.residentId || "") + "::" + p.nameNorm;
    if (existingKeySet.has(key)) return;

    onChange([...(parties || []), p]);
    setQ("");
    setFreeText("");
    clear();
  }

  function addFreeText() {
    const raw = freeText.trim();
    if (!raw) return;
    const p: Party = { name: raw, nameNorm: norm(raw) };
    const key = (p.residentId || "") + "::" + p.nameNorm;
    if (existingKeySet.has(key)) return;

    onChange([...(parties || []), p]);
    setFreeText("");
    setQ("");
    clear();
  }

  function removeAt(idx: number) {
    const next = [...(parties || [])];
    next.splice(idx, 1);
    onChange(next);
  }

  return (
    <div className="space-y-2">
      <div className="text-xs text-zinc-500 uppercase font-medium ml-1">{label}</div>

      <div className="flex flex-col gap-2">
        <input
          className={baseInput}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          aria-label={`${label} resident search`}
        />

        {/* Suggestions */}
        {q.trim().length >= 2 && results.length > 0 && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
            {results.map((r) => (
              <button
                key={r.id}
                onClick={() => addResident(r)}
                className="w-full text-left px-4 py-3 border-b border-zinc-800 last:border-b-0
                  hover:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
                aria-label={`Select ${r.lastName}, ${r.firstName}`}
              >
                <div className="text-zinc-100 font-semibold">
                  {r.lastName.toUpperCase()}, {r.firstName}
                </div>
                <div className="text-zinc-400 text-sm truncate">
                  {r.purok} • {r.addressLine1}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Free text fallback */}
        <div className="flex gap-2">
          <input
            className={baseInput}
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            placeholder="Or type full name (outsider)"
            aria-label={`${label} free text`}
          />
          <button
            onClick={addFreeText}
            className="min-h-[48px] px-4 rounded-2xl bg-zinc-800 border border-zinc-700 text-zinc-100 font-semibold
              focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
          >
            Add
          </button>
        </div>

        {/* Selected */}
        {parties?.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {parties.map((p, idx) => (
              <Pill
                key={(p.residentId || uuid()) + "::" + p.nameNorm + "::" + idx}
                label={p.name}
                onRemove={() => removeAt(idx)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

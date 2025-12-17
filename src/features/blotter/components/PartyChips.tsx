import React from "react";
import { Party } from "@/lib/bosDb";

export function PartyChips({
  items,
  onRemove,
}: {
  items: Party[];
  onRemove: (idx: number) => void;
}) {
  if (!items || items.length === 0) {
    return (
      <div className="text-zinc-500 text-sm p-3 border border-dashed border-zinc-800 rounded-2xl">
        No parties added yet.
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((p, idx) => (
        <div
          key={`${p.name}-${idx}`}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-zinc-950 border border-zinc-800"
        >
          <span className="text-zinc-100 text-sm font-medium">
            {p.name}
          </span>

          {p.residentId ? (
            <span className="text-xs text-zinc-400 border border-zinc-800 rounded-full px-2 py-0.5">
              Linked
            </span>
          ) : (
            <span className="text-xs text-zinc-500 border border-zinc-900 rounded-full px-2 py-0.5">
              Typed
            </span>
          )}

          <button
            onClick={() => onRemove(idx)}
            className="ml-1 w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300
              focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
            aria-label={`Remove ${p.name}`}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

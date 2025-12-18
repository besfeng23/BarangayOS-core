"use client";
import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../../firebase";
import type { BlotterCase } from "../../types";
import { useTerminalUI } from "../../contexts/TerminalUIContext";
import dynamic from "next/dynamic";

const PageComponent = () => {
  const navigate = useNavigate();
  const { id: selectedId } = useParams();
  const { globalSearch } = useTerminalUI();

  const [cases, setCases] = React.useState<BlotterCase[]>([]);

  React.useEffect(() => {
    const q = query(collection(db, "blotters"), orderBy("lastUpdated", "desc"));
    return onSnapshot(q, (snap) => {
      setCases(snap.docs.map((d) => ({ id: d.id, ...d.data() } as BlotterCase)));
    });
  }, []);

  const filtered = React.useMemo(() => {
    const s = globalSearch.trim().toLowerCase();

    return cases.filter((c) => {
      if (!s) return true;

      const a = (c.participantsDisplay?.complainant || "").toLowerCase();
      const b = (c.participantsDisplay?.respondent || "").toLowerCase();
      const n = (c.narrative || "").toLowerCase();
      const id = (c.id || "").toLowerCase();

      return a.includes(s) || b.includes(s) || n.includes(s) || id.includes(s);
    });
  }, [cases, globalSearch]);

  return (
    <div className="h-full flex flex-col bg-zinc-950">
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">No cases found.</div>
        ) : (
          filtered.map((c) => (
            <button
              key={c.id}
              onClick={() => navigate(`/blotter/${c.id}`)}
              className={[
                "w-full text-left p-4 border-b border-zinc-800/60 hover:bg-zinc-900/40 transition-colors min-h-[72px]",
                selectedId === c.id ? "bg-zinc-900/60 border-l-2 border-l-amber-400" : "",
              ].join(" ")}
            >
              <div className="flex justify-between mb-2">
                <span
                  className={[
                    "text-[10px] font-black px-2 py-1 rounded-full",
                    c.status === "SETTLED"
                      ? "text-emerald-300 bg-emerald-400/10 border border-emerald-400/20"
                      : c.status === "HEARING_DONE"
                      ? "text-blue-300 bg-blue-400/10 border border-blue-400/20"
                      : "text-amber-300 bg-amber-400/10 border border-amber-400/20",
                  ].join(" ")}
                >
                  {c.status.replace("_", " ")}
                </span>
                <span className="text-xs text-zinc-500 font-mono">#{c.id.slice(-4)}</span>
              </div>

              <div className="font-black text-zinc-100 truncate">
                {(c.participantsDisplay?.complainant || "—")}{" "}
                <span className="text-zinc-600 text-xs">vs</span>{" "}
                {(c.participantsDisplay?.respondent || "—")}
              </div>

              <div className="text-sm text-zinc-500 line-clamp-1 mt-1">{c.narrative || "—"}</div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(PageComponent), { ssr: false });

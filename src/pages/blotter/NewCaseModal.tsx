import * as React from "react";
import { addDoc, collection, getDocs, limit, query, serverTimestamp, where } from "firebase/firestore";
import { db } from "../../firebase";
import type { Participant, ParticipantType } from "../../types";
import { useBlotterData } from "../../hooks/useBlotterData";
import { useDebouncedValue, useViewportRecenterOnKeyboard } from "../../hooks";
import { useTerminalUI } from "../../contexts/TerminalUIContext";

interface ResidentOption {
  id: string;
  name: string;
  address?: string;
}

function ResidentLookupInput({
  label,
  onSelect,
}: {
  label: string;
  onSelect: (r: ResidentOption) => void;
}) {
  const [term, setTerm] = React.useState("");
  const debouncedTerm = useDebouncedValue(term, 400);
  const [results, setResults] = React.useState<ResidentOption[]>([]);
  const [isOpen, setIsOpen] = React.useState(false);

  const reqIdRef = React.useRef(0);
  const rootRef = React.useRef<HTMLDivElement | null>(null);

  // click-outside close
  React.useEffect(() => {
    const onDown = (e: any) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);

  React.useEffect(() => {
    let alive = true;
    const myReqId = ++reqIdRef.current;
    const token = debouncedTerm.trim().toLowerCase().split(/\s+/)[0];

    if (!token || token.length < 2) {
      setResults([]);
      return;
    }

    const q = query(collection(db, "residents"), where("searchTokens", "array-contains", token), limit(10));

    getDocs(q)
      .then((snap) => {
        if (!alive || myReqId !== reqIdRef.current) return;

        const list = snap.docs.map((d) => {
          const data: any = d.data();
          const first = (data.firstName || "").trim();
          const last = (data.lastName || "").trim();
          const full = `${first} ${last}`.trim();
          return {
            id: d.id,
            name: full || "Unnamed Resident",
            address: data.purok ? `Purok ${data.purok}` : "",
          };
        });

        setResults(list);
        setIsOpen(true);
      })
      .catch(() => {
        if (!alive || myReqId !== reqIdRef.current) return;
        setResults([]);
      });

    return () => {
      alive = false;
    };
  }, [debouncedTerm]);

  return (
    <div ref={rootRef} className="relative space-y-2">
      <div className="text-xs font-black text-zinc-500 uppercase tracking-widest">{label}</div>

      <input
        type="text"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setIsOpen(false);
        }}
        onFocus={(e) => {
          setIsOpen(true);
          e.currentTarget.scrollIntoView({ block: "center", behavior: "smooth" });
        }}
        placeholder="Type to search residents…"
        className="w-full h-14 px-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-lg text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-600 outline-none"
      />

      {isOpen && results.length > 0 && (
        <ul className="absolute z-50 w-full bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl max-h-60 overflow-y-auto mt-2">
          {results.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                className="w-full text-left px-4 py-4 min-h-[70px] hover:bg-zinc-900 border-b border-zinc-800/60 last:border-0 transition-colors"
                onClick={() => {
                  setTerm(r.name);
                  setIsOpen(false);
                  onSelect(r);
                }}
              >
                <div className="font-black text-lg text-zinc-100">{r.name}</div>
                {r.address && <div className="text-sm text-zinc-500">{r.address}</div>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function NewCaseModal({ onClose }: { onClose: () => void }) {
  useViewportRecenterOnKeyboard();

  const { setGlobalSearch } = useTerminalUI();
  const { saveDraft, loadDraft, clearDraft, addToQueue, removeFromQueue } = useBlotterData();

  const [loading, setLoading] = React.useState(false);

  const [narrative, setNarrative] = React.useState("");

  const [compType, setCompType] = React.useState<ParticipantType>("RESIDENT");
  const [compResId, setCompResId] = React.useState("");
  const [compDisplay, setCompDisplay] = React.useState("");
  const [compSnap, setCompSnap] = React.useState({ name: "", address: "", contact: "" });

  const [respType, setRespType] = React.useState<ParticipantType>("RESIDENT");
  const [respResId, setRespResId] = React.useState("");
  const [respDisplay, setRespDisplay] = React.useState("");
  const [respSnap, setRespSnap] = React.useState({ name: "", address: "", contact: "" });

  // load draft on mount (resume behavior)
  React.useEffect(() => {
    const d: any = loadDraft();
    if (!d) return;

    setNarrative(d.narrative || "");

    setCompType(d.compType || "RESIDENT");
    setCompResId(d.compResId || "");
    setCompDisplay(d.compDisplay || "");
    setCompSnap(d.compSnap || { name: "", address: "", contact: "" });

    setRespType(d.respType || "RESIDENT");
    setRespResId(d.respResId || "");
    setRespDisplay(d.respDisplay || "");
    setRespSnap(d.respSnap || { name: "", address: "", contact: "" });
  }, []);

  // draft autosave (debounced)
  React.useEffect(() => {
    const t = window.setTimeout(() => {
      saveDraft({
        narrative,
        compType,
        compResId,
        compDisplay,
        compSnap,
        respType,
        respResId,
        respDisplay,
        respSnap,
      });
    }, 600);

    return () => window.clearTimeout(t);
  }, [narrative, compType, compResId, compDisplay, compSnap, respType, respResId, respDisplay, respSnap]);

  const isValid = React.useMemo(() => {
    if (!narrative.trim()) return false;

    if (compType === "RESIDENT" && (!compResId || !compDisplay)) return false;
    if (compType === "NON_RESIDENT" && !compSnap.name.trim()) return false;
    if (compType === "UNKNOWN") return false; // complainant must be known

    if (respType === "RESIDENT" && (!respResId || !respDisplay)) return false;
    if (respType === "NON_RESIDENT" && !respSnap.name.trim()) return false;

    return true;
  }, [narrative, compType, compResId, compDisplay, compSnap.name, respType, respResId, respDisplay, respSnap.name]);

  const renderNonResInputs = (
    snap: { name: string; address: string; contact: string },
    setSnap: React.Dispatch<React.SetStateAction<{ name: string; address: string; contact: string }>>
  ) => (
    <div className="space-y-3 mt-2">
      <input
        className="w-full h-14 px-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-lg text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-600 outline-none"
        placeholder="Full Name (Required)"
        value={snap.name}
        onChange={(e) => setSnap((p) => ({ ...p, name: e.target.value }))}
      />
      <input
        className="w-full h-14 px-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-lg text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-600 outline-none"
        placeholder="Address (Optional)"
        value={snap.address}
        onChange={(e) => setSnap((p) => ({ ...p, address: e.target.value }))}
      />
      <input
        className="w-full h-14 px-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-lg text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-600 outline-none"
        placeholder="Contact # (Optional)"
        value={snap.contact}
        onChange={(e) => setSnap((p) => ({ ...p, contact: e.target.value }))}
      />
    </div>
  );

  const resetComp = (t: ParticipantType) => {
    setCompType(t);
    setCompResId("");
    setCompDisplay("");
    setCompSnap({ name: "", address: "", contact: "" });
  };

  const resetResp = (t: ParticipantType) => {
    setRespType(t);
    setRespResId("");
    setRespDisplay("");
    setRespSnap({ name: "", address: "", contact: "" });
  };

  const handleSubmit = async () => {
    if (!isValid) return;

    setLoading(true);
    try {
      const complainant: Participant =
        compType === "RESIDENT"
          ? { type: "RESIDENT", residentId: compResId }
          : { type: "NON_RESIDENT", snapshot: { name: compSnap.name.trim(), address: compSnap.address.trim() || undefined, contact: compSnap.contact.trim() || undefined } };

      const respondent: Participant =
        respType === "UNKNOWN"
          ? { type: "UNKNOWN" }
          : respType === "RESIDENT"
          ? { type: "RESIDENT", residentId: respResId }
          : { type: "NON_RESIDENT", snapshot: { name: respSnap.name.trim(), address: respSnap.address.trim() || undefined, contact: respSnap.contact.trim() || undefined } };

      const participantsDisplay = {
        complainant: compType === "RESIDENT" ? compDisplay : compSnap.name.trim(),
        respondent:
          respType === "RESIDENT"
            ? respDisplay
            : respType === "NON_RESIDENT"
            ? respSnap.name.trim()
            : "Unknown Individual",
      };

      // queue-first with dedupe removal if online succeeds
      const clientId = addToQueue({
        status: "NEW",
        narrative: narrative.trim(),
        participants: { complainant, respondent },
        participantsDisplay,
        hearingAt: null,
      });

      try {
        await addDoc(collection(db, "blotters"), {
          status: "NEW",
          narrative: narrative.trim(),
          participants: { complainant, respondent },
          participantsDisplay,
          hearingAt: null,
          createdAt: serverTimestamp(),
          lastUpdated: serverTimestamp(),
        });

        // remove queued duplicate if write succeeded
        if (clientId) removeFromQueue(clientId);
      } catch {
        // offline: keep queue item
      }

      clearDraft();
      setGlobalSearch(""); // reset global search after creating
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950 text-zinc-100 flex flex-col h-[100svh]">
      <header className="h-16 border-b border-zinc-800 px-4 flex items-center justify-between">
        <h1 className="font-black text-xl">New Blotter Case</h1>
        <button onClick={onClose} className="h-10 px-4 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-200 font-black active:scale-95 transition-transform">
          CLOSE
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Complainant */}
        <section className="space-y-3">
          <div className="text-xs font-black text-zinc-500 uppercase tracking-widest">Complainant</div>
          <div className="flex gap-2 p-1 bg-zinc-900/40 border border-zinc-800 rounded-2xl">
            <button
              type="button"
              onClick={() => resetComp("RESIDENT")}
              className={["flex-1 h-12 rounded-xl font-black text-sm", compType === "RESIDENT" ? "bg-zinc-100 text-zinc-950" : "text-zinc-400 hover:text-zinc-200"].join(" ")}
            >
              Resident
            </button>
            <button
              type="button"
              onClick={() => resetComp("NON_RESIDENT")}
              className={["flex-1 h-12 rounded-xl font-black text-sm", compType === "NON_RESIDENT" ? "bg-zinc-100 text-zinc-950" : "text-zinc-400 hover:text-zinc-200"].join(" ")}
            >
              Outsider
            </button>
          </div>

          {compType === "RESIDENT" ? (
            <ResidentLookupInput
              label="Search Complainant"
              onSelect={(r) => {
                setCompResId(r.id);
                setCompDisplay(r.name);
              }}
            />
          ) : (
            renderNonResInputs(compSnap, setCompSnap)
          )}
        </section>

        <hr className="border-zinc-800" />

        {/* Respondent */}
        <section className="space-y-3">
          <div className="text-xs font-black text-zinc-500 uppercase tracking-widest">Respondent</div>

          <div className="flex gap-2 p-1 bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-x-auto no-scrollbar">
            {(["RESIDENT", "NON_RESIDENT", "UNKNOWN"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => resetResp(t)}
                className={["flex-1 min-w-[110px] h-12 rounded-xl font-black text-sm whitespace-nowrap", respType === t ? "bg-zinc-100 text-zinc-950" : "text-zinc-400 hover:text-zinc-200"].join(" ")}
              >
                {t === "NON_RESIDENT" ? "Outsider" : t}
              </button>
            ))}
          </div>

          {respType === "UNKNOWN" ? (
            <div className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-2xl text-zinc-400 italic">
              Identity unknown at this time.
            </div>
          ) : respType === "RESIDENT" ? (
            <ResidentLookupInput
              label="Search Respondent"
              onSelect={(r) => {
                setRespResId(r.id);
                setRespDisplay(r.name);
              }}
            />
          ) : (
            renderNonResInputs(respSnap, setRespSnap)
          )}
        </section>

        <hr className="border-zinc-800" />

        {/* Narrative */}
        <section className="space-y-2">
          <div className="text-xs font-black text-zinc-500 uppercase tracking-widest">Narrative</div>
          <textarea
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 h-32 text-lg text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-600 outline-none"
            placeholder="What happened?"
            value={narrative}
            onChange={(e) => setNarrative(e.target.value)}
          />
        </section>
      </main>

      <footer className="p-4 border-t border-zinc-800 bg-zinc-950">
        <button
          disabled={loading || !isValid}
          onClick={handleSubmit}
          className="w-full h-14 bg-zinc-100 hover:bg-white disabled:bg-zinc-900 disabled:text-zinc-600 text-zinc-950 font-black rounded-2xl active:scale-[0.98] transition-transform"
        >
          {loading ? "SAVING…" : "SAVE CASE"}
        </button>
      </footer>
    </div>
  );
}

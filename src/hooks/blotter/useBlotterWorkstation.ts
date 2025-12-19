import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { db, BlotterLocal } from "@/lib/bosDb";
import { toTokens } from "@/lib/bos/searchTokens";
import { loadDraft, saveDraft, clearDraft } from "@/lib/bos/localDraft";
import { useSettings } from "@/hooks/useSettings";
import { buildBlotterPrintHTML } from "@/lib/blotter/templates";

type Mode = "list" | "form";
type Banner = { kind: "ok" | "error"; msg: string } | null;

type Draft = {
  id?: string;
  incidentDateISO: string; // yyyy-mm-dd
  locationText: string;
  complainantName: string;
  complainantContact: string;
  respondentName: string;
  respondentContact: string;
  narrative: string;
  actionsTaken: string;
  settlement: string;
  notes: string;
  status?: "Pending" | "Resolved";
};

const DRAFT_KEY = "draft:blotter:workstation";

function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function todayISO() {
  const d = new Date();
  const pad = (n:number)=>String(n).padStart(2,"0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}

function upper(s: string) {
  return (s ?? "").trim().toUpperCase();
}

export function useBlotterWorkstation() {
  const settings = useSettings();

  const [mode, setMode] = useState<Mode>("list");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<BlotterLocal[]>([]);
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<Banner>(null);
  const [busy, setBusy] = useState(false);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [more, setMore] = useState(false);

  const [draft, setDraft] = useState<Draft>(() => {
    return loadDraft<Draft>(DRAFT_KEY) ?? {
      incidentDateISO: todayISO(),
      locationText: "",
      complainantName: "",
      complainantContact: "",
      respondentName: "",
      respondentContact: "",
      narrative: "",
      actionsTaken: "",
      settlement: "",
      notes: "",
      status: "Pending",
    };
  });

  useEffect(() => { saveDraft(DRAFT_KEY, draft); }, [draft]);

  const fetchList = useCallback(async (qRaw: string) => {
    setLoading(true);
    try {
      const q = upper(qRaw);
      if (!q) {
        const list = await db.blotters.orderBy("updatedAtISO").reverse().limit(100).toArray();
        setItems(list);
        return;
      }
      const first = q.split(/\s+/)[0];
      const hits = await db.blotters.where("searchTokens").equals(first).toArray();
      const refined = hits.filter((b) => {
        const hay = [
          upper(b.complainantName),
          upper(b.respondentName),
          upper(b.locationText),
          upper(b.narrative),
          b.id,
          b.status
        ].join(" ");
        return hay.includes(q);
      });
      refined.sort((a, b) => (a.updatedAtISO > b.updatedAtISO ? -1 : 1));
      setItems(refined);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchList(query); }, [query, fetchList]);

  const reload = useCallback(() => fetchList(query), [fetchList, query]);

  const newBlotter = useCallback(() => {
    setSelectedId(null);
    setMore(false);
    setBanner(null);
    setDraft({
      incidentDateISO: todayISO(),
      locationText: "",
      complainantName: "",
      complainantContact: "",
      respondentName: "",
      respondentContact: "",
      narrative: "",
      actionsTaken: "",
      settlement: "",
      notes: "",
      status: "Pending",
    });
    setMode("form");
  }, []);

  const editBlotter = useCallback(async (id: string) => {
    const b = await db.blotters.get(id);
    if (!b) return;
    setSelectedId(id);
    setMore(false);
    setBanner(null);
    setDraft({
      id: b.id,
      incidentDateISO: b.incidentDateISO.slice(0,10),
      locationText: b.locationText,
      complainantName: b.complainantName,
      complainantContact: b.complainantContact ?? "",
      respondentName: b.respondentName,
      respondentContact: b.respondentContact ?? "",
      narrative: b.narrative,
      actionsTaken: b.actionsTaken ?? "",
      settlement: b.settlement ?? "",
      notes: b.notes ?? "",
      status: b.status,
    });
    setMode("form");
  }, []);

  const backToList = useCallback(() => {
    setMode("list");
    setBanner(null);
  }, []);

  const validate = useCallback((d: Draft) => {
    if (!d.incidentDateISO) throw new Error("Incident date is required.");
    if (!d.locationText.trim()) throw new Error("Location is required.");
    if (!d.complainantName.trim()) throw new Error("Complainant name is required.");
    if (!d.respondentName.trim()) throw new Error("Respondent name is required.");
    if (!d.narrative.trim()) throw new Error("Narrative is required.");
  }, []);

  const save = useCallback(async (enqueue: (job: { type: string; payload: any }) => Promise<void>) => {
    setBusy(true);
    setBanner(null);
    try {
      validate(draft);
      const nowISO = new Date().toISOString();
      const id = draft.id ?? uuid();

      const rec: BlotterLocal = {
        id,
        status: (draft.status ?? "Pending") as any,
        incidentDateISO: new Date(draft.incidentDateISO).toISOString(),
        locationText: draft.locationText.trim(),
        complainantName: draft.complainantName.trim(),
        complainantContact: draft.complainantContact.trim() || undefined,
        respondentName: draft.respondentName.trim(),
        respondentContact: draft.respondentContact.trim() || undefined,
        narrative: draft.narrative.trim(),
        actionsTaken: draft.actionsTaken.trim() || undefined,
        settlement: draft.settlement.trim() || undefined,
        notes: draft.notes.trim() || undefined,
        createdAtISO: (await db.blotters.get(id))?.createdAtISO ?? nowISO,
        updatedAtISO: nowISO,
        searchTokens: toTokens([
          id,
          upper(draft.locationText),
          upper(draft.complainantName),
          upper(draft.respondentName),
          upper(draft.narrative),
          upper(draft.actionsTaken),
          upper(draft.settlement),
          upper(draft.notes),
          draft.status ?? "Pending",
        ].join(" ")),
      };

      await db.blotters.put(rec);

      // audit
      await db.audit_queue.add({
        eventType: draft.id ? "BLOTTER_UPDATED" : "BLOTTER_CREATED",
        details: { id: rec.id, status: rec.status },
        occurredAtISO: nowISO,
        synced: 0,
      });

      // sync
      await enqueue({ type: "BLOTTER_UPSERT", payload: rec });

      clearDraft(DRAFT_KEY);
      setBanner({ kind: "ok", msg: "Saved & queued ✅" });
      setMode("list");
      return { ok: true as const, id: rec.id };
    } catch (e: any) {
      const msg = e?.message ?? String(e);
      setBanner({ kind: "error", msg });
      return { ok: false as const, error: msg };
    } finally {
      setBusy(false);
    }
  }, [draft, validate]);

  const resolve = useCallback(async (enqueue: (job: { type: string; payload: any }) => Promise<void>) => {
    if (!draft.id) return;
    setBusy(true);
    setBanner(null);
    try {
      const nowISO = new Date().toISOString();
      const b = await db.blotters.get(draft.id);
      if (!b) throw new Error("Record not found.");

      const updated: BlotterLocal = { ...b, status: "Resolved", updatedAtISO: nowISO };
      await db.blotters.put(updated);

      await db.audit_queue.add({
        eventType: "BLOTTER_RESOLVED",
        details: { id: updated.id },
        occurredAtISO: nowISO,
        synced: 0,
      });

      await enqueue({ type: "BLOTTER_UPSERT", payload: updated });

      setDraft((d) => ({ ...d, status: "Resolved" }));
      setBanner({ kind: "ok", msg: "Marked as Resolved ✅" });
      setMode("list");
      return { ok: true as const };
    } catch (e: any) {
      setBanner({ kind: "error", msg: e?.message ?? String(e) });
      return { ok: false as const };
    } finally {
      setBusy(false);
    }
  }, [draft.id]);

  const buildPrintHTML = useCallback(async () => {
    if (!draft.id) throw new Error("Save the record first before printing.");
    const b = await db.blotters.get(draft.id);
    if (!b) throw new Error("Record not found.");
    return buildBlotterPrintHTML({
      b,
      barangayName: settings.barangayName,
      municipalityCity: settings.municipalityCity,
      province: settings.province,
      issuedByName: settings.issuedByName,
    });
  }, [draft.id, settings]);

  return {
    mode, setMode,
    query, setQuery,
    items, loading,
    banner, setBanner,
    busy,
    selectedId,
    draft, setDraft,
    more, setMore,
    reload,
    newBlotter,
    editBlotter,
    backToList,
    save,
    resolve,
    buildPrintHTML,
  };
}

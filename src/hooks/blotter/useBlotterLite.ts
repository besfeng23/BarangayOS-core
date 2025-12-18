"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { db, BlotterLocal } from "@/lib/bosDb";
import { toTokens } from "@/lib/bos/searchTokens";
import { loadDraft, saveDraft, clearDraft } from "@/lib/bos/localDraft";

type Draft = {
  id?: string;
  incidentDate: string;     // YYYY-MM-DD (input-friendly)
  locationText: string;
  complainantName: string;
  respondentName: string;
  narrative: string;
  status: "Pending" | "Resolved";

  // optional
  complainantContact?: string;
  respondentContact?: string;
  actionsTaken?: string;
  settlement?: string;
  notes?: string;
};

const DRAFT_KEY = "draft:blotter:lite";

function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function todayYMD() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function defaultDraft(): Draft {
  return {
    incidentDate: todayYMD(),
    locationText: "",
    complainantName: "",
    respondentName: "",
    narrative: "",
    status: "Pending",
    complainantContact: "",
    respondentContact: "",
    actionsTaken: "",
    settlement: "",
    notes: "",
  };
}

export function useBlotterLite() {
  const [view, setView] = useState<"list" | "form">("list");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<BlotterLocal[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [draft, setDraft] = useState<Draft>(() => loadDraft<Draft>(DRAFT_KEY) ?? defaultDraft());
  const [moreOpen, setMoreOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<{ kind: "ok" | "error"; msg: string } | null>(null);

  useEffect(() => { saveDraft(DRAFT_KEY, draft); }, [draft]);

  const reload = useCallback(async () => {
    const q = query.trim().toUpperCase();
    let list: BlotterLocal[] = [];

    if (!q) {
      list = await db.blotters.orderBy("updatedAtISO").reverse().limit(200).toArray();
    } else {
      const token = q.split(/\s+/)[0];
      const hits = await db.blotters.where("searchTokens").equals(token).toArray();
      list = hits.filter((b) => {
        const hay = [b.complainantName, b.respondentName, b.locationText, b.narrative, b.id].join(" ").toUpperCase();
        return hay.includes(q);
      });
    }

    setItems(list);
  }, [query]);

  useEffect(() => { reload(); }, [reload]);

  const newRecord = useCallback(() => {
    setSelectedId(null);
    setDraft(defaultDraft());
    setMoreOpen(false);
    setBanner(null);
    setView("form");
  }, []);

  const openRecord = useCallback(async (id: string) => {
    const b = await db.blotters.get(id);
    if (!b) return;

    setSelectedId(id);
    setDraft({
      id: b.id,
      incidentDate: b.incidentDateISO.slice(0, 10),
      locationText: b.locationText,
      complainantName: b.complainantName,
      respondentName: b.respondentName,
      narrative: b.narrative,
      status: b.status,

      complainantContact: b.complainantContact ?? "",
      respondentContact: b.respondentContact ?? "",
      actionsTaken: b.actionsTaken ?? "",
      settlement: b.settlement ?? "",
      notes: b.notes ?? "",
    });
    setMoreOpen(false);
    setBanner(null);
    setView("form");
  }, []);

  const backToList = useCallback(() => {
    setBanner(null);
    setView("list");
  }, []);

  const validate = useCallback((d: Draft) => {
    if (!d.incidentDate) throw new Error("Incident date is required.");
    if (!d.locationText.trim()) throw new Error("Location is required.");
    if (!d.complainantName.trim()) throw new Error("Complainant name is required.");
    if (!d.respondentName.trim()) throw new Error("Respondent name is required.");
    if (!d.narrative.trim()) throw new Error("Narrative is required.");
  }, []);

  const save = useCallback(async (enqueue: (job: { type: string; payload: any }) => Promise<void>) => {
    setLoading(true);
    setBanner(null);

    try {
      validate(draft);

      const nowISO = new Date().toISOString();
      const id = draft.id ?? uuid();
      const incidentDateISO = new Date(draft.incidentDate + "T00:00:00").toISOString();

      const tokenSource = [
        id,
        draft.complainantName,
        draft.respondentName,
        draft.locationText,
        draft.narrative,
        draft.status,
      ].join(" ");

      const existing = await db.blotters.get(id);

      const rec: BlotterLocal = {
        id,
        createdAtISO: existing?.createdAtISO ?? nowISO,
        updatedAtISO: nowISO,
        status: draft.status,

        incidentDateISO,
        locationText: draft.locationText.trim(),
        complainantName: draft.complainantName.trim(),
        respondentName: draft.respondentName.trim(),
        narrative: draft.narrative.trim(),

        complainantContact: draft.complainantContact?.trim() || undefined,
        respondentContact: draft.respondentContact?.trim() || undefined,
        actionsTaken: draft.actionsTaken?.trim() || undefined,
        settlement: draft.settlement?.trim() || undefined,
        notes: draft.notes?.trim() || undefined,

        searchTokens: toTokens(tokenSource),
      };

      // 1) local-first write
      await db.blotters.put(rec);

      // 2) queue-first sync job
      await enqueue({
        type: existing ? "BLOTTER_UPDATE" : "BLOTTER_CREATE",
        payload: rec,
      });

      // 3) local audit
      await db.audit_queue.add({
        eventType: existing ? "BLOTTER_UPDATED" : "BLOTTER_CREATED",
        details: { id: rec.id, status: rec.status },
        occurredAtISO: new Date().toISOString(),
        synced: 0,
      });

      // 4) clear draft only after success
      clearDraft(DRAFT_KEY);
      setSelectedId(rec.id);
      setDraft((d) => ({ ...d, id: rec.id }));
      setBanner({ kind: "ok", msg: "Saved & queued ✅" });

      await reload();
      setView("list");
      return { ok: true as const, id: rec.id };
    } catch (e: any) {
      const msg = e?.message ?? String(e);
      setBanner({ kind: "error", msg });
      console.error("Blotter save failed:", e);
      await db.audit_queue.add({
        eventType: "BLOTTER_ERROR",
        details: { msg },
        occurredAtISO: new Date().toISOString(),
        synced: 0,
      });
      return { ok: false as const, error: msg };
    } finally {
      setLoading(false);
    }
  }, [draft, reload, validate]);

  const listSubtitle = useCallback((b: BlotterLocal) => {
    return `${b.status} • ${b.locationText}`;
  }, []);

  const hasDraft = useMemo(() => {
    return Boolean(
      draft.locationText.trim() ||
      draft.complainantName.trim() ||
      draft.respondentName.trim() ||
      draft.narrative.trim()
    );
  }, [draft]);

  return {
    view, setView,
    query, setQuery,
    items,
    selectedId,
    draft, setDraft,
    moreOpen, setMoreOpen,
    loading,
    banner,
    hasDraft,

    reload,
    newRecord,
    openRecord,
    backToList,
    save,
    listSubtitle,
  };
}

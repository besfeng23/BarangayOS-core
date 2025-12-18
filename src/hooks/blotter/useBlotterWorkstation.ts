import { useCallback, useEffect, useMemo, useState } from "react";
import { db, BlotterLocal } from "@/lib/bosDb";
import { toTokens } from "@/lib/bos/searchTokens";
import { loadDraft, saveDraft, clearDraft } from "@/lib/bos/localDraft";

export type BlotterDraft = {
  id?: string; // when editing existing
  incidentDateISO: string;
  incidentTimeText?: string;
  locationText: string;

  complainantName: string;
  complainantContact?: string;
  respondentName: string;
  respondentContact?: string;

  narrative: string;
  actionsTaken?: string;
  settlement?: string;
  notes?: string;

  status: "Pending" | "Resolved";
  tagsText?: string; // comma-separated
};

function defaultDraft(): BlotterDraft {
  const today = new Date();
  const iso = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
  return {
    incidentDateISO: iso,
    incidentTimeText: "",
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
    tagsText: "",
  };
}

function uuid() {
  // small uuid v4-ish; ok for local IDs
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function useBlotterWorkstation(draftKey = "draft:blotter:new") {
  const [draft, setDraft] = useState<BlotterDraft>(() => loadDraft<BlotterDraft>(draftKey) ?? defaultDraft());
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Pending" | "Resolved">("All");
  const [items, setItems] = useState<BlotterLocal[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<{ kind: "error" | "ok"; msg: string } | null>(null);

  // autosave draft
  useEffect(() => { saveDraft(draftKey, draft); }, [draftKey, draft]);

  // live load list (simple polling-free: fetch on change triggers)
  const reload = useCallback(async () => {
    const q = query.trim().toUpperCase();
    let list: BlotterLocal[] = [];
    if (!q) {
      list = await db.blotters.orderBy("updatedAtISO").reverse().limit(200).toArray();
    } else {
      // IndexedDB token search: equals on token then de-dupe
      const token = q.split(/\s+/)[0];
      const hits = await db.blotters.where("searchTokens").equals(token).toArray();
      // further filter in-memory by substring match for safety
      list = hits.filter((b) => {
        const hay = [
          b.complainantName,
          b.respondentName,
          b.locationText,
          b.narrative,
          b.id,
        ].join(" ").toUpperCase();
        return hay.includes(q);
      });
    }
    if (statusFilter !== "All") list = list.filter((b) => b.status === statusFilter);
    setItems(list);
  }, [query, statusFilter]);

  useEffect(() => { reload(); }, [reload]);

  const hasDraft = useMemo(() => {
    // quick heuristic: any meaningful field filled
    return Boolean(
      draft.locationText.trim() ||
      draft.complainantName.trim() ||
      draft.respondentName.trim() ||
      draft.narrative.trim()
    );
  }, [draft]);

  const startNew = useCallback(() => {
    setSelectedId(null);
    setDraft(defaultDraft());
    clearDraft(draftKey);
    setBanner(null);
  }, [draftKey]);

  const loadExisting = useCallback(async (id: string) => {
    const b = await db.blotters.get(id);
    if (!b) return;
    setSelectedId(id);
    setDraft({
      id: b.id,
      incidentDateISO: b.incidentDateISO,
      incidentTimeText: b.incidentTimeText ?? "",
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
      tagsText: (b.tags ?? []).join(", "),
    });
    setBanner(null);
  }, []);

  const validate = useCallback((d: BlotterDraft) => {
    if (!d.locationText.trim()) throw new Error("Location is required.");
    if (!d.complainantName.trim()) throw new Error("Complainant name is required.");
    if (!d.respondentName.trim()) throw new Error("Respondent name is required.");
    if (!d.narrative.trim()) throw new Error("Narrative is required.");
    if (!d.incidentDateISO) throw new Error("Incident date is required.");
  }, []);

  const buildLocalRecord = useCallback((d: BlotterDraft) => {
    const nowISO = new Date().toISOString();
    const id = d.id ?? uuid();
    const tags = (d.tagsText ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const tokenSource = [
      id,
      d.locationText,
      d.complainantName,
      d.respondentName,
      d.narrative,
      tags.join(" "),
      d.status,
    ].join(" ");

    const rec: BlotterLocal = {
      id,
      createdAtISO: d.id ? nowISO : nowISO,
      updatedAtISO: nowISO,
      status: d.status,
      incidentDateISO: d.incidentDateISO,
      incidentTimeText: d.incidentTimeText?.trim() || undefined,
      locationText: d.locationText.trim(),

      complainantName: d.complainantName.trim(),
      complainantContact: d.complainantContact?.trim() || undefined,
      respondentName: d.respondentName.trim(),
      respondentContact: d.respondentContact?.trim() || undefined,

      narrative: d.narrative.trim(),
      actionsTaken: d.actionsTaken?.trim() || undefined,
      settlement: d.settlement?.trim() || undefined,
      notes: d.notes?.trim() || undefined,

      tags: tags.length ? tags : undefined,
      searchTokens: toTokens(tokenSource),
    };
    return rec;
  }, []);

  const saveLocalAndQueue = useCallback(async (enqueue: (job: { type: string; payload: any }) => Promise<void>) => {
    setLoading(true);
    setBanner(null);
    try {
      validate(draft);
      const rec = buildLocalRecord(draft);

      // 1) local upsert first (offline-safe)
      const existing = await db.blotters.get(rec.id);
      await db.blotters.put({
        ...rec,
        createdAtISO: existing?.createdAtISO ?? rec.createdAtISO,
      });

      // 2) enqueue sync (queue-first)
      await enqueue({
        type: existing ? "BLOTTER_UPDATE" : "BLOTTER_CREATE",
        payload: rec,
      });

      // 3) audit locally
      await db.audit_queue.add({
        eventType: existing ? "BLOTTER_UPDATED" : "BLOTTER_CREATED",
        details: { id: rec.id, status: rec.status },
        occurredAtISO: new Date().toISOString(),
        synced: 0,
      });

      clearDraft(draftKey);
      setSelectedId(rec.id);
      setDraft((d) => ({ ...d, id: rec.id }));
      setBanner({ kind: "ok", msg: existing ? "Saved & queued ✅" : "Created & queued ✅" });
      await reload();
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
  }, [draft, draftKey, reload, validate, buildLocalRecord]);

  return {
    draft, setDraft,
    query, setQuery,
    statusFilter, setStatusFilter,
    items,
    selectedId,
    loading,
    banner,
    hasDraft,
    startNew,
    loadExisting,
    saveLocalAndQueue,
    reload,
  };
}

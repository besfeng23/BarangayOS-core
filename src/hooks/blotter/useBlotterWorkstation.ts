

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { db, BlotterLocal } from "@/lib/bosDb";
import { toTokens } from "@/lib/bos/searchTokens";
import { loadDraft, saveDraft, clearDraft } from "@/lib/bos/localDraft";
import { buildBlotterPrintHTML } from "@/lib/blotter/templates";
import { writeActivity } from "@/lib/bos/activity/writeActivity";
import { enqueuePrintJob } from "@/lib/bos/print/enqueuePrintJob";
import { performPrintJob } from "@/lib/bos/print/performPrintJob";
import type { ResidentPickerValue } from "@/components/shared/ResidentPicker";
import { getManilaDate } from "@/lib/date";
import { blotterSchema } from "@/lib/validation/schemas";

type Mode = "list" | "form";
type Banner = { kind: "ok" | "error"; msg: string } | null;

type Draft = {
  id?: string;
  incidentDateISO: string; // yyyy-mm-dd
  locationText: string;
  complainant: ResidentPickerValue;
  respondent: ResidentPickerValue;
  narrative: string;
  actionsTaken: string;
  settlement: string;
  notes: string;
  status?: "Pending" | "Resolved";
};
type DraftErrors = Partial<Record<keyof Draft, string>>;

const DRAFT_KEY = "draft:blotter:workstation";

function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const defaultPickerValue: ResidentPickerValue = { mode: "resident", residentId: null, residentNameSnapshot: "", manualName: "" };

function upper(s: string) {
  return (s ?? "").trim().toUpperCase();
}

function getPartyName(party: ResidentPickerValue | undefined) {
  if (!party) return "";
  if (party.mode === 'resident' && party.residentNameSnapshot) {
    return party.residentNameSnapshot;
  }
  // For blotter, we now forbid manual entry for submission, but the type allows it.
  // This will return "" if manual mode is somehow selected without a name.
  return party.manualName || "";
}

export function useBlotterWorkstation() {
  const [mode, setMode] = useState<Mode>("list");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<BlotterLocal[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [banner, setBanner] = useState<Banner>(null);
  const [fieldErrors, setFieldErrors] = useState<DraftErrors>({});

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [more, setMore] = useState(false);

  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);

  const [draft, setDraft] = useState<Draft>(() => {
    const saved = loadDraft<Draft>(DRAFT_KEY);
    if (saved) return saved;
    return {
      incidentDateISO: getManilaDate(),
      locationText: "",
      complainant: defaultPickerValue,
      respondent: defaultPickerValue,
      narrative: "",
      actionsTaken: "",
      settlement: "",
      notes: "",
      status: "Pending",
    };
  });

  useEffect(() => { saveDraft(DRAFT_KEY, draft); }, [draft]);

  const canSave = useMemo(() => {
    if (!draft.incidentDateISO) return false;
    if (!draft.locationText.trim()) return false;
    if (draft.complainant.mode !== 'resident' || !draft.complainant.residentId) return false;
    if (draft.respondent.mode !== 'resident' || !draft.respondent.residentId) return false;
    if (!getPartyName(draft.complainant)) return false;
    if (!getPartyName(draft.respondent)) return false;
    if (!draft.narrative.trim()) return false;
    return true;
  }, [draft]);

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
      incidentDateISO: getManilaDate(),
      locationText: "",
      complainant: defaultPickerValue,
      respondent: defaultPickerValue,
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
      complainant: b.complainant || { mode: 'manual', manualName: b.complainantName },
      respondent: b.respondent || { mode: 'manual', manualName: b.respondentName },
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
    const parsed = blotterSchema.safeParse(d);
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      setFieldErrors({
        incidentDateISO: flat.incidentDateISO?.[0],
        locationText: flat.locationText?.[0],
        complainant: flat.complainant?.[0],
        respondent: flat.respondent?.[0],
        narrative: flat.narrative?.[0],
      });
      throw new Error("Kailangan kumpletuhin ang mga required fields.");
    }
    setFieldErrors({});
    return parsed.data;
  }, []);

  const save = useCallback(async (enqueue: (job: { type: string; payload: any }) => Promise<void>) => {
    setBusy(true);
    setBanner(null);
    try {
      const parsed = validate(draft);
      const nowISO = new Date().toISOString();
      const id = draft.id ?? uuid();

      const complainantName = getPartyName(parsed.complainant);
      const respondentName = getPartyName(parsed.respondent);

      const rec: BlotterLocal = {
        id,
        status: (parsed.status ?? "Pending") as any,
        incidentDateISO: new Date(parsed.incidentDateISO).toISOString(),
        locationText: parsed.locationText.trim(),
        complainantName,
        respondentName,
        complainant: parsed.complainant,
        respondent: parsed.respondent,
        narrative: parsed.narrative.trim(),
        actionsTaken: (parsed.actionsTaken || "").trim() || undefined,
        settlement: (parsed.settlement || "").trim() || undefined,
        notes: (parsed.notes || "").trim() || undefined,
        createdAtISO: (await db.blotters.get(id))?.createdAtISO ?? nowISO,
        updatedAtISO: nowISO,
        searchTokens: toTokens([
          id,
          upper(parsed.locationText),
          upper(complainantName),
          upper(respondentName),
          upper(parsed.narrative),
          upper(parsed.actionsTaken || ""),
          upper(parsed.settlement || ""),
          upper(parsed.notes || ""),
          parsed.status ?? "Pending",
        ].join(" ")),
      };

      await db.blotters.put(rec);

      await writeActivity({
        type: draft.id ? "BLOTTER_UPDATED" : "BLOTTER_CREATED",
        entityType: "blotter",
        entityId: rec.id,
        status: "ok",
        title: draft.id ? "Blotter na-update" : "Blotter na-create",
        subtitle: `${rec.complainantName} vs ${rec.respondentName} • ${rec.locationText} • ${rec.status}`,
      });


      // sync
      await enqueue({ type: "BLOTTER_UPSERT", payload: rec });

      clearDraft(DRAFT_KEY);
      setBanner({ kind: "ok", msg: "Nai-save at naka-queue para sa sync ✅" });
      setMode("list");
      reload();
      return { ok: true as const, id: rec.id };
    } catch (e: any) {
      const msg = e?.message ?? String(e);
      setBanner({ kind: "error", msg });
      return { ok: false as const, error: msg };
    } finally {
      setBusy(false);
    }
  }, [draft, validate, reload]);

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

      await writeActivity({
        type: "BLOTTER_RESOLVED",
        entityType: "blotter",
        entityId: updated.id,
        status: "ok",
        title: "Blotter na-resolve",
        subtitle: `${updated.complainantName} vs ${updated.respondentName} • ${updated.locationText}`,
      });

      await enqueue({ type: "BLOTTER_UPSERT", payload: updated });

      setDraft((d) => ({ ...d, status: "Resolved" }));
      setBanner({ kind: "ok", msg: "Minarkahan bilang Resolved ✅" });
      setMode("list");
      reload();
      return { ok: true as const };
    } catch (e: any) {
      setBanner({ kind: "error", msg: e?.message ?? String(e) });
      return { ok: false as const };
    } finally {
      setBusy(false);
    }
  }, [draft.id, reload]);

  const buildAndPrint = useCallback(async () => {
    if (!draft.id) throw new Error("Save the record first before printing.");
    const b = await db.blotters.get(draft.id);
    if (!b) throw new Error("Record not found.");
    
    const html = await buildBlotterPrintHTML(b);

    const printJobId = await enqueuePrintJob({
        entityType: "blotter",
        entityId: b.id,
        docType: "blotter_report",
        title: "Blotter Report",
        subtitle: `${b.complainantName} vs ${b.respondentName}`,
        html
    });

    await performPrintJob(printJobId);

    await writeActivity({
        type: "BLOTTER_PRINTED",
        entityType: "blotter",
        entityId: b.id,
        status: "ok",
        title: "Blotter na-print",
        subtitle: `${b.complainantName} vs ${b.respondentName} • ${b.locationText}`,
    });

  }, [draft.id]);

  const openAiDrawer = useCallback(() => setIsAiDrawerOpen(true), []);
  const closeAiDrawer = useCallback(() => setIsAiDrawerOpen(false), []);
  const handleAiDraft = useCallback((newText: string) => {
    setDraft(d => ({ ...d, narrative: newText }));
  }, []);

  return {
    mode, setMode,
    query, setQuery,
    items, loading,
    banner, setBanner,
    busy,
    canSave,
    selectedId,
    draft, setDraft,
    more, setMore,
    fieldErrors,
    reload,
    newBlotter,
    editBlotter,
    backToList,
    save,
    resolve,
    buildAndPrint,
    isAiDrawerOpen,
    openAiDrawer,
    closeAiDrawer,
    handleAiDraft,
  };
}

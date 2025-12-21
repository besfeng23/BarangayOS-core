
import { useCallback, useEffect, useMemo, useState } from "react";
import { db, ResidentLocal } from "@/lib/bosDb";
import { toTokens } from "@/lib/bos/searchTokens";
import { loadDraft, saveDraft, clearDraft } from "@/lib/bos/localDraft";
import { writeActivity } from "@/lib/bos/activity/writeActivity";

type Draft = {
  id?: string;
  fullName: string;
  householdNo: string;
  addressText: string;
  contact: string;
};

const DRAFT_KEY = "draft:resident:workstation";

function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function upper(s: string) {
  return (s ?? "").trim().toUpperCase();
}

export function useResidentWorkstation() {
  const [mode, setMode] = useState<"list" | "form">("list");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [draft, setDraft] = useState<Draft>(() => {
    return (
      loadDraft<Draft>(DRAFT_KEY) ?? {
        fullName: "",
        householdNo: "",
        addressText: "",
        contact: "",
      }
    );
  });

  const [banner, setBanner] = useState<{ kind: "ok" | "error"; msg: string } | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    saveDraft(DRAFT_KEY, draft);
  }, [draft]);

  const newResident = useCallback(() => {
    setSelectedId(null);
    setDraft({ fullName: "", householdNo: "", addressText: "", contact: "" });
    setBanner(null);
    setMode("form");
  }, []);

  const editResident = useCallback(async (id: string) => {
    const r = await db.residents.get(id);
    if (!r) return;
    setSelectedId(id);
    setDraft({
      id: r.id,
      fullName: r.fullName,
      householdNo: r.householdNo ?? "",
      addressText: r.addressText ?? "",
      contact: r.contact ?? "",
    });
    setBanner(null);
    setMode("form");
  }, []);

  const backToList = useCallback(() => {
    setBanner(null);
    setMode("list");
  }, []);

  const validate = useCallback((d: Draft) => {
    if (!d.fullName.trim()) throw new Error("Full name is required.");
  }, []);

  const save = useCallback(
    async (enqueue: (job: { type: string; payload: any }) => Promise<void>) => {
      setLoading(true);
      setBanner(null);
      try {
        validate(draft);

        const nowISO = new Date().toISOString();
        const id = draft.id ?? uuid();

        const fullName = draft.fullName.trim();
        const fullNameUpper = upper(fullName);
        const householdNo = draft.householdNo.trim() || undefined;
        const householdNoUpper = householdNo ? upper(householdNo) : undefined;

        const tokenSource = [
          id,
          fullNameUpper,
          householdNoUpper ?? "",
          upper(draft.addressText),
          upper(draft.contact),
        ].join(" ");
        const existing = await db.residents.get(id);

        const rec: ResidentLocal = {
          id,
          fullName,
          fullNameUpper,
          householdNo,
          householdNoUpper,
          addressText: draft.addressText.trim() || undefined,
          contact: draft.contact.trim() || undefined,
          createdAtISO: existing?.createdAtISO ?? nowISO,
          updatedAtISO: nowISO,
          searchTokens: toTokens(tokenSource),
        };

        // 1) local-first
        await db.residents.put(rec);

        // 2) queue-first
        await enqueue({
          type: existing ? "RESIDENT_UPDATE" : "RESIDENT_CREATE",
          payload: rec,
        });

        await writeActivity({
          type: existing ? "RESIDENT_UPDATED" : "RESIDENT_CREATED",
          entityType: "resident",
          entityId: rec.id,
          status: "ok",
          title: existing ? "Resident updated" : "Resident created",
          subtitle: `${rec.fullName} • ${rec.householdNo || 'No Household'}`
        });

        // 3) clear draft after success
        clearDraft(DRAFT_KEY);
        setSelectedId(rec.id);
        setDraft((d) => ({ ...d, id: rec.id }));
        setBanner({ kind: "ok", msg: "Saved & queued ✅" });

        // return to list for Lola flow
        setMode("list");
        return { ok: true as const, id: rec.id };
      } catch (e: any) {
        const msg = e?.message ?? String(e);
        setBanner({ kind: "error", msg });
        console.error("Resident save failed:", e);
        return { ok: false as const, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [draft, validate]
  );

  const canSave = useMemo(() => Boolean(draft.fullName.trim()), [
    draft.fullName,
  ]);

  return {
    mode,
    banner,
    loading,
    draft,
    setDraft,
    selectedId,
    newResident,
    editResident,
    backToList,
    save,
    canSave,
  };
}

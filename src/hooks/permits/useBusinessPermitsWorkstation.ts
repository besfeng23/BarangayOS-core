

import { useCallback, useEffect, useMemo, useState } from "react";
import { db, BusinessLocal, PermitIssuanceLocal } from "@/lib/bosDb";
import { toTokens } from "@/lib/bos/searchTokens";
import { useSettings } from "@/lib/bos/settings/useSettings";
import { buildBusinessPermitHTML } from "@/lib/permits/templates";
import { writeActivity } from "@/lib/bos/activity/writeActivity";
import { enqueuePrintJob } from "@/lib/bos/print/enqueuePrintJob";
import { performPrintJob } from "@/lib/bos/print/performPrintJob";
import type { ResidentPickerValue } from "@/components/shared/ResidentPicker";
import { useLiveQuery } from "dexie-react-hooks";

type Mode = "list" | "businessForm" | "renewForm";
type Banner = { kind: "ok" | "error"; msg: string } | null;

const defaultOwnerValue: ResidentPickerValue = { mode: "resident", residentId: null, residentNameSnapshot: "", manualName: "" };

function getOwnerName(owner: ResidentPickerValue | undefined) {
    if (!owner) return "";
    if (owner.mode === 'resident' && owner.residentNameSnapshot) {
      return owner.residentNameSnapshot;
    }
    return owner.manualName || "";
}


function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function upper(s: string) { return (s ?? "").trim().toUpperCase(); }

function currentYear() { return new Date().getFullYear(); }

function makeControlNo(prefix: string) {
  const d = new Date();
  const pad = (n:number)=>String(n).padStart(2,"0");
  const stamp = `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  const rand = Math.random().toString(16).slice(2, 6).toUpperCase();
  return `${prefix}-${stamp}-${rand}`;
}

export function useBusinessPermitsWorkstation() {
  const { settings } = useSettings();

  const [mode, setMode] = useState<Mode>("list");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [banner, setBanner] = useState<Banner>(null);

  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);

  const [bizDraft, setBizDraft] = useState({
    id: "",
    businessName: "",
    owner: defaultOwnerValue,
    addressText: "",
    category: "",
    contact: "",
    notes: "",
  });

  const [renewDraft, setRenewDraft] = useState({
    year: currentYear(),
    feeAmount: 0,
    orNo: "",
    remarks: "",
  });

  const [printHTML, setPrintHTML] = useState<string | null>(null);
  
  const canSaveBusiness = useMemo(() => {
    if (!bizDraft.businessName.trim()) return false;
    if (!getOwnerName(bizDraft.owner)) return false;
    if (!bizDraft.addressText.trim()) return false;
    return true;
  }, [bizDraft]);

  const canRenew = useMemo(() => {
    const year = Number(renewDraft.year);
    if (!year || year < 2000) return false;
    const fee = Number(renewDraft.feeAmount);
    if (!isFinite(fee) || fee <= 0) return false;
    return true;
  }, [renewDraft]);
  
  const { items, loading } = useLiveQuery(async () => {
      try {
        const q = upper(query);
        if (!q) {
            return await db.businesses.orderBy("updatedAtISO").reverse().limit(150).toArray();
        }
        const first = q.split(/\s+/)[0];
        const hits = await db.businesses.where("searchTokens").equals(first).toArray();
        const refined = hits.filter((b) => {
            const hay = [upper(b.businessName), upper(b.ownerName), upper(b.addressText), upper(b.category ?? ""), b.id, b.status].join(" ");
            return hay.includes(q);
        });
        refined.sort((a, b) => (a.updatedAtISO > b.updatedAtISO ? -1 : 1));
        return refined;
      } finally {
        // setLoading is handled by useLiveQuery
      }
  }, [query], { items: [], loading: true });


  const reload = useCallback(() => {
    // This is now handled automatically by useLiveQuery
    // but we can keep the function as a no-op if needed
  }, []);

  const newBusiness = useCallback(() => {
    setSelectedBusinessId(null);
    setBanner(null);
    setBizDraft({ id: "", businessName: "", owner: defaultOwnerValue, addressText: "", category: "", contact: "", notes: "" });
    setMode("businessForm");
  }, []);

  const openBusiness = useCallback(async (id: string) => {
    const b = await db.businesses.get(id);
    if (!b) return;
    setSelectedBusinessId(id);
    setBanner(null);
    setBizDraft({
      id: b.id,
      businessName: b.businessName,
      owner: b.owner || { mode: 'manual', manualName: b.ownerName, residentId: null },
      addressText: b.addressText,
      category: b.category ?? "",
      contact: b.contact ?? "",
      notes: b.notes ?? "",
    });
    setMode("businessForm");
  }, []);

  const backToList = useCallback(() => {
    setMode("list");
  }, []);

  const validateBiz = useCallback(() => {
    if (!bizDraft.businessName.trim()) throw new Error("Business name is required.");
    if (!getOwnerName(bizDraft.owner)) throw new Error("Owner is required.");
    if (!bizDraft.addressText.trim()) throw new Error("Address is required.");
  }, [bizDraft]);

  const saveBusiness = useCallback(async (enqueue: (job: { type: string; payload: any }) => Promise<void>) => {
    setBusy(true);
    setBanner(null);
    try {
      validateBiz();
      const nowISO = new Date().toISOString();
      const id = bizDraft.id || uuid();
      const existing = await db.businesses.get(id);

      const latestYear = existing?.latestYear ?? currentYear() - 1; 
      const status = "Active";
      const ownerName = getOwnerName(bizDraft.owner);

      const rec: BusinessLocal = {
        id,
        businessName: bizDraft.businessName.trim(),
        owner: bizDraft.owner,
        ownerName: ownerName,
        addressText: bizDraft.addressText.trim(),
        category: bizDraft.category.trim() || undefined,
        contact: bizDraft.contact.trim() || undefined,
        notes: bizDraft.notes.trim() || undefined,
        latestYear,
        status,
        createdAtISO: existing?.createdAtISO ?? nowISO,
        updatedAtISO: nowISO,
        searchTokens: toTokens([
          id,
          upper(bizDraft.businessName),
          upper(ownerName),
          upper(bizDraft.addressText),
          upper(bizDraft.category),
          upper(bizDraft.contact),
        ].join(" ")),
      };

      await db.businesses.put(rec);

      await writeActivity({
        type: existing ? "BUSINESS_UPDATED" : "BUSINESS_CREATED",
        entityType: "business",
        entityId: rec.id,
        status: "ok",
        title: existing ? "Business Updated" : "Business Registered",
        subtitle: `${rec.businessName} • Owner: ${rec.ownerName}`,
      });


      await enqueue({ type: "BUSINESS_UPSERT", payload: rec });

      setBanner({ kind: "ok", msg: "Saved & queued for sync ✅" });
      setMode("list");
      return { ok: true as const, id: rec.id };
    } catch (e: any) {
      setBanner({ kind: "error", msg: e?.message ?? String(e) });
      return { ok: false as const };
    } finally {
      setBusy(false);
    }
  }, [bizDraft, validateBiz]);

  const startRenew = useCallback(async (id: string) => {
    const b = await db.businesses.get(id);
    if (!b) return;
    setSelectedBusinessId(id);
    setRenewDraft({ year: currentYear(), feeAmount: 0, orNo: "", remarks: "" });
    setBanner(null);
    setMode("renewForm");
  }, []);

  const renewAndPrint = useCallback(async (enqueue: (job: { type: string; payload: any }) => Promise<void>) => {
    if (!selectedBusinessId) return;
    setBusy(true);
    setBanner(null);
    let issuance: PermitIssuanceLocal | null = null;
    try {
      const b = await db.businesses.get(selectedBusinessId);
      if (!b) throw new Error("Business not found.");

      const year = Number(renewDraft.year);
      if (!year || year < 2000) throw new Error("Enter a valid year.");
      const feeAmount = Number(renewDraft.feeAmount);
      if (!isFinite(feeAmount) || feeAmount <= 0) throw new Error("Enter a valid fee amount.");

      const nowISO = new Date().toISOString();
      const issuanceId = uuid();

      issuance = {
        id: issuanceId,
        businessId: b.id,
        businessName: b.businessName,
        ownerName: b.ownerName,
        year,
        feeAmount,
        orNo: renewDraft.orNo.trim() || undefined,
        remarks: renewDraft.remarks.trim() || undefined,
        controlNo: makeControlNo(settings.controlPrefix || "BRGY"),
        issuedAtISO: nowISO,
        issuedByName: settings.secretaryName,
        barangayName: settings.barangayName,
        municipalityCity: settings.barangayAddress,
        province: "",
        searchTokens: toTokens([b.businessName, b.ownerName, b.id, String(year), String(feeAmount), renewDraft.orNo, issuanceId].join(" ")),
      };

      await db.permit_issuances.put(issuance);

      const updated: BusinessLocal = {
        ...b,
        latestYear: year,
        status: "Active",
        updatedAtISO: nowISO,
        searchTokens: b.searchTokens,
      };
      await db.businesses.put(updated);

      await writeActivity({
        type: "BUSINESS_RENEWED",
        entityType: "permit_issuance",
        entityId: issuance.id,
        status: "ok",
        title: "Business Permit Renewed",
        subtitle: `${issuance.businessName} • ${issuance.year} • ${issuance.controlNo}`,
        details: { businessId: issuance.businessId, year: issuance.year, controlNo: issuance.controlNo }
      });


      await enqueue({ type: "BUSINESS_UPSERT", payload: updated });
      await enqueue({ type: "PERMIT_ISSUANCE_UPSERT", payload: issuance });
      
      const html = buildBusinessPermitHTML(issuance, settings);
      const printJobId = await enqueuePrintJob({
        entityType: "permit_issuance",
        entityId: issuance.id,
        docType: "business_permit",
        title: "Business Permit",
        subtitle: `${issuance.businessName} • ${issuance.year} • ${issuance.controlNo}`,
        html,
      });

      await performPrintJob(printJobId);

      setBanner({ kind: "ok", msg: "Renewed & queued for sync ✅. Printing..." });
      setMode("list");
      return { ok: true as const, issuanceId, issuance: issuance };
    } catch (e: any) {
      setBanner({ kind: "error", msg: e?.message ?? String(e) });
      return { ok: false as const };
    } finally {
      setBusy(false);
    }
  }, [selectedBusinessId, renewDraft, settings]);

  const afterPrint = useCallback(() => {
    setPrintHTML(null);
  }, []);

  return {
    mode,
    query, setQuery,
    items, loading,
    banner, setBanner,
    busy,
    bizDraft, setBizDraft,
    canSaveBusiness,
    renewDraft, setRenewDraft,
    canRenew,
    selectedBusinessId,
    newBusiness,
    openBusiness,
    backToList,
    saveBusiness,
    startRenew,
    renewAndPrint,
    printHTML,
    afterPrint,
    reload,
  };
}

import { useCallback, useEffect, useMemo, useState } from "react";
import { db, BusinessLocal, PermitIssuanceLocal } from "@/lib/bosDb";
import { toTokens } from "@/lib/bos/searchTokens";
import { useSettings } from "@/hooks/useSettings";
import { buildBusinessPermitHTML } from "@/lib/permits/templates";
import { writeActivity } from "@/lib/bos/activity/writeActivity";


type Mode = "list" | "businessForm" | "renewForm";
type Banner = { kind: "ok" | "error"; msg: string } | null;

function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function upper(s: string) { return (s ?? "").trim().toUpperCase(); }

function currentYear() { return new Date().getFullYear(); }

function makeControlNo() {
  const d = new Date();
  const pad = (n:number)=>String(n).padStart(2,"0");
  const stamp = `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  const rand = Math.random().toString(16).slice(2, 6).toUpperCase();
  return `${stamp}-${rand}`;
}

export function useBusinessPermitsWorkstation() {
  const settings = useSettings();

  const [mode, setMode] = useState<Mode>("list");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<BusinessLocal[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [banner, setBanner] = useState<Banner>(null);

  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);

  const [bizDraft, setBizDraft] = useState({
    id: "",
    businessName: "",
    ownerName: "",
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

  const computeStatus = useCallback((latestYear:number, suspended?: boolean) => {
    if (suspended) return "Suspended" as const;
    return latestYear >= currentYear() ? "Active" as const : "Expired" as const;
  }, []);

  const fetchList = useCallback(async (qRaw: string) => {
    setLoading(true);
    try {
      const q = upper(qRaw);
      if (!q) {
        const list = await db.businesses.orderBy("updatedAtISO").reverse().limit(150).toArray();
        setItems(list);
        return;
      }
      const first = q.split(/\s+/)[0];
      const hits = await db.businesses.where("searchTokens").equals(first).toArray();
      const refined = hits.filter((b) => {
        const hay = [upper(b.businessName), upper(b.ownerName), upper(b.addressText), upper(b.category ?? ""), b.id, b.status].join(" ");
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

  const newBusiness = useCallback(() => {
    setSelectedBusinessId(null);
    setBanner(null);
    setBizDraft({ id: "", businessName: "", ownerName: "", addressText: "", category: "", contact: "", notes: "" });
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
      ownerName: b.ownerName,
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
    if (!bizDraft.ownerName.trim()) throw new Error("Owner name is required.");
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

      const latestYear = existing?.latestYear ?? currentYear() - 1; // new business starts as expired until renewed (safe)
      const status = computeStatus(latestYear);

      const rec: BusinessLocal = {
        id,
        businessName: bizDraft.businessName.trim(),
        ownerName: bizDraft.ownerName.trim(),
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
          upper(bizDraft.ownerName),
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
        title: existing ? "Business updated" : "Business created",
        subtitle: `${rec.businessName} • Owner: ${rec.ownerName}`,
      });


      await enqueue({ type: "BUSINESS_UPSERT", payload: rec });

      setBanner({ kind: "ok", msg: "Saved & queued ✅" });
      setMode("list");
      return { ok: true as const, id: rec.id };
    } catch (e: any) {
      setBanner({ kind: "error", msg: e?.message ?? String(e) });
      return { ok: false as const };
    } finally {
      setBusy(false);
    }
  }, [bizDraft, validateBiz, computeStatus]);

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
      if (!isFinite(feeAmount) || feeAmount < 0) throw new Error("Enter a valid fee.");

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
        controlNo: makeControlNo(),
        issuedAtISO: nowISO,
        issuedByName: settings.issuedByName,
        barangayName: settings.barangayName,
        municipalityCity: settings.municipalityCity,
        province: settings.province,
        searchTokens: toTokens([b.businessName, b.ownerName, b.id, String(year), String(feeAmount), renewDraft.orNo, issuanceId].join(" ")),
      };

      // 1) local issuance
      await db.permit_issuances.put(issuance);

      // 2) update business latestYear + status
      const updated: BusinessLocal = {
        ...b,
        latestYear: year,
        status: b.status === "Suspended" ? "Suspended" : (year >= currentYear() ? "Active" : "Expired"),
        updatedAtISO: nowISO,
        searchTokens: b.searchTokens, // keep
      };
      await db.businesses.put(updated);

      // 3) audit + print log
      await writeActivity({
        type: "BUSINESS_RENEWED",
        entityType: "permit_issuance",
        entityId: issuance.id,
        status: "ok",
        title: "Business permit renewed",
        subtitle: `${issuance.businessName} • ${issuance.year} • ${issuance.controlNo}`,
        details: { businessId: issuance.businessId, year: issuance.year, controlNo: issuance.controlNo }
      });


      // Reuse print_logs (store issuanceId in issuanceId field; certType identifies it's a permit print)
      await db.print_logs.add({
        issuanceId,
        residentId: b.id,            // reuse residentId field to store businessId (consistent sink)
        certType: "BUSINESS_PERMIT", // label
        issuedAtISO: nowISO,
        synced: 0,
      });

      // 4) enqueue sync
      await enqueue({ type: "BUSINESS_UPSERT", payload: updated });
      await enqueue({ type: "PERMIT_ISSUANCE_UPSERT", payload: issuance });
      await enqueue({ type: "PRINTLOG_UPSERT", payload: { issuanceId, ownerOrBusinessId: b.id, type: "BUSINESS_PERMIT", issuedAtISO: nowISO } });

      // 5) print
      const html = buildBusinessPermitHTML(issuance);
      setPrintHTML(html);

      setBanner({ kind: "ok", msg: "Renewed & queued ✅ Printing…" });
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
    renewDraft, setRenewDraft,
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

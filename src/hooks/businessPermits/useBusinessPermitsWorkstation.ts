import { useCallback, useEffect, useMemo, useState } from "react";
import { db, BusinessLocal, PermitIssuanceLocal } from "@/lib/bosDb";
import { toTokens } from "@/lib/bos/searchTokens";
import { loadDraft, saveDraft, clearDraft } from "@/lib/bos/localDraft";

export type BusinessDraft = {
  id?: string;
  businessName: string;
  ownerName: string;
  addressText: string;
  category?: string;
  contact?: string;
  notes?: string;
  status: "Active" | "Expired" | "Suspended";
  latestYear: number;
};

export type RenewalDraft = {
  businessId?: string;
  year: number;
  feeAmount: number;
  orNo?: string;
  remarks?: string;
};

function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function useBusinessPermitsWorkstation(keys?: { businessDraftKey?: string; renewalDraftKey?: string }) {
  const businessDraftKey = keys?.businessDraftKey ?? "draft:business:new";
  const renewalDraftKey = keys?.renewalDraftKey ?? "draft:permit:renewal";

  const thisYear = new Date().getFullYear();

  const [query, setQuery] = useState("");
  const [items, setItems] = useState<BusinessLocal[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [businessDraft, setBusinessDraft] = useState<BusinessDraft>(() => {
    return (
      loadDraft<BusinessDraft>(businessDraftKey) ?? {
        businessName: "",
        ownerName: "",
        addressText: "",
        category: "",
        contact: "",
        notes: "",
        status: "Active",
        latestYear: thisYear,
      }
    );
  });

  const [renewalDraft, setRenewalDraft] = useState<RenewalDraft>(() => {
    return loadDraft<RenewalDraft>(renewalDraftKey) ?? { year: thisYear, feeAmount: 0, orNo: "", remarks: "" };
  });

  const [banner, setBanner] = useState<{ kind: "error" | "ok"; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { saveDraft(businessDraftKey, businessDraft); }, [businessDraftKey, businessDraft]);
  useEffect(() => { saveDraft(renewalDraftKey, renewalDraft); }, [renewalDraftKey, renewalDraft]);

  const reload = useCallback(async () => {
    const q = query.trim().toUpperCase();
    let list: BusinessLocal[] = [];
    if (!q) {
      list = await db.businesses.orderBy("updatedAtISO").reverse().limit(200).toArray();
    } else {
      const token = q.split(/\s+/)[0];
      const hits = await db.businesses.where("searchTokens").equals(token).toArray();
      list = hits.filter((b) => {
        const hay = [b.businessName, b.ownerName, b.addressText, b.id].join(" ").toUpperCase();
        return hay.includes(q);
      });
    }
    setItems(list);
  }, [query]);

  useEffect(() => { reload(); }, [reload]);

  const hasBusinessDraft = useMemo(() => {
    return Boolean(businessDraft.businessName.trim() || businessDraft.ownerName.trim() || businessDraft.addressText.trim());
  }, [businessDraft]);

  const startNew = useCallback(() => {
    setSelectedId(null);
    setBusinessDraft({
      businessName: "",
      ownerName: "",
      addressText: "",
      category: "",
      contact: "",
      notes: "",
      status: "Active",
      latestYear: thisYear,
    });
    setRenewalDraft({ year: thisYear, feeAmount: 0, orNo: "", remarks: "" });
    clearDraft(businessDraftKey);
    clearDraft(renewalDraftKey);
    setBanner(null);
  }, [businessDraftKey, renewalDraftKey, thisYear]);

  const loadExisting = useCallback(async (id: string) => {
    const b = await db.businesses.get(id);
    if (!b) return;
    setSelectedId(id);
    setBusinessDraft({
      id: b.id,
      businessName: b.businessName,
      ownerName: b.ownerName,
      addressText: b.addressText,
      category: b.category ?? "",
      contact: b.contact ?? "",
      notes: b.notes ?? "",
      status: b.status,
      latestYear: b.latestYear,
    });
    setRenewalDraft((r) => ({ ...r, businessId: b.id }));
    setBanner(null);
  }, []);

  const validateBusiness = useCallback((d: BusinessDraft) => {
    if (!d.businessName.trim()) throw new Error("Business name is required.");
    if (!d.ownerName.trim()) throw new Error("Owner name is required.");
    if (!d.addressText.trim()) throw new Error("Address is required.");
  }, []);

  const upsertBusinessLocal = useCallback(async () => {
    validateBusiness(businessDraft);
    const nowISO = new Date().toISOString();
    const id = businessDraft.id ?? uuid();

    const tokenSource = [
      id,
      businessDraft.businessName,
      businessDraft.ownerName,
      businessDraft.addressText,
      businessDraft.category ?? "",
      businessDraft.status,
    ].join(" ");

    const existing = await db.businesses.get(id);

    const rec: BusinessLocal = {
      id,
      createdAtISO: existing?.createdAtISO ?? nowISO,
      updatedAtISO: nowISO,
      businessName: businessDraft.businessName.trim(),
      ownerName: businessDraft.ownerName.trim(),
      addressText: businessDraft.addressText.trim(),
      category: businessDraft.category?.trim() || undefined,
      contact: businessDraft.contact?.trim() || undefined,
      notes: businessDraft.notes?.trim() || undefined,
      latestYear: Number(businessDraft.latestYear) || new Date().getFullYear(),
      status: businessDraft.status,
      searchTokens: toTokens(tokenSource),
    };

    await db.businesses.put(rec);
    return rec;
  }, [businessDraft, validateBusiness]);

  const renewAndCreateIssuanceLocal = useCallback(async (business: BusinessLocal) => {
    const year = Number(renewalDraft.year);
    const fee = Number(renewalDraft.feeAmount);

    if (!year || year < 2000) throw new Error("Valid renewal year is required.");
    if (!Number.isFinite(fee) || fee < 0) throw new Error("Fee must be 0 or greater.");

    const controlNo = `BP-${Date.now()}`;
    const id = uuid();
    const issuedAtISO = new Date().toISOString();

    const tokenSource = [id, business.id, business.businessName, business.ownerName, controlNo, String(year)].join(" ");

    const issuance: PermitIssuanceLocal = {
      id,
      businessId: business.id,
      issuedAtISO,
      year,
      feeAmount: fee,
      orNo: renewalDraft.orNo?.trim() || undefined,
      remarks: renewalDraft.remarks?.trim() || undefined,
      controlNo,
      searchTokens: toTokens(tokenSource),
    };

    await db.permit_issuances.put(issuance);

    // Update business latestYear/status
    await db.businesses.put({
      ...business,
      latestYear: Math.max(business.latestYear || 0, year),
      status: "Active",
      updatedAtISO: new Date().toISOString(),
    });

    return issuance;
  }, [renewalDraft]);

  const saveLocalAndQueue = useCallback(async (enqueue: (job: { type: string; payload: any }) => Promise<void>) => {
    setLoading(true);
    setBanner(null);
    try {
      // 1) local upsert business
      const business = await upsertBusinessLocal();

      // 2) queue business upsert
      await enqueue({
        type: businessDraft.id ? "BUSINESS_UPDATE" : "BUSINESS_CREATE",
        payload: business,
      });

      // 3) audit
      await db.audit_queue.add({
        eventType: businessDraft.id ? "BUSINESS_UPDATED" : "BUSINESS_CREATED",
        details: { id: business.id },
        occurredAtISO: new Date().toISOString(),
        synced: 0,
      });

      clearDraft(businessDraftKey);
      setSelectedId(business.id);
      setBusinessDraft((d) => ({ ...d, id: business.id }));

      setBanner({ kind: "ok", msg: "Business saved & queued ✅" });
      await reload();
      return { ok: true as const, business };
    } catch (e: any) {
      const msg = e.message ?? String(e);
      setBanner({ kind: "error", msg });
      console.error("Business save failed:", e);
      await db.audit_queue.add({ eventType: "BUSINESS_ERROR", details: { msg }, occurredAtISO: new Date().toISOString(), synced: 0 });
      return { ok: false as const, error: msg };
    } finally {
      setLoading(false);
    }
  }, [businessDraft.id, businessDraftKey, reload, upsertBusinessLocal]);

  const renewQueueFirst = useCallback(async (enqueue: (job: { type: string; payload: any }) => Promise<void>) => {
    setLoading(true);
    setBanner(null);
    try {
      if (!selectedId) throw new Error("Select a business first.");
      const business = await db.businesses.get(selectedId);
      if (!business) throw new Error("Business not found.");

      // 1) local issuance + update business
      const issuance = await renewAndCreateIssuanceLocal(business);

      // 2) queue issuance + business update
      await enqueue({ type: "PERMIT_RENEWAL", payload: issuance });
      await enqueue({ type: "BUSINESS_UPDATE", payload: await db.businesses.get(business.id) });

      // 3) audit
      await db.audit_queue.add({
        eventType: "PERMIT_RENEWED",
        details: { businessId: business.id, issuanceId: issuance.id, year: issuance.year, controlNo: issuance.controlNo },
        occurredAtISO: new Date().toISOString(),
        synced: 0,
      });

      clearDraft(renewalDraftKey);
      setRenewalDraft((r) => ({ ...r, businessId: business.id }));

      setBanner({ kind: "ok", msg: "Renewal saved & queued ✅ Ready to print." });
      await reload();
      return { ok: true as const, businessId: business.id, issuance };
    } catch (e: any) {
      const msg = e.message ?? String(e);
      setBanner({ kind: "error", msg });
      console.error("Renewal failed:", e);
      await db.audit_queue.add({ eventType: "PERMIT_ERROR", details: { msg }, occurredAtISO: new Date().toISOString(), synced: 0 });
      return { ok: false as const, error: msg };
    } finally {
      setLoading(false);
    }
  }, [selectedId, renewalDraftKey, reload, renewAndCreateIssuanceLocal]);

  return {
    query, setQuery,
    items,
    selectedId,
    banner,
    loading,
    hasBusinessDraft,

    businessDraft, setBusinessDraft,
    renewalDraft, setRenewalDraft,

    reload,
    startNew,
    loadExisting,
    saveLocalAndQueue,
    renewQueueFirst,
  };
}

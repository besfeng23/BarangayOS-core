
import Dexie, { type Table } from "dexie";
import type { ResidentPickerValue } from "@/components/shared/ResidentPicker";

// IMPORTANT: This must be >= the highest version that has ever shipped to browsers.
export const DB_VERSION = 10;
export const DB_NAME = "BarangayOS_Local";

export type MetaRow = { key: string; value: any };
export type SettingsRow = { key: string; value: any };


// Shared rows
export type SyncQueueItem = {
  id?: number;
  jobType: string;
  payload: any;
  occurredAtISO: string;
  synced: 0 | 1;
  status?: "pending" | "syncing" | "failed" | "done"; // for UI health counters
  error?: string;
};

export type AuditRow = { id?: number; eventType: string; details: any; occurredAtISO: string; synced: 0 | 1 };


// Residents
export type ResidentLocal = {
  id: string;
  fullName: string;
  fullNameUpper: string;
  householdNo?: string;
  householdNoUpper?: string;
  addressText?: string;
  contact?: string;
  // ISO strings only (local-first)
  createdAtISO: string;
  updatedAtISO: string;
  // array of tokens (for multiEntry index)
  searchTokens: string[];
};

// Cases (optional safety banner elsewhere)
export type CaseLocal = {
  id: string;
  residentId: string;
  status: "Pending" | "Resolved" | string;
  createdAtISO: string;
  updatedAtISO: string;
};

// Blotter
export type BlotterLocal = {
  id: string;
  createdAtISO: string;
  updatedAtISO: string;
  status: "Pending" | "Resolved";
  incidentDateISO: string;
  locationText: string;
  complainantName: string;
  respondentName: string;
  narrative: string;
  
  complainant?: ResidentPickerValue;
  respondent?: ResidentPickerValue;

  // optional
  complainantContact?: string;
  respondentContact?: string;
  actionsTaken?: string;
  settlement?: string;
  notes?: string;

  searchTokens: string[];
};

// Business permits
export type BusinessLocal = {
  id: string;
  createdAtISO: string;
  updatedAtISO: string;
  businessName: string;
  ownerName: string;
  owner?: ResidentPickerValue;
  addressText: string;
  category?: string;
  contact?: string;
  notes?: string;
  latestYear: number;
  status: "Active" | "Expired" | "Suspended";
  searchTokens: string[];
};

export type PermitIssuanceLocal = {
  id: string;
  businessId: string;
  businessName: string;
  ownerName: string;

  year: number;
  feeAmount: number;
  orNo?: string;
  remarks?: string;

  controlNo: string;
  issuedAtISO: string;
  issuedByName: string;

  barangayName: string;
  municipalityCity: string;
  province: string;

  searchTokens: string[];
};


export type CertificateIssuanceLocal = {
  id: string;
  residentId: string;
  residentName: string;
  certType: "Barangay Clearance" | "Certificate of Residency" | "Indigency" | "Business Clearance";
  purpose: string;
  controlNo: string; // human-friendly unique control no
  issuedAtISO: string;
  issuedByName: string; // from Settings or fallback "Barangay Staff"
  barangayName: string; // from Settings
  municipalityCity: string; // from Settings
  province: string; // from Settings
  status: "Issued";
  searchTokens: string[];
};

export type PrintLogLocal = {
  id?: number;
  issuanceId: string;
  residentId: string;
  certType: string;
  issuedAtISO: string;
  synced: 0 | 1;
};

export type ActivityLogLocal = {
  id: string;
  occurredAtISO: string;

  // classification
  type:
    | "RESIDENT_CREATED"
    | "RESIDENT_UPDATED"
    | "CERT_ISSUED"
    | "CERT_PRINTED"
    | "BLOTTER_CREATED"
    | "BLOTTER_UPDATED"
    | "BLOTTER_RESOLVED"
    | "BLOTTER_PRINTED"
    | "BUSINESS_CREATED"
    | "BUSINESS_UPDATED"
    | "BUSINESS_RENEWED"
    | "BUSINESS_PERMIT_PRINTED"
    | "SYNC_STARTED"
    | "SYNC_COMPLETE"
    | "SYNC_PAUSED"
    | "ERROR"
    | "SETTINGS_UPDATED";

  entityType: "resident" | "certificate" | "blotter" | "business" | "permit_issuance" | "sync" | "system";
  entityId: string; // id of record or "sync"
  status: "ok" | "warn" | "error"; // for UI color/badge (lightweight)

  title: string; // short human line e.g. "Certificate issued"
  subtitle: string; // second line e.g. "Mark • Barangay Clearance • Control 2025..."
  details?: any; // optional for future drilldown

  searchTokens: string[];
  synced: 0 | 1;
};

export type PrintJobLocal = {
  id: string;                 // uuid
  createdAtISO: string;
  printedAtISO?: string;

  // source record
  entityType: "certificate" | "blotter" | "permit_issuance" | "resident_doc" | "system";
  entityId: string;

  title: string;              // e.g. "Barangay Clearance"
  subtitle: string;           // e.g. "Mark • Control No 2025-00012"
  docType: string;            // e.g. "barangay_clearance" | "blotter_report" | "business_permit"
  html: string;               // printable HTML snapshot (already final)
  status: "queued" | "printed" | "failed";
  attempts: number;           // increment if print fails
  lastError?: string;

  searchTokens: string[];
  synced: 0 | 1;
};


class BOSDexie extends Dexie {
  // Canonical tables (camelCase for app code)
  residents!: Table<ResidentLocal, string>;
  cases!: Table<CaseLocal, string>;
  blotters!: Table<BlotterLocal, string>;
  businesses!: Table<BusinessLocal, string>;
  permit_issuances!: Table<PermitIssuanceLocal, string>;
  certificate_issuances!: Table<CertificateIssuanceLocal, string>;
  print_logs!: Table<PrintLogLocal, number>;
  print_jobs!: Table<PrintJobLocal, string>;
  activity_log!: Table<ActivityLogLocal, string>;
  settings!: Table<SettingsRow, string>;
  meta!: Table<MetaRow, string>;
  sync_queue!: Table<SyncQueueItem, number>;
  audit_queue!: Table<AuditRow, number>;

  constructor() {
    super(DB_NAME);
    this.version(8).stores({
      meta: "key",
      settings: "key",
      residents: "id, fullNameUpper, householdNoUpper, updatedAtISO, *searchTokens",
      cases: "id, residentId, status, updatedAtISO",
      blotters: "id, status, updatedAtISO, incidentDateISO, *searchTokens",
      businesses: "id, status, latestYear, updatedAtISO, *searchTokens",
      permit_issuances: "id, businessId, year, issuedAtISO, *searchTokens",
      certificate_issuances: "id, residentId, certType, issuedAtISO, controlNo, status, *searchTokens",
      print_logs: "++id, issuanceId, issuedAtISO, certType, residentId, synced",
      print_jobs: "id, createdAtISO, printedAtISO, status, entityType, entityId, *searchTokens",
      activity_log: "id, occurredAtISO, type, entityType, entityId, status, *searchTokens",
      sync_queue: "++id, occurredAtISO, synced, jobType", // STATUS INDEX MISSING IN v8
      audit_queue: "++id, eventType, occurredAtISO, synced",
    });

    // HOTFIX VERSION 9: Add `status` index to `sync_queue` to fix runtime SchemaError
    this.version(9).stores({
        sync_queue: "++id, occurredAtISO, synced, status, jobType" // Add status to index
    }).upgrade(async (tx) => {
        // Backfill missing status field on old records to prevent them from being orphaned
        await tx.table("sync_queue").toCollection().modify((item: any) => {
            if (!item.status) {
                item.status = "pending";
            }
        });
    });

    // HOTFIX VERSION 10: Fix primary key change errors by migrating data
    this.version(10).stores({
      // Keep old definitions for migration source
      print_logs: "++id, issuanceId, issuedAtISO, certType, residentId, synced",
      sync_queue: "++id, occurredAtISO, synced, status, jobType",
      audit_queue: "++id, eventType, occurredAtISO, synced",
      // New definitions with stable primary keys
      print_logs_v2: "id, issuanceId, issuedAtISO",
      sync_queue_v2: "id, status, occurredAtISO",
      audit_queue_v2: "id, eventType, occurredAtISO",
    }).upgrade(async (tx) => {
      // Migrate print_logs
      await tx.table('print_logs').each(async (old) => {
        await tx.table('print_logs_v2').add({ ...old, id: old.id.toString() });
      });
      // Migrate sync_queue
      await tx.table('sync_queue').each(async (old) => {
        await tx.table('sync_queue_v2').add({ ...old, id: old.id.toString(), status: old.status || 'pending' });
      });
       // Migrate audit_queue
       await tx.table('audit_queue').each(async (old) => {
        await tx.table('audit_queue_v2').add({ ...old, id: old.id.toString() });
      });
    });

    // After migration, you can rename the tables in the class instance for transparent use
    if (this.verno >= 10) {
      this.print_logs = this.table("print_logs_v2");
      this.sync_queue = this.table("sync_queue_v2");
      this.audit_queue = this.table("audit_queue_v2");
    }
  }
}

export const db = new BOSDexie();

export async function resetLocalDatabase() {
  await db.close();
  await Dexie.delete(DB_NAME);
}

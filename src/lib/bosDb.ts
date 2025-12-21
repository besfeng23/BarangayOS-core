

import Dexie, { type Table } from "dexie";
import type { ResidentPickerValue } from "@/components/shared/ResidentPicker";
import type { AISettings as AISettingsValue } from '@/hooks/useAISettings';

// IMPORTANT: This must be >= the highest version that has ever shipped to browsers.
export const DB_VERSION = 15;
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
  lastError?: string; // Add this to match the updateQueueItem call
  tryCount?: number;   // Add this to match the updateQueueItem call
  entityType?: string;
  entityId?: string;
  op?: "CREATE" | "UPDATE" | "DELETE" | "UPSERT";
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
  caseNumber?: string;
  
  // Denormalized for simple lists
  complainantName: string;
  respondentName: string;

  // Structured for data integrity
  complainant: ResidentPickerValue;
  respondent: ResidentPickerValue;

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
  owner: ResidentPickerValue;
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
    | "RESIDENT_VIEW"
    | "CERT_ISSUED"
    | "CERT_PRINTED"
    | "BLOTTER_CREATED"
    | "BLOTTER_UPDATED"
    | "BLOTTER_RESOLVED"
    | "BLOTTER_PRINTED"
    | "BLOTTER_VIEW"
    | "BUSINESS_CREATED"
    | "BUSINESS_UPDATED"
    | "BUSINESS_RENEWED"
    | "BUSINESS_PERMIT_PRINTED"
    | "SYNC_STARTED"
    | "SYNC_COMPLETE"
    | "SYNC_PAUSED"
    | "ERROR"
    | "SETTINGS_UPDATED"
    | "QUOTATION_REQUESTED"
    | "JOB_APPLICATION_SUBMITTED"
    | "PAYMENT_COLLECTED"
    | "PAYMENT_DISBURSED"
    | "DEVICE_CREATED"
    | "DEVICE_UPDATED";

  entityType: "resident" | "certificate" | "blotter" | "business" | "permit_issuance" | "sync" | "system" | "procurement" | "emango" | "jobs";
  entityId: string; // id of record or "sync"
  status: "ok" | "warn" | "error"; // for UI color/badge (lightweight)

  title: string; // short human line e.g. "Certificate issued"
  subtitle: string; // second line e.g. "Mark • Barangay Clearance • Control 2025..."
  details: any | null; // optional for future drilldown

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

// Security Module
export type DeviceType = "CCTV" | "NVR" | "BODY_CAM" | "DASH_CAM" | "PANIC_BUTTON" | "SIREN" | "LED_DISPLAY" | "PA_SYSTEM" | string;
export type DeviceStatus = "ACTIVE" | "MAINTENANCE" | "INACTIVE";

export type SecurityDeviceLocal = {
  id: string;
  type: DeviceType;
  name: string;
  location: string;
  ipAddress?: string;
  status: DeviceStatus;
  createdAtISO: string;
  updatedAtISO: string;
  searchTokens: string[];
  synced: 0 | 1;
}

// Clinic Module
export type ClinicVisitStatus = "WAITING" | "TRIAGE" | "CONSULT" | "DONE" | "CANCELLED";

export type ClinicQueueItem = {
    id: string;
    createdAtISO: string;
    updatedAtISO: string;
    patient: ResidentPickerValue;
    patientName: string;
    reason: string;
    status: ClinicVisitStatus;
    tags: string[];
    searchTokens: string[];
    synced: 0 | 1;
}

// AI Module
export type AICache = {
  key: string; // hash of the prompt/request
  value: any; // cached response
  createdAt: number; // timestamp for TTL
};

export type AISettings = {
  key: "aiSettings";
  value: AISettingsValue;
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
  devices!: Table<SecurityDeviceLocal, string>;
  clinic_queue!: Table<ClinicQueueItem, string>;
  settings!: Table<SettingsRow, string>;
  meta!: Table<MetaRow, string>;
  sync_queue!: Table<SyncQueueItem, number>;
  audit_queue!: Table<AuditRow, number>;
  ai_cache!: Table<AICache, string>;
  ai_settings!: Table<AISettings, string>;

  constructor() {
    super(DB_NAME);
    this.version(15).stores({
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
      sync_queue: "++id, occurredAtISO, synced, status, jobType", 
      audit_queue: "++id, eventType, occurredAtISO, synced",
      devices: "id, type, status, updatedAtISO, *searchTokens",
      clinic_queue: "id, status, createdAtISO, *searchTokens",
      ai_cache: "key, createdAt",
      ai_settings: "key",
    });
  }
}

export const db = new BOSDexie();

export async function resetLocalDatabase() {
  await db.close();
  await Dexie.delete(DB_NAME);
  // Reload the page to re-initialize the database and app state
  window.location.reload();
}

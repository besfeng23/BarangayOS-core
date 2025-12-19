import Dexie, { Table } from "dexie";

// IMPORTANT: This must be >= the highest version that has ever shipped to browsers.
// The error indicated an existing version of 4, so we are setting it to 5.
export const DB_VERSION = 5;

// Shared rows
export type SyncQueueRow = {
  id?: number;
  jobType: string;
  payload: any;
  occurredAtISO: string;
  synced: 0 | 1;
};

export type AuditRow = {
  id?: number;
  eventType: string;
  details: any;
  occurredAtISO: string;
  synced: 0 | 1;
};

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
  addressText: string;
  category?: string;
  contact?: string;
  permitNo?: string;
  latestYear: number;
  status: "Active" | "Expired" | "Suspended";
  notes?: string;
  searchTokens: string[];
};

export type PermitIssuanceLocal = {
  id: string;
  businessId: string;
  issuedAtISO: string;
  year: number;
  feeAmount: number;
  orNo?: string;
  remarks?: string;
  issuedByName?: string;
  controlNo: string;
  searchTokens: string[];
};

export type Sex = "Male" | "Female" | "Other";
export type CivilStatus = "Single" | "Married" | "Widowed" | "Separated" | "Unknown";
export type ResidentStatus = "ACTIVE" | "INACTIVE";

export type Party = {
  residentId?: string;
  name: string;
  nameNorm: string;
};

export type ResidentRecord = {
  id: string;
  createdAt: number;
  lastUpdated: number;
  barangayId?: string;
  lastName: string;
  firstName: string;
  middleName?: string;
  suffix?: string;
  fullNameNorm: string;
  lastNameNorm: string;
  firstNameNorm: string;
  birthdate: string;
  searchTokens: string[];
  sex: Sex;
  civilStatus: CivilStatus;
  purok: string;
  addressLine1: string;
  status: ResidentStatus;
  syncState?: "queued" | "synced" | "failed";
};

export type BlotterStatus = "Pending" | "Resolved" | "ACTIVE" | "SETTLED" | "FILED_TO_COURT" | "DISMISSED";

export type BlotterRecord = {
  id: string;
  barangayId: string;
  createdAt: number;
  updatedAt: number;
  caseNumber: string;
  caseNumberNorm: string;
  complainants: Party[];
  respondents: Party[];
  incidentDate: number;
  hearingDate?: number;
  narrative: string;
  narrativeNorm: string;
  status: BlotterStatus;
  tags: string[];
  tagsNorm: string[];
  settlementSummary?: string;
  settlementSummaryNorm?: string;
  syncState?: "queued" | "synced" | "failed";
  searchTokens: string[];
};

export type PrintLogItem = {
  id: string;
  barangayId: string;
  createdAt: number;
  docType: "CERTIFICATE" | "CLEARANCE" | "INDIGENCY" | "SUMMONS" | "AMICABLE";
  controlNo: string;
  residentId?: string;
  blotterId?: string;
  meta?: any;
  status: "pending" | "syncing" | "failed" | "synced";
  tryCount: number;
  lastError?: string;
};

export type SyncQueueItem = {
  id: string;
  entityType: "resident" | "blotter" | "print_log" | "transaction" | "setting" | "auditLog" | "business" | "certificate";
  entityId: string;
  op: "UPSERT" | "DELETE";
  payload: any;
  createdAt: number;
  updatedAt: number;
  status: "pending" | "syncing" | "failed" | "synced";
  tryCount: number;
  lastError?: string;
};

export type DraftItem = {
  id: string;
  module: "residents" | "blotter";
  key: string;
  payload: any;
  updatedAt: number;
};

export type ActivityLogItem = {
  id: string;
  createdAt: number;
  type:
    | "RESIDENT_CREATE"
    | "RESIDENT_VIEW"
    | "RESIDENT_UPDATE"
    | "CERT_ISSUED"
    | "BLOTTER_CREATE"
    | "BLOTTER_VIEW"
    | "BLOTTER_UPDATE"
    | "BLOTTER_PRINT"
    | "BLOTTER_STATUS_UPDATE";
  entityType: "resident" | "blotter" | "print_log";
  entityId: string;
  meta?: any;
};

export type AuditLogRecord = {
  id: string;
  eventType: 'CERT_PRINTED' | 'PERMIT_PRINTED' | 'BLOTTER_PRINTED' | 'CERT_ISSUED' | 'PERMIT_ISSUED' | 'CASE_CREATED';
  entityId: string;
  entityLabel: string;
  actorRole?: string;
  actorEmail?: string;
  occurredAtLocal: string;
  synced: boolean;
  syncError?: string;
}

export type MetaRecord = {
    key: 'lastSyncAt' | 'lastSyncError' | 'syncErrorCount' | 'demoModeEnabled';
    value: string | number | boolean;
}

export type BOSSettings = {
  id: string;
  key: "barangay";
  value: {
    barangayName: string;
    barangayAddress: string;
    punongBarangay: string;
    secretaryName: string;
    partnerId?: string; // e.g. "PLDT_ENT_001"
    deviceId?: string;  // e.g. "KIOSK_NORTH_01"
    trial?: {
      isTrialAccount: boolean;
      daysRemaining: number;
    };
  };
  updatedAt: number;
};

export type TransactionRecord = {
  id: string; // ULID
  type: "clearance_issued" | "blotter_created" | "resident_created" | "permit_renewed";
  module: "certificates" | "blotter" | "residents" | "permits";
  refId: string; // ID of source record (e.g., residentId, blotterId)
  partnerId: string;
  amount: number;
  currency: "PHP";
  status: "pending" | "synced" | "failed";
  createdAt: string; // ISO timestamp
  offline: boolean;
  barangayId: string;
  deviceId: string;
  createdByUid: string;
  syncBatchId?: string;
  lastError?: string;
}

export type CertificateIssuanceLocal = {
  id: string;
  residentId: string;
  residentName: string;
  certType: "Barangay Clearance" | "Certificate of Residency" | "Indigency" | "Business Clearance";
  purpose: string;
  controlNo: string;              // human-friendly unique control no
  issuedAtISO: string;
  issuedByName: string;           // from Settings or fallback "Barangay Staff"
  barangayName: string;           // from Settings
  municipalityCity: string;       // from Settings
  province: string;               // from Settings
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

class BOSDexie extends Dexie {
  residents!: Table<ResidentLocal, string>;
  cases!: Table<CaseLocal, string>;
  blotters!: Table<BlotterLocal, string>;
  businesses!: Table<BusinessLocal, string>;
  permit_issuances!: Table<PermitIssuanceLocal, string>;
  sync_queue!: Table<SyncQueueRow, number>;
  audit_queue!: Table<AuditRow, number>;
  syncQueue!: Table<SyncQueueItem, string>;
  activityLog!: Table<ActivityLogItem, string>;
  drafts!: Table<DraftItem, string>;
  auditLogs!: Table<AuditLogRecord, string>;
  meta!: Table<MetaRecord, string>;
  settings!: Table<BOSSettings, string>;
  transactions!: Table<TransactionRecord, string>;
  certificate_issuances!: Table<CertificateIssuanceLocal, string>;
  print_logs!: Table<PrintLogLocal, number>;


  constructor() {
    super("BarangayOS_Local");
    this.version(DB_VERSION).stores({
      residents: "id, fullNameUpper, householdNoUpper, updatedAtISO, *searchTokens",
      cases: "id, residentId, status, updatedAtISO",
      blotters: "id, status, updatedAtISO, incidentDateISO, *searchTokens",
      businesses: "id, status, latestYear, updatedAtISO, *searchTokens",
      permit_issuances: "id, businessId, year, issuedAtISO, *searchTokens",
      sync_queue: "++id, jobType, occurredAtISO, synced",
      audit_queue: "++id, eventType, occurredAtISO, synced",
      syncQueue: '++id, [entityType+entityId], status',
      auditLogs: '++id, eventType, entityId, occurredAtLocal, synced',
      meta: '&key',
      print_logs: "++id, issuanceId, issuedAtISO, residentId, synced",
      settings: "id, &key",
      transactions: "id, createdAt, status",
      activityLog: "++id, createdAt, type, [entityType+entityId]",
      drafts: "id, &[module+key]",
      certificate_issuances: 'id, residentId, certType, issuedAtISO, controlNo, status, *searchTokens',
    });
  }
}

export const db = new BOSDexie();

export async function resetLocalDatabase() {
  await db.close();
  await Dexie.delete("BarangayOS_Local");
}

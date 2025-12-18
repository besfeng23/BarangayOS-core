
import Dexie, { Table } from "dexie";

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

export type BlotterStatus = "ACTIVE" | "SETTLED" | "FILED_TO_COURT" | "DISMISSED";

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

export type BusinessRecord = {
    id: string;
    businessNameUpper: string;
    ownerNameUpper: string;
    searchTokens: string[];
    status: string;
}

export type CertificateRecord = {
    id: string;
    residentId: string;
    certType: string;
    createdAtLocal: string;
}

class BOSDexie extends Dexie {
  residents!: Table<ResidentRecord, string>;
  blotters!: Table<BlotterRecord, string>;
  printLogs!: Table<PrintLogItem, string>;
  settings!: Table<BOSSettings, string>;
  transactions!: Table<TransactionRecord, string>;
  syncQueue!: Table<SyncQueueItem, string>;
  activityLog!: Table<ActivityLogItem, string>;
  drafts!: Table<DraftItem, string>;
  auditLogs!: Table<AuditLogRecord, string>;
  meta!: Table<MetaRecord, string>;
  businesses!: Table<BusinessRecord, string>;
  certificates!: Table<CertificateRecord, string>;


  constructor() {
    super("BarangayOS");

    this.version(6).stores({
      residents: "id, fullNameUpper, householdNoUpper, *searchTokens, lastNameNorm, firstNameNorm, status, purok, sex, birthdate",
      blotters: "id, residentId, status, createdAtLocal, caseNumberNorm, *tagsNorm, *searchTokens, incidentDate",
      businesses: 'id, businessNameUpper, ownerNameUpper, *searchTokens, status',
      certificates: 'id, residentId, certType, createdAtLocal',
      syncQueue: '++id, entityType, entityId, op, occurredAtLocal, synced, syncError, [entityType+entityId], status',
      auditLogs: '++id, eventType, entityId, entityLabel, actorRole, actorEmail, occurredAtLocal, synced, syncError',
      meta: '&key, value',
      printLogs: "id, createdAt, barangayId, docType, controlNo, residentId, blotterId, status",
      settings: "id, key, updatedAt",
      transactions: "id, createdAt, status, barangayId, partnerId, type",
      activityLog: "id, createdAt, type, entityType, entityId",
      drafts: "id, module, key, updatedAt, [module+key]",
    });
  }
}

export const bosDb = new BOSDexie();

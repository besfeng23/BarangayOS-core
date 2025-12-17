import Dexie, { Table } from "dexie";

export type Sex = "Male" | "Female" | "Other";
export type CivilStatus = "Single" | "Married" | "Widowed" | "Separated" | "Unknown";
export type ResidentStatus = "ACTIVE" | "INACTIVE";

export type ResidentRecord = {
  id: string;
  barangayId?: string;

  createdAt: number;
  updatedAt: number;
  lastUpdated: number;

  lastName: string;
  firstName: string;
  middleName?: string;
  suffix?: string;

  lastNameNorm: string;
  firstNameNorm: string;
  fullNameNorm: string;

  sex: Sex;
  birthdate: string; // yyyy-mm-dd
  isoDate: string;   // yyyy-mm-dd (same as birthdate but locked name for search/filters)
  civilStatus: CivilStatus;

  purok: string;
  addressLine1: string;

  voterStatus?: boolean;

  searchTokens: string[];

  status: ResidentStatus;
  syncState?: "queued" | "synced" | "failed";
};

export type SyncQueueItem = {
  id: string;
  entityType: "resident" | "print_log";
  entityId: string;
  op: "UPSERT";
  payload: any;
  createdAt: number;
  updatedAt: number;
  status: "pending" | "syncing" | "failed" | "synced";
  tryCount: number;
  lastError?: string;
};

export type DraftItem = {
  id: string;
  module: "residents" | "certificates";
  key: string;
  payload: any;
  updatedAt: number;
};

export type ActivityLogItem = {
  id: string;
  createdAt: number;
  type: "RESIDENT_CREATE" | "RESIDENT_VIEW" | "RESIDENT_UPDATE" | "CERT_ISSUED";
  entityType: "resident";
  entityId: string;
  meta?: any;
};

export type CertType = "CERTIFICATE" | "CLEARANCE" | "INDIGENCY";

export type PrintLogItem = {
  id: string;
  barangayId?: string;
  createdAt: number;
  docType: CertType;
  controlNo: string;
  residentId: string;
  status: "pending" | "syncing" | "failed" | "synced";
  tryCount: number;
  lastError?: string;
  meta?: any;
};

export type Party = {
  residentId?: string; // optional link
  name: string;        // always present for display/print
};

export type BlotterStatus = "ACTIVE" | "SETTLED" | "FILED_TO_COURT" | "DISMISSED";

export type BlotterRecord = {
  id: string;
  barangayId?: string;

  createdAt: number;
  updatedAt: number;
  lastUpdated: number;

  caseNumber: string;       // YYYY-MM-XXXXXX
  incidentDate: string;     // yyyy-mm-dd
  hearingDate?: string;     // yyyy-mm-dd

  complainants: Party[];
  respondents: Party[];

  narrative: string;
  status: BlotterStatus;
  tags: string[];

  searchTokens: string[];

  syncState?: "queued" | "synced" | "failed";
};

export type BlotterPrintType = "SUMMONS" | "AMICABLE_SETTLEMENT";

export type BlotterPrintLogItem = {
  id: string;
  barangayId?: string;
  createdAt: number;

  docType: BlotterPrintType;
  controlNo: string;       // reuse YYYY-MM-XXXXXX
  blotterId: string;

  status: "pending" | "syncing" | "failed" | "synced";
  tryCount: number;
  lastError?: string;
  meta?: any;
};

class BOSDexie extends Dexie {
  residents!: Table<ResidentRecord, string>;
  syncQueue!: Table<SyncQueueItem, string>;
  activityLog!: Table<ActivityLogItem, string>;
  drafts!: Table<DraftItem, string>;
  printLogs!: Table<PrintLogItem, string>;
  blotters!: Table<BlotterRecord, string>;
  blotterPrintLogs!: Table<BlotterPrintLogItem, string>;

  constructor() {
    super("BarangayOS");

    // v1
    this.version(1).stores({
      residents:
        "id, createdAt, updatedAt, lastNameNorm, firstNameNorm, purok, status, sex, birthdate",
      syncQueue: "id, createdAt, status, entityType, entityId, [entityType+entityId]",
      activityLog: "id, createdAt, type, entityType, entityId",
    });

    // v2 drafts
    this.version(2).stores({
      residents:
        "id, createdAt, updatedAt, lastNameNorm, firstNameNorm, purok, status, sex, birthdate",
      syncQueue: "id, createdAt, status, entityType, entityId, [entityType+entityId]",
      activityLog: "id, createdAt, type, entityType, entityId",
      drafts: "id, module, key, updatedAt, [module+key]",
    });

    // v3 certificate print logs + stronger indexes for search tokens & fullNameNorm
    this.version(3).stores({
      residents:
        "id, createdAt, updatedAt, lastUpdated, lastNameNorm, firstNameNorm, fullNameNorm, purok, status, sex, isoDate, *searchTokens",
      syncQueue: "id, createdAt, status, entityType, entityId, [entityType+entityId]",
      activityLog: "id, createdAt, type, entityType, entityId",
      drafts: "id, module, key, updatedAt, [module+key]",
      printLogs: "id, createdAt, docType, controlNo, residentId, status",
    });
    
    // v4 blotter + blotter print logs
    this.version(4).stores({
      residents:
        "id, createdAt, updatedAt, lastUpdated, lastNameNorm, firstNameNorm, fullNameNorm, purok, status, sex, isoDate, *searchTokens",
      syncQueue: "id, createdAt, status, entityType, entityId, [entityType+entityId]",
      activityLog: "id, createdAt, type, entityType, entityId",
      drafts: "id, module, key, updatedAt, [module+key]",
      printLogs: "id, createdAt, docType, controlNo, residentId, status",

      blotters:
        "id, createdAt, updatedAt, lastUpdated, caseNumber, status, incidentDate, hearingDate, *searchTokens",
      blotterPrintLogs:
        "id, createdAt, docType, controlNo, blotterId, status",
    });
  }
}

export const bosDb = new BOSDexie();

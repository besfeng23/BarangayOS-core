import Dexie, { Table } from "dexie";

export type Sex = "Male" | "Female" | "Other";
export type CivilStatus = "Single" | "Married" | "Widowed" | "Separated" | "Unknown";
export type ResidentStatus = "ACTIVE" | "INACTIVE";

export type Party = {
  id?: string; // residentId when linked
  name: string; // always present for display
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

  fullNameNorm: string;      // "delacruz juan m"
  isoDate: string;           // birthdate yyyy-mm-dd
  searchTokens: string[];    // ["juan","delacruz","purok 1","...","abcd12"(id tail)]

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

  caseNumber: string; // YYYY-MM-XXXXXX hash format
  caseNumberNorm: string;

  complainants: Party[];
  respondents: Party[];

  incidentDate: number; // epoch ms
  hearingDate?: number; // epoch ms optional

  narrative: string;
  narrativeNorm: string;

  status: BlotterStatus;

  tags: string[];
  tagsNorm: string[]; // normalized tokens for search

  settlementSummary?: string;
  settlementSummaryNorm?: string;

  syncState?: "queued" | "synced" | "failed";
};

export type PrintLogItem = {
  id: string;
  createdAt: number;
  docType:
    | "CERTIFICATE"
    | "CLEARANCE"
    | "INDIGENCY"
    | "BLOTTER_SUMMONS"
    | "BLOTTER_SETTLEMENT";
  controlNo: string; // control no or case number
  residentId?: string;
  blotterId?: string;

  status: "pending" | "syncing" | "failed" | "synced";
  tryCount: number;
  lastError?: string;
  meta?: any;
};

// widen queue entityType for multi-module
export type SyncQueueItem = {
  id: string;
  entityType: "resident" | "blotter" | "print_log";
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

class BOSDexie extends Dexie {
  residents!: Table<ResidentRecord, string>;
  blotters!: Table<BlotterRecord, string>;
  printLogs!: Table<PrintLogItem, string>;

  syncQueue!: Table<SyncQueueItem, string>;
  activityLog!: Table<ActivityLogItem, string>;
  drafts!: Table<DraftItem, string>;

  constructor() {
    super("BarangayOS");

    // v1
    this.version(1).stores({
      residents: "id, createdAt, updatedAt, lastNameNorm, firstNameNorm, purok, status, sex, birthdate",
      syncQueue: "id, createdAt, status, entityType, entityId, [entityType+entityId]",
      activityLog: "id, createdAt, type, entityType, entityId",
    });

    // v2 drafts
    this.version(2).stores({
      residents: "id, createdAt, updatedAt, lastNameNorm, firstNameNorm, purok, status, sex, birthdate",
      syncQueue: "id, createdAt, status, entityType, entityId, [entityType+entityId]",
      activityLog: "id, createdAt, type, entityType, entityId",
      drafts: "id, module, key, updatedAt, [module+key]",
    });

    // v3 blotters
    this.version(3).stores({
      residents:
        "id, createdAt, updatedAt, lastNameNorm, firstNameNorm, purok, status, sex, birthdate",
      blotters:
        "id, barangayId, createdAt, lastUpdated, caseNumberNorm, status, incidentDate, hearingDate, *tagsNorm",
      syncQueue: "id, createdAt, status, entityType, entityId, [entityType+entityId]",
      activityLog: "id, createdAt, type, entityType, entityId",
      drafts: "id, module, key, updatedAt, [module+key]",
    });
    
    // v4 blotter + print logs
    this.version(4).stores({
      residents:
        "id, createdAt, updatedAt, lastUpdated, lastNameNorm, firstNameNorm, fullNameNorm, purok, status, sex, birthdateISO",
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

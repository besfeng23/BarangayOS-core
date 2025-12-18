
import Dexie, { Table } from "dexie";

export type Sex = "Male" | "Female" | "Other";
export type CivilStatus = "Single" | "Married" | "Widowed" | "Separated" | "Unknown";
export type ResidentStatus = "ACTIVE" | "INACTIVE";

export type Party = {
  // Hybrid link: either residentId OR raw name
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

  fullNameNorm: string;      // "delacruz juan m"
  lastNameNorm: string;
  firstNameNorm: string;
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
  lastUpdated: number;

  caseNumber: string; // YYYY-MM-6HASH
  caseNumberNorm: string;

  complainants: Party[];
  respondents: Party[];

  incidentDate: number; // epoch ms
  hearingDate?: number; // epoch ms

  narrative: string;
  narrativeNorm: string;

  status: BlotterStatus;

  tags: string[];
  tagsNorm: string[]; // normalized tokens for search

  settlementSummary?: string;
  settlementSummaryNorm?: string;
  settledAt?: number;

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

export type BOSSettings = {
  id: string;
  key: "barangay";
  value: {
    barangayName: string;
    barangayAddress: string;
    punongBarangay: string;
    secretaryName: string;
    trial?: {
      isTrialAccount: boolean;
      daysRemaining: number;
    };
  };
  updatedAt: number;
};


class BOSDexie extends Dexie {
  residents!: Table<ResidentRecord, string>;
  blotters!: Table<BlotterRecord, string>;
  printLogs!: Table<PrintLogItem, string>;
  settings!: Table<BOSSettings, string>;

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

    // v3: hard schema residents + blotter + print logs + multiEntry searchTokens
    this.version(3).stores({
      residents:
        "id, createdAt, lastUpdated, status, purok, sex, isoDate, fullNameNorm, *searchTokens",
      blotters:
        "id, createdAt, lastUpdated, status, caseNumber, caseNumberNorm, incidentDate, hearingDate, *tags, *searchTokens",
      printLogs:
        "id, createdAt, docType, controlNo, status",
      syncQueue:
        "id, createdAt, status, entityType, entityId, [entityType+entityId]",
      activityLog:
        "id, createdAt, type, entityType, entityId",
      drafts:
        "id, module, key, updatedAt, [module+key]",
    });
    
    // v4 FINAL for v1 DEMO
    this.version(4).stores({
      residents:
        "id, createdAt, lastUpdated, status, purok, sex, birthdate, fullNameNorm, lastNameNorm, firstNameNorm, *searchTokens",
      blotters:
        "id, createdAt, updatedAt, lastUpdated, barangayId, caseNumber, caseNumberNorm, status, incidentDate, hearingDate, *tagsNorm, *searchTokens",
      printLogs:
        "id, createdAt, barangayId, docType, controlNo, residentId, blotterId, status",
      settings: "id, key, updatedAt",
      syncQueue: "id, createdAt, status, entityType, entityId, [entityType+entityId]",
      activityLog: "id, createdAt, type, entityType, entityId",
      drafts: "id, module, key, updatedAt, [module+key]",
    });
  }
}

export const bosDb = new BOSDexie();

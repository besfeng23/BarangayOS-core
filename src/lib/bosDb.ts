import Dexie, { Table } from "dexie";

export type Sex = "Male" | "Female" | "Other";
export type CivilStatus = "Single" | "Married" | "Widowed" | "Separated" | "Unknown";
export type ResidentStatus = "ACTIVE" | "INACTIVE";

export type ResidentRecord = {
  id: string;
  createdAt: number;
  updatedAt: number;

  lastName: string;
  firstName: string;
  middleName?: string;
  suffix?: string;

  lastNameNorm: string;
  firstNameNorm: string;

  sex: Sex;
  birthdate: string; // yyyy-mm-dd
  civilStatus: CivilStatus;

  purok: string;
  addressLine1: string;

  status: ResidentStatus;
  syncState?: "queued" | "synced" | "failed";
};

export type SyncQueueItem = {
  id: string;
  entityType: "resident";
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
  module: "residents";
  key: string; // "resident:new"
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

class BOSDexie extends Dexie {
  residents!: Table<ResidentRecord, string>;
  syncQueue!: Table<SyncQueueItem, string>;
  activityLog!: Table<ActivityLogItem, string>;
  drafts!: Table<DraftItem, string>;

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
  }
}

export const bosDb = new BOSDexie();

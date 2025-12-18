import Dexie, { Table } from 'dexie';
export class BOSDatabase extends Dexie {
  residents!: Table<any>; cases!: Table<any>; audit_queue!: Table<any>;
  constructor() {
    super('BarangayOS_Local');
    this.version(1).stores({
      residents: 'id, fullNameUpper, householdNoUpper, *searchTokens, barangayId, updatedAt',
      cases: 'id, residentId, status, barangayId, updatedAt',
      audit_queue: '++id, eventType, occurredAtLocal, syncedAt'
    });
  }
}
export const db = new BOSDatabase();

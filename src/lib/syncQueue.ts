import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { logActivity } from './activityLog';

export type SyncOpType = 'create' | 'update' | 'delete';
export type SyncStatus = 'pending' | 'syncing' | 'failed' | 'synced';
export type EntityType = 'residents' | 'blotter_cases' | 'business_permits' | 'transactions';

export interface SyncQueueItem {
  id: string;
  entityType: EntityType;
  entityId: string; // The ID of the document being acted upon
  opType: SyncOpType;
  payload: any;
  status: SyncStatus;
  createdAt: number; // timestamp
  lastAttempt?: number;
  retries?: number;
  lastError?: string;
}

interface BarangayOSDB extends DBSchema {
  syncQueue: {
    key: string;
    value: SyncQueueItem;
    indexes: { status: SyncStatus; createdAt: number };
  };
}

let dbPromise: Promise<IDBPDatabase<BarangayOSDB>> | null = null;

function getDB(): Promise<IDBPDatabase<BarangayOSDB>> {
  if (!dbPromise) {
    dbPromise = openDB<BarangayOSDB>('barangayOS', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('syncQueue')) {
          const store = db.createObjectStore('syncQueue', { keyPath: 'id' });
          store.createIndex('status', 'status');
          store.createIndex('createdAt', 'createdAt');
        }
      },
    });
  }
  return dbPromise;
}

export async function addToQueue(item: Omit<SyncQueueItem, 'id' | 'status' | 'createdAt'>): Promise<string> {
  const db = await getDB();
  const id = `${item.entityType}-${item.entityId}-${Date.now()}`;
  const newItem: SyncQueueItem = {
    ...item,
    id,
    status: 'pending',
    createdAt: Date.now(),
  };
  await db.add('syncQueue', newItem);
  await logActivity(`Queued ${item.opType} for ${item.entityType}`);
  window.dispatchEvent(new CustomEvent('queue-changed'));
  return id;
}

export async function getOldestPendingItem(): Promise<SyncQueueItem | undefined> {
  const db = await getDB();
  const tx = db.transaction('syncQueue', 'readonly');
  const index = tx.store.index('createdAt');
  const cursor = await index.openCursor();
  
  // Find the first item that is 'pending' or 'failed'
  let oldestItem: SyncQueueItem | undefined;
  let currentCursor = cursor;
  while (currentCursor) {
    if (currentCursor.value.status === 'pending' || currentCursor.value.status === 'failed') {
      oldestItem = currentCursor.value;
      break; 
    }
    currentCursor = await currentCursor.continue();
  }
  await tx.done;
  return oldestItem;
}

export async function updateQueueItem(id: string, updates: Partial<Omit<SyncQueueItem, 'id'>>): Promise<void> {
  const db = await getDB();
  const item = await db.get('syncQueue', id);
  if (item) {
    const updatedItem = { ...item, ...updates, lastAttempt: Date.now() };
    await db.put('syncQueue', updatedItem);
    if(updates.status) {
       await logActivity(`Sync item ${id} status changed to ${updates.status}`);
    }
    window.dispatchEvent(new CustomEvent('queue-changed'));
  }
}

export async function getPendingCount(entityType?: string): Promise<number> {
    const db = await getDB();
    const items = await db.getAllFromIndex('syncQueue', 'status', 'pending');
    const failedItems = await db.getAllFromIndex('syncQueue', 'status', 'failed');
    const syncingItems = await db.getAllFromIndex('syncQueue', 'status', 'syncing');

    let allPending = [...items, ...failedItems, ...syncingItems];

    if (entityType) {
        allPending = allPending.filter(item => item.entityType === entityType);
    }
    return allPending.length;
}

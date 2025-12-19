import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { logActivity } from './activityLog';
import { db } from './bosDb';

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

export async function addToQueue(item: Omit<SyncQueueItem, 'id' | 'status' | 'createdAt'>): Promise<string> {
  const id = `${item.entityType}-${item.entityId}-${Date.now()}`;
  const newItem: SyncQueueItem = {
    ...item,
    id,
    status: 'pending',
    createdAt: Date.now(),
  };
  await db.sync_queue.add(newItem as any);
  await logActivity(`Queued ${item.opType} for ${item.entityType}`);
  window.dispatchEvent(new CustomEvent('queue-changed'));
  return id;
}

export async function getOldestPendingItem(): Promise<any | undefined> {
  const tx = db.transaction('sync_queue', 'readonly');
  const index = tx.store.index('createdAt');
  const cursor = await index.openCursor();
  
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
  const item = await db.sync_queue.get(id as any);
  if (item) {
    const updatedItem = { ...item, ...updates, lastAttempt: Date.now() };
    await db.sync_queue.put(updatedItem as any);
    if(updates.status) {
       await logActivity(`Sync item ${id} status changed to ${updates.status}`);
    }
    window.dispatchEvent(new CustomEvent('queue-changed'));
  }
}

export async function getPendingCount(entityType?: string): Promise<number> {
    const items = await db.sync_queue.where('status').equals('pending').toArray();
    const failedItems = await db.sync_queue.where('status').equals('failed').toArray();
    const syncingItems = await db.sync_queue.where('status').equals('syncing').toArray();

    let allPending = [...items, ...failedItems, ...syncingItems];

    if (entityType) {
        allPending = allPending.filter(item => item.entityType === entityType);
    }
    return allPending.length;
}

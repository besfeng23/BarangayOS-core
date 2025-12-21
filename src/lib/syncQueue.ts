import { db } from './bosDb';
import type { SyncQueueItem } from './bosDb';

export type SyncOpType = 'create' | 'update' | 'delete';
export type SyncStatus = 'pending' | 'syncing' | 'failed' | 'synced';
export type EntityType = 'residents' | 'blotter_cases' | 'business_permits' | 'transactions';

export { type SyncQueueItem };

export async function addToQueue(item: Omit<SyncQueueItem, 'id' | 'status' | 'occurredAtISO' | 'synced'>): Promise<number> {
  const newItem: any = { // Using 'any' to match Dexie's flexible add method
    ...item,
    status: 'pending',
    occurredAtISO: new Date().toISOString(),
    synced: 0,
  };
  const newId = await db.sync_queue.add(newItem);
  window.dispatchEvent(new CustomEvent('queue-changed'));
  return newId;
}

export async function getOldestPendingItem(): Promise<SyncQueueItem | undefined> {
  const pendingItems = await db.sync_queue
    .where('status')
    .anyOf('pending', 'failed')
    .sortBy('occurredAtISO');
  
  return pendingItems[0];
}

export async function updateQueueItem(id: number, updates: Partial<Omit<SyncQueueItem, 'id'>>): Promise<void> {
  await db.sync_queue.update(id, updates);
  window.dispatchEvent(new CustomEvent('queue-changed'));
}

export async function getPendingCount(entityType?: string): Promise<number> {
  let query = db.sync_queue.where('status').anyOf(['pending', 'failed', 'syncing']);
  
  if (entityType) {
    return query.filter(item => item.entityType === entityType).count();
  }

  return query.count();
}

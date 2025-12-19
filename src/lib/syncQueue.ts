import { db } from './bosDb';
import { logActivity } from './activityLog';
import type { SyncQueueItem } from './bosDb';

export type SyncOpType = 'create' | 'update' | 'delete';
export type SyncStatus = 'pending' | 'syncing' | 'failed' | 'synced';
export type EntityType = 'residents' | 'blotter_cases' | 'business_permits' | 'transactions';

export { type SyncQueueItem };

export async function addToQueue(item: Omit<SyncQueueItem, 'id' | 'status' | 'createdAt'>): Promise<string> {
  const id = `${item.entityType}-${item.entityId}-${Date.now()}`;
  const newItem: any = { // Using 'any' to match Dexie's flexible add method
    ...item,
    id,
    status: 'pending',
    createdAt: Date.now(),
  };
  await db.sync_queue.add(newItem);
  await logActivity(`Queued ${item.opType} for ${item.entityType}`);
  window.dispatchEvent(new CustomEvent('queue-changed'));
  return id;
}

export async function getOldestPendingItem(): Promise<SyncQueueItem | undefined> {
  // Dexie-native way, which is safer and more efficient.
  // It uses the compound index `[status+occurredAtISO]` if available,
  // or falls back to filtering by `status` and then sorting in-memory.
  const pendingItems = await db.sync_queue
    .where('status')
    .anyOf(['pending', 'failed'])
    .sortBy('occurredAtISO');
  
  return pendingItems[0];
}

export async function updateQueueItem(id: number, updates: Partial<Omit<SyncQueueItem, 'id'>>): Promise<void> {
  const item = await db.sync_queue.get(id);
  if (item) {
    const updatedItem: any = { ...item, ...updates, lastAttempt: Date.now() };
    await db.sync_queue.put(updatedItem);
    if(updates.status) {
       await logActivity(`Sync item ${id} status changed to ${updates.status}`);
    }
    window.dispatchEvent(new CustomEvent('queue-changed'));
  }
}

export async function getPendingCount(entityType?: string): Promise<number> {
  let query = db.sync_queue.where('status').anyOf(['pending', 'failed', 'syncing']);
  
  if (entityType) {
    // This filter will be applied in-memory after the initial index query.
    return query.filter(item => item.entityType === entityType).count();
  }

  return query.count();
}

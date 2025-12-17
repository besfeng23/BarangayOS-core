'use client';
import { useEffect } from 'react';
import { useNetworkStatus } from './useNetworkStatus';
import {
  getOldestPendingItem,
  updateQueueItem,
  SyncQueueItem,
} from '@/lib/syncQueue';
import { addDoc, collection, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useToast } from './use-toast';

let isWorkerRunning = false;

const processQueueItem = async (item: SyncQueueItem): Promise<void> => {
  await updateQueueItem(item.id, { status: 'syncing' });

  try {
    let collectionRef;
    switch (item.opType) {
      case 'create':
        collectionRef = collection(db, item.entityType);
        await addDoc(collectionRef, item.payload);
        break;
      case 'update':
        const docRef = doc(db, item.entityType, item.entityId);
        await setDoc(docRef, item.payload, { merge: true });
        break;
      // Add 'delete' case if needed
      default:
        throw new Error(`Unsupported operation type: ${item.opType}`);
    }

    await updateQueueItem(item.id, { status: 'synced' });
    
  } catch (error: any) {
    console.error('Sync failed for item:', item.id, error);
    await updateQueueItem(item.id, {
      status: 'failed',
      lastError: error.message || 'An unknown error occurred',
    });
    // Re-throw to stop the current sync cycle on failure
    throw error;
  }
};


const runSyncCycle = async (toast: any) => {
  if (isWorkerRunning) return;
  isWorkerRunning = true;
  
  toast({ title: 'Sync started...' });

  try {
    let itemToProcess = await getOldestPendingItem();
    while (itemToProcess) {
      await processQueueItem(itemToProcess);
      itemToProcess = await getOldestPendingItem();
    }
    toast({ title: 'Sync complete!', description: 'All local changes are saved to the cloud.' });
  } catch (error) {
    console.error('Sync cycle interrupted by an error.');
    toast({ variant: 'destructive', title: 'Sync Paused', description: 'Could not save some changes. Will retry later.' });
  } finally {
    isWorkerRunning = false;
    // Dispatch a custom event to notify components that the queue has changed
    window.dispatchEvent(new CustomEvent('queue-changed'));
  }
};

export function useSyncWorker() {
  const { isOnline } = useNetworkStatus();
  const { toast } = useToast();

  useEffect(() => {
    if (isOnline) {
      // Use a timeout to debounce and prevent rapid-fire sync cycles
      const timer = setTimeout(() => {
        runSyncCycle(toast);
      }, 2000); // Wait 2 seconds after coming online to start sync

      return () => clearTimeout(timer);
    }
  }, [isOnline, toast]);
}

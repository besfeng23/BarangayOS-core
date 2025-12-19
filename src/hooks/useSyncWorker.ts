'use client';
import { useEffect } from 'react';
import { useNetworkStatus } from './useNetworkStatus';
import { getOldestPendingItem, updateQueueItem, SyncQueueItem } from '@/lib/syncQueue';
import { addDoc, collection, doc, setDoc } from 'firebase/firestore';
import { db as firestoreDb } from '@/lib/firebase/client';
import { db } from '@/lib/bosDb'; // Correct import for Dexie
import { useToast } from './use-toast';
import { writeActivity } from '@/lib/bos/activity/writeActivity';

let isWorkerRunning = false;

const processQueueItem = async (item: SyncQueueItem): Promise<void> => {
  await updateQueueItem(item.id, { status: 'syncing' });

  try {
    let collectionName = item.entityType; // e.g. "residents"
    const opType = item.opType; 
    const entityType = item.entityType;
    const entityId = item.entityId;
    const payload = item.payload;

    if (!entityType || !entityId) {
      throw new Error(`Sync item ${item.id} is missing entityType or entityId.`);
    }

    // Handle specific job types
    switch (item.jobType) {
      case 'BLOTTER_UPSERT':
        collectionName = 'blotters';
        break;
      case 'BUSINESS_UPSERT':
        collectionName = 'businesses';
        break;
      case 'PERMIT_ISSUANCE_UPSERT':
        collectionName = 'permit_issuances';
        break;
      case 'CERT_ISSUANCE_UPSERT':
        collectionName = 'certificate_issuances';
        break;
      case 'ACTIVITY_UPSERT':
        collectionName = 'activity_log';
        break;
       case 'PRINTJOB_UPSERT':
        collectionName = 'printJobs';
        // Exclude full HTML from Firestore payload for efficiency
        const { html, ...printJobPayload } = payload;
        await setDoc(doc(firestoreDb, collectionName, entityId), printJobPayload, { merge: true });
        await updateQueueItem(item.id, { status: 'synced', synced: 1 });
        return; // Early return for this specific case
      case 'PRINTLOG_ADD':
        collectionName = 'printLogs';
        await addDoc(collection(firestoreDb, collectionName), payload);
        await updateQueueItem(item.id, { status: 'synced', synced: 1 });
        return; // Early return for this specific case
      default:
        // Default behavior for generic create/update
        if (!opType) {
            throw new Error(`Unsupported jobType: ${item.jobType}`);
        }
        break;
    }
    
    // Default upsert logic for most entities
    const docRef = doc(firestoreDb, collectionName, entityId);
    await setDoc(docRef, payload, { merge: true });

    await updateQueueItem(item.id, { status: 'synced', synced: 1 });
    
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
  
  await writeActivity({ type:"SYNC_STARTED", entityType:"sync", entityId:"sync", status:"ok", title:"Sync started", subtitle:"Uploading queued changes…" });
  toast({ title: 'Sync started...' });

  try {
    let itemToProcess = await getOldestPendingItem();
    while (itemToProcess) {
      await processQueueItem(itemToProcess);
      itemToProcess = await getOldestPendingItem();
    }
    
    await db.meta.put({ key: "lastSyncAt", value: Date.now() });

    await writeActivity({ type:"SYNC_COMPLETE", entityType:"sync", entityId:"sync", status:"ok", title:"Sync complete", subtitle:"All local changes saved to cloud." });
    toast({ title: 'Sync complete!', description: 'All local changes are saved to the cloud.' });
  } catch (error: any) {
    console.error('Sync cycle interrupted by an error.', error);
    await writeActivity({ type:"SYNC_PAUSED", entityType:"sync", entityId:"sync", status:"warn", title:"Sync paused", subtitle: (error?.message ?? "Could not save some changes. Will retry later.") });
    toast({ variant: 'destructive', title: 'Sync Paused', description: 'Could not save some changes. Will retry later.' });
  } finally {
    isWorkerRunning = false;
    window.dispatchEvent(new CustomEvent('queue-changed'));
  }
};

export function useSyncWorker() {
  const { isOnline } = useNetworkStatus();
  const { toast } = useToast();

  useEffect(() => {
    if (isOnline) {
      const timer = setTimeout(() => {
        runSyncCycle(toast);
      }, 2000); 

      return () => clearTimeout(timer);
    }
  }, [isOnline, toast]);
}

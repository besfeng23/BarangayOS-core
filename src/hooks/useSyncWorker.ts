'use client';
import { useEffect } from 'react';
import { useNetworkStatus } from './useNetworkStatus';
import { getOldestPendingItem, updateQueueItem, SyncQueueItem } from '@/lib/syncQueue';
import { addDoc, collection, doc, setDoc } from 'firebase/firestore';
import { db as firestoreDb } from '@/lib/firebase/client';
import { db } from '@/lib/bosDb';
import { useToast } from './use-toast';
import { writeActivity } from '@/lib/bos/activity/writeActivity';

let isWorkerRunning = false;

const processQueueItem = async (item: SyncQueueItem): Promise<void> => {
  await updateQueueItem(item.id, { status: 'syncing' });

  try {
    let collectionName;
    const { jobType, payload, entityType, entityId } = item;

    switch (jobType) {
      case 'SETTINGS_UPSERT':
        await setDoc(doc(firestoreDb, "settings", "barangaySettings"), payload, { merge: true });
        break;
      case 'ACTIVITY_UPSERT':
        await setDoc(doc(firestoreDb, "activity_log", entityId), payload, { merge: true });
        break;
      case 'BLOTTER_UPSERT':
        await setDoc(doc(firestoreDb, "blotters", entityId), payload, { merge: true });
        break;
      case 'BUSINESS_UPSERT':
        await setDoc(doc(firestoreDb, "businesses", entityId), payload, { merge: true });
        break;
      case 'PERMIT_ISSUANCE_UPSERT':
        await setDoc(doc(firestoreDb, "permit_issuances", entityId), payload, { merge: true });
        break;
      case 'CERT_ISSUANCE_UPSERT':
        await setDoc(doc(firestoreDb, "certificate_issuances", entityId), payload, { merge: true });
        break;
      case 'PRINTJOB_UPSERT':
        const { html, ...printJobPayload } = payload;
        await setDoc(doc(firestoreDb, "printJobs", entityId), printJobPayload, { merge: true });
        break;
      case 'PRINTLOG_ADD':
        await addDoc(collection(firestoreDb, "printLogs"), payload);
        break;
       case 'RESIDENT_CREATE':
       case 'RESIDENT_UPDATE':
        await setDoc(doc(firestoreDb, "residents", entityId), payload, { merge: true });
        break;
      default:
        console.warn(`Unsupported jobType: ${jobType}`);
        throw new Error(`Unsupported jobType: ${jobType}`);
    }

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

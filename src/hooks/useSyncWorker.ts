'use client';
import { useEffect } from 'react';
import { useNetworkStatus } from './useNetworkStatus';
import { getOldestPendingItem, updateQueueItem, SyncQueueItem } from '@/lib/syncQueue';
import { doc, setDoc } from 'firebase/firestore';
import { db as firestoreDb } from '@/lib/firebase/client';
import { db } from '@/lib/bosDb';
import { useToast } from './use-toast';
import { writeActivity } from '@/lib/bos/activity/writeActivity';
import { recordError } from '@/lib/bos/errors/errorBus';
import { cleanForStorage } from '@/lib/bos/dbUtils';

let isWorkerRunning = false;

const getCollectionName = (jobType: string): string => {
    const map: { [key: string]: string } = {
      'ACTIVITY_UPSERT': "activity_log",
      'BLOTTER_UPSERT': "blotters",
      'BUSINESS_UPSERT': "businesses",
      'PERMIT_ISSUANCE_UPSERT': "permit_issuances",
      'CERT_ISSUANCE_UPSERT': "certificate_issuances",
      'DEVICE_UPSERT': 'devices',
      'SETTINGS_UPSERT': 'settings',
      'RESIDENT_UPSERT': 'residents',
      'PRINTJOB_UPSERT': 'printJobs',
      'PRINTLOG_ADD': 'printLogs',
    };
    const collection = map[jobType];
    if (!collection) throw new Error(`Unsupported jobType for sync: ${jobType}`);
    return collection;
}

const processQueueItem = async (item: SyncQueueItem): Promise<boolean> => {
  if (item.id === undefined) {
    recordError("sync-worker", "Queue item is missing an ID");
    return false;
  }

  await updateQueueItem(item.id, { status: 'syncing' });

  try {
    const { jobType, payload, entityId } = item;
    const id = entityId || payload.id;
    
    if (!id && jobType !== 'SETTINGS_UPSERT') {
        throw new Error(`Missing entityId or payload.id for jobType ${jobType}`);
    }

    const collectionName = getCollectionName(jobType);
    
    // Settings has a fixed doc ID, others use their entity ID
    const docRef = jobType === 'SETTINGS_UPSERT'
        ? doc(firestoreDb, `barangays/TEST-BARANGAY-1/config/identity`)
        : doc(firestoreDb, `barangays/TEST-BARANGAY-1/${collectionName}`, id);

    // Ensure payload is clean before sending to Firestore
    const cleanedPayload = cleanForStorage(payload);

    await setDoc(docRef, cleanedPayload, { merge: true });

    await updateQueueItem(item.id, { status: 'synced', synced: 1 });
    return true;

  } catch (error: any) {
    console.error('Sync failed for item:', item.id, error);
    recordError("sync", `Job ${item.jobType} (ID: ${item.id}) failed: ${error.message}`);
    
    await updateQueueItem(item.id, {
      status: 'failed',
      lastError: error.message || 'An unknown error occurred',
      tryCount: (item.tryCount || 0) + 1,
    });
    
    return false; // Indicate failure for this item
  }
};


const runSyncCycle = async (toast: any) => {
  if (isWorkerRunning) return;
  isWorkerRunning = true;
  
  await writeActivity({ type:"SYNC_STARTED", entityType:"sync", entityId:"sync", status:"ok", title:"Sync started", subtitle:"Uploading queued changes…" });
  toast({ title: 'Sync started...' });
  let successCount = 0;
  let failureCount = 0;

  try {
    let itemToProcess = await getOldestPendingItem();
    while (itemToProcess) {
      const success = await processQueueItem(itemToProcess);
      if (success) {
        successCount++;
      } else {
        failureCount++;
      }
      itemToProcess = await getOldestPendingItem();
    }
    
    await db.meta.put({ key: "lastSyncAt", value: Date.now() });

    if (failureCount > 0) {
        await writeActivity({ type:"SYNC_PAUSED", entityType:"sync", entityId:"sync", status:"warn", title:"Sync Partially Complete", subtitle: `${failureCount} item(s) failed. Will retry later.` });
        toast({ variant: 'destructive', title: 'Sync Partially Complete', description: `${failureCount} record(s) failed to sync. They will be retried.` });
    } else if (successCount > 0) {
        await writeActivity({ type:"SYNC_COMPLETE", entityType:"sync", entityId:"sync", status:"ok", title:"Sync complete", subtitle:"All local changes saved to cloud." });
        toast({ title: 'Sync complete!', description: 'All local changes are saved to the cloud.' });
    } else {
        toast({ title: 'Nothing to sync', description: 'Your records are already up to date.' });
    }
    
  } catch (error: any) {
    console.error('Sync cycle was interrupted by a fatal error.', error);
    await db.meta.put({ key: "lastSyncError", value: error.message });
    recordError("sync-worker", `Fatal error in sync cycle: ${error.message}`);
    toast({ variant: 'destructive', title: 'Sync Worker Error', description: 'A critical error occurred. Please check system status.' });
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
      }, 5000); 

      return () => clearTimeout(timer);
    }
  }, [isOnline, toast]);
}

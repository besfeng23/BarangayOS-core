
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

let isWorkerRunning = false;

const processQueueItem = async (item: SyncQueueItem): Promise<boolean> => {
  if (item.id === undefined) throw new Error("Queue item is missing an ID");

  await updateQueueItem(item.id, { status: 'syncing' });

  try {
    const { jobType, payload, entityId } = item;
    
    // Normalize ID retrieval
    const id = entityId || payload.id;
    if (!id) {
        // Special case for settings which has a fixed key
        if(jobType !== 'SETTINGS_UPSERT') {
          throw new Error(`Missing entityId or payload.id for jobType ${jobType}`);
        }
    }


    // This is a simplified mapping. In a real app, you might have a more robust system.
    const collectionMap: { [key: string]: string } = {
        'SETTINGS_UPSERT': "settings",
        'ACTIVITY_UPSERT': "activity_log",
        'BLOTTER_UPSERT': "blotter_cases",
        'BUSINESS_UPSERT': "businesses",
        'PERMIT_ISSUANCE_UPSERT': "permit_issuances",
        'CERT_ISSUANCE_UPSERT': "certificate_issuances",
        'PRINTJOB_UPSERT': "printJobs",
        'PRINTLOG_ADD': 'printLogs',
        'RESIDENT_CREATE': "residents",
        'RESIDENT_UPDATE': "residents",
        'RESIDENT_UPSERT': 'residents', // Add this alias
    };

    const collectionName = collectionMap[jobType];
    if (!collectionName) {
        throw new Error(`Unsupported jobType: ${jobType}`);
    }

    const docRef = collectionName === 'settings' 
        ? doc(firestoreDb, "settings", "barangaySettings") // Settings has a fixed doc ID
        : doc(firestoreDb, collectionName, id);

    const { html, ...payloadWithoutHtml } = payload;
    await setDoc(docRef, payloadWithoutHtml, { merge: true });

    await updateQueueItem(item.id, { status: 'synced', synced: 1 });
    return true;

  } catch (error: any) {
    if (item.id === undefined) throw new Error("Queue item is missing an ID");
    console.error('Sync failed for item:', item.id, error);
    recordError("sync", `Job ${item.jobType} (ID: ${item.id}) failed: ${error.message}`);
    
    await updateQueueItem(item.id, {
      status: 'failed',
      lastError: error.message || 'An unknown error occurred',
      tryCount: (item.tryCount || 0) + 1,
    });
    
    // Return false to indicate failure for this item, but allow the loop to continue.
    return false;
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

      // Check for next item regardless of previous outcome
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
    // This block now only catches fatal errors in the runSyncCycle logic itself
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
      // Small delay to allow the network status to stabilize and avoid rapid-fire syncs
      const timer = setTimeout(() => {
        runSyncCycle(toast);
      }, 5000); 

      return () => clearTimeout(timer);
    }
  }, [isOnline, toast]);
}

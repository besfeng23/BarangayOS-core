
'use client';

import { db, DB_VERSION } from '@/lib/bosDb';
import { getRecentErrors } from '@/lib/bos/errors/errorBus';
import { getSettingsSnapshot } from '@/lib/bos/print/getSettingsSnapshot';

/**
 * STATUS RULES:
 * - OK: The module's essential local database stores exist and are queryable. Core actions are expected to work offline.
 * - WARN: The module is mostly functional, but a non-critical issue was detected (e.g., a missing index, which might slow down searches but not break the app).
 * - BROKEN: A critical local database store is missing, meaning the module cannot function offline and will likely crash. This requires a database migration/update.
 */

export type ModuleStatus = {
  name: string;
  route: string;
  state: "OK" | "WARN" | "BROKEN";
  notes: string[];
  quickActions: { label: string; href: string }[];
};

export type SystemStatus = {
  nowISO: string;
  app: {
    nextVersion: string | null;
    nodeEnv: string | null;
    buildId: string | null;
  };
  modules: ModuleStatus[];
  dexie: {
    dbName: string;
    version: number | null;
    stores: { name: string; exists: boolean; count: number | null; note?: string }[];
  };
  sync: {
    pending: number | null;
    syncing: number | null;
    failed: number | null;
    oldestPendingCreatedAt: number | null;
    lastSyncAt: string | null;
    lastError: string | null;
  };
  print: {
    printLogsCount: number | null;
    lastPrintAt: string | null;
    templatesReady: boolean;
    notes: string[];
  };
  settings: {
    barangayName: string | null;
    barangayAddress: string | null;
    punongBarangay: string | null;
    secretaryName: string | null;
    trialEnabled: boolean | null;
    daysRemaining: number | null;
  };
  errors: {
    recent: { atISO: string; source: string; message: string }[];
  };
};

// List of all stores the application expects to exist.
const EXPECTED_STORES = [
  'residents',
  'blotters',
  'businesses',
  'permit_issuances',
  'certificate_issuances',
  'print_jobs',
  'activity_log',
  'settings',
  'meta',
  'sync_queue',
  'audit_queue',
  'devices',
  'clinic_queue'
];

export async function getSystemStatus(): Promise<SystemStatus> {
  const nowISO = new Date().toISOString();

  // --- Dexie Health ---
  const dexieStatus: SystemStatus['dexie'] = {
    dbName: db.name,
    version: null,
    stores: [],
  };
  try {
    if (!db.isOpen()) await db.open();
    dexieStatus.version = db.verno;
    const existingStoreNames = new Set(db.tables.map(t => t.name));
    for (const storeName of EXPECTED_STORES) {
      const exists = existingStoreNames.has(storeName);
      let count = null;
      let note: string | undefined;
      if (exists) {
        try {
          count = await db.table(storeName).count();
        } catch (e: any) {
          note = `Count failed: ${e.message}`;
        }
      } else {
        note = "Missing store - migration required.";
      }
      dexieStatus.stores.push({ name: storeName, exists, count, note });
    }
  } catch (e: any) {
    // Total DB failure
    dexieStatus.stores.push({ name: 'DATABASE', exists: false, count: null, note: `DB open failed: ${e.message}` });
  }

  const storeExists = (name: string) => dexieStatus.stores.find(s => s.name === name)?.exists ?? false;

  // --- Sync Health ---
  const syncStatus: SystemStatus['sync'] = {
    pending: null,
    syncing: null,
    failed: null,
    oldestPendingCreatedAt: null,
    lastSyncAt: null,
    lastError: null,
  };
  if (storeExists('sync_queue')) {
    try {
      syncStatus.pending = await db.sync_queue.where('status').equals('pending').count();
      syncStatus.syncing = await db.sync_queue.where('status').equals('syncing').count();
      syncStatus.failed = await db.sync_queue.where('status').equals('failed').count();
      const oldest = await db.sync_queue.where('status').equals('pending').sortBy('occurredAtISO');
      if (oldest.length > 0) {
        syncStatus.oldestPendingCreatedAt = new Date(oldest[0].occurredAtISO).getTime();
      }
    } catch (e: any) {
      // Index probably missing
    }
  }
  if (storeExists('meta')) {
      try {
        const lastSyncRow = await db.meta.get('lastSyncAt');
        if(lastSyncRow) syncStatus.lastSyncAt = new Date(lastSyncRow.value).toISOString();
        const lastErrorRow = await db.meta.get('lastSyncError');
        if(lastErrorRow) syncStatus.lastError = lastErrorRow.value;
      } catch(e) {
          console.warn("Could not read from meta table", e);
      }
  }


  // --- Settings ---
  const settings = await getSettingsSnapshot();
  
  // --- Module Status ---
  const modules: ModuleStatus[] = [
      { name: 'Residents', route: '/residents', state: storeExists('residents') ? 'OK' : 'BROKEN', notes: [!storeExists('residents') ? "Resident table missing." : ""], quickActions: [] },
      { name: 'Certificates', route: '/certificates', state: storeExists('certificate_issuances') && storeExists('print_jobs') ? 'OK' : 'BROKEN', notes: [!storeExists('certificate_issuances') ? "Certificate table missing." : ""], quickActions: [] },
      { name: 'Blotter', route: '/blotter', state: storeExists('blotters') ? 'OK' : 'BROKEN', notes: [!storeExists('blotters') ? "Blotter table missing." : ""], quickActions: [] },
      { name: 'Business Permits', route: '/permits', state: storeExists('businesses') && storeExists('permit_issuances') ? 'OK' : 'BROKEN', notes: [!storeExists('businesses') ? "Business table missing." : ""], quickActions: [] },
      { name: 'Print Center', route: '/print', state: storeExists('print_jobs') ? 'OK' : 'BROKEN', notes: [!storeExists('print_jobs') ? "Print queue missing." : ""], quickActions: [] },
      { name: 'Activity History', route: '/history', state: storeExists('activity_log') ? 'OK' : 'BROKEN', notes: [!storeExists('activity_log') ? "Activity log missing." : ""], quickActions: [] },
      { name: 'Settings', route: '/settings', state: storeExists('settings') ? 'OK' : 'BROKEN', notes: [!storeExists('settings') ? "Settings table missing." : ""], quickActions: [] },
  ];

  return {
    nowISO,
    app: {
      nextVersion: process.env.NEXT_PUBLIC_VERSION || null,
      nodeEnv: process.env.NODE_ENV || null,
      buildId: process.env.NEXT_PUBLIC_BUILD_ID || null,
    },
    modules,
    dexie: dexieStatus,
    sync: syncStatus,
    print: { // Dummy data for now
      printLogsCount: await (storeExists('print_jobs') ? db.print_jobs.count() : Promise.resolve(0)),
      lastPrintAt: null,
      templatesReady: true,
      notes: [],
    },
    settings: {
      barangayName: settings.barangayName,
      barangayAddress: settings.barangayAddress,
      punongBarangay: settings.punongBarangay,
      secretaryName: settings.secretaryName,
      trialEnabled: settings.trialEnabled,
      daysRemaining: settings.trialDaysRemaining,
    },
    errors: {
      recent: getRecentErrors(),
    },
  };
}

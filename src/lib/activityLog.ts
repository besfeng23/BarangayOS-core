import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface ActivityLogDB extends DBSchema {
  activityLog: {
    key: string;
    value: {
      id: string;
      message: string;
      createdAt: string; // ISO string
    };
    indexes: { createdAt: string };
  };
}

let dbPromise: Promise<IDBPDatabase<ActivityLogDB>> | null = null;

function getDB(): Promise<IDBPDatabase<ActivityLogDB>> {
  if (!dbPromise) {
    dbPromise = openDB<ActivityLogDB>('barangayOS', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('activityLog')) {
          const store = db.createObjectStore('activityLog', {
            keyPath: 'id',
          });
          store.createIndex('createdAt', 'createdAt');
        }
      },
    });
  }
  return dbPromise;
}

export async function logActivity(message: string): Promise<void> {
  const db = await getDB();
  const id = `log-${Date.now()}-${Math.random()}`;
  await db.put('activityLog', {
    id,
    message,
    createdAt: new Date().toISOString(),
  });
  window.dispatchEvent(new CustomEvent('activity-log-changed'));
}

export async function getLogs(limit = 50) {
  const db = await getDB();
  return db.getAllFromIndex('activityLog', 'createdAt', undefined, limit, 'prev');
}

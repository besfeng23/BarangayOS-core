
import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface Draft {
  id: string;
  residentName: string;
  residentRef?: string;
  type: string; // e.g., 'Barangay Clearance'
  updatedAt: string; // ISO string
  routeToResume: string;
  payload: any;
}

interface DraftsDB extends DBSchema {
  drafts: {
    key: string;
    value: Draft;
    indexes: { updatedAt: string };
  };
}

let dbPromise: Promise<IDBPDatabase<DraftsDB>> | null = null;

function getDB(): Promise<IDBPDatabase<DraftsDB>> {
  if (!dbPromise) {
    dbPromise = openDB<DraftsDB>('barangayOS', 4, {
      upgrade(db) {
        // This upgrade logic is now managed in bosDb.ts,
        // but we ensure this file doesn't cause issues if it's the first to run.
        if (!db.objectStoreNames.contains('drafts')) {
          const store = db.createObjectStore('drafts', { keyPath: 'id' });
          store.createIndex('updatedAt', 'updatedAt');
        }
      },
    });
  }
  return dbPromise;
}

export async function saveDraft(draft: Omit<Draft, 'updatedAt'>): Promise<void> {
  const db = await getDB();
  const fullDraft: Draft = {
    ...draft,
    updatedAt: new Date().toISOString(),
  };
  await db.put('drafts', fullDraft);
  window.dispatchEvent(new CustomEvent('drafts-changed'));
}

export async function getDraft(id: string): Promise<Draft | undefined> {
  const db = await getDB();
  return db.get('drafts', id);
}

export async function getAllDrafts(): Promise<Draft[]> {
  const db = await getDB();
  // The 'prev' direction is not a valid argument for getAllFromIndex.
  // To get items in reverse order, we must use a cursor.
  const tx = db.transaction('drafts', 'readonly');
  const index = tx.store.index('updatedAt');
  const drafts: Draft[] = [];
  let cursor = await index.openCursor(null, 'prev');
  while (cursor) {
    drafts.push(cursor.value);
    cursor = await cursor.continue();
  }
  await tx.done;
  return drafts;
}

export async function deleteDraft(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('drafts', id);
  window.dispatchEvent(new CustomEvent('drafts-changed'));
}

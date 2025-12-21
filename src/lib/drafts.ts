

import { db, DraftRow } from './bosDb';

// Re-exporting for any files that might have been using the old type directly
export type Draft = DraftRow;

export async function saveDraft(draft: Omit<Draft, 'updatedAt'>): Promise<void> {
  const fullDraft: Draft = {
    ...draft,
    updatedAt: Date.now(),
  };
  await db.drafts.put(fullDraft);
  window.dispatchEvent(new CustomEvent('drafts-changed'));
}

export async function getDraft(id: string): Promise<Draft | undefined> {
  return db.drafts.get(id);
}

export async function getAllDrafts(): Promise<Draft[]> {
  // Get all drafts and sort by most recently updated
  return db.drafts.orderBy('updatedAt').reverse().toArray();
}

export async function deleteDraft(id: string): Promise<void> {
  await db.drafts.delete(id);
  window.dispatchEvent(new CustomEvent('drafts-changed'));
}

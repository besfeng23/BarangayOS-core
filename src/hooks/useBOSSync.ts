import { useEffect } from 'react';
import { db } from '@/lib/bosDb'; // Corrected import
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { firestore } from '@/firebase';
export function useBOSSync(barangayId: string) {
  useEffect(() => {
    if (!barangayId) return;
    const qResidents = query(collection(firestore, 'residents'), where('barangayId', '==', barangayId));
    const unsubResidents = onSnapshot(qResidents, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        const data = change.doc.data();
        if (change.type === 'removed') await db.residents.delete(change.doc.id);
        else await db.residents.put({
          ...data, id: change.doc.id,
          fullNameUpper: (data.displayName || '').toUpperCase(),
          searchTokens: (data.displayName || '').toUpperCase().split(' ')
        } as any);
      });
    });
    // Note: 'cases' table doesn't exist in the provided Dexie schema. 
    // This will error if not added. Assuming it should be 'blotters'.
    const qCases = query(collection(firestore, 'blotter_cases'), where('barangayId', '==', barangayId));
    const unsubCases = onSnapshot(qCases, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'removed') await db.blotters.delete(change.doc.id);
        else await db.blotters.put({ ...change.doc.data(), id: change.doc.id } as any);
      });
    });
    return () => { unsubResidents(); unsubCases(); };
  }, [barangayId]);
}

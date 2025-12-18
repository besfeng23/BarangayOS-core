import { useEffect } from 'react';
import { db } from '../lib/db';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db as firestore } from '@/lib/firebase/client';

export function useBOSSync(barangayId: string) {
  useEffect(() => {
    if (!barangayId) return;

    const qResidents = query(collection(firestore, 'residents'), where('barangayId', '==', barangayId));
    const unsubResidents = onSnapshot(qResidents, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        const data = change.doc.data();
        if (change.type === 'removed') {
          await db.residents.delete(change.doc.id);
        } else {
          await db.residents.put({
            ...data,
            id: change.doc.id,
            fullNameUpper: (data.displayName || '').toUpperCase(),
            searchTokens: (data.displayName || '').toUpperCase().split(' ')
          });
        }
      });
    });

    const qCases = query(collection(firestore, 'blotter_cases'), where('barangayId', '==', barangayId));
    const unsubCases = onSnapshot(qCases, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'removed') {
          await db.cases.delete(change.doc.id);
        } else {
          await db.cases.put({ ...change.doc.data(), id: change.doc.id });
        }
      });
    });

    return () => {
      unsubResidents();
      unsubCases();
    };
  }, [barangayId]);
}

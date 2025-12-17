'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useDebounce } from './useDebounce';
import { Resident, BlotterCase, BusinessPermit } from '@/lib/firebase/schema';

export interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  href: string;
}

export function useSearch(term: string) {
  const [results, setResults] = useState<{ [key: string]: SearchResult[] }>({
    residents: [],
    blotter: [],
    permits: [],
  });
  const [loading, setLoading] = useState(false);
  const debouncedTerm = useDebounce(term, 300);

  useEffect(() => {
    if (debouncedTerm.length < 3) {
      setResults({ residents: [], blotter: [], permits: [] });
      setLoading(false);
      return;
    }

    setLoading(true);

    const lowerDebouncedTerm = debouncedTerm.toLowerCase();
    
    // Residents Search
    const residentsQuery = query(
      collection(db, 'residents'),
      where('displayNameLower', '>=', lowerDebouncedTerm),
      where('displayNameLower', '<=', lowerDebouncedTerm + '\uf8ff'),
      limit(5)
    );

    const unsubResidents = onSnapshot(residentsQuery, (snapshot) => {
      const residentResults = snapshot.docs.map(doc => {
        const data = doc.data() as Resident;
        return {
          id: data.id,
          title: data.displayName,
          subtitle: `RBI ID: ${data.rbiId}`,
          href: `/residents?id=${data.id}`,
        };
      });
      setResults(prev => ({...prev, residents: residentResults }));
    });
    
    // For now, blotter and permits are placeholders.
    // A real implementation would require a more complex search strategy
    // or denormalized search fields in Firestore.
    // For the demo, we simulate finding something if the term is 'test'.
    if (lowerDebouncedTerm.includes('test')) {
         setResults(prev => ({
             ...prev, 
             blotter: [{
                id: 'test-blotter-1',
                title: 'Noise Complaint',
                subtitle: 'Case #BC-12345',
                href: '/blotter'
            }],
            permits: [{
                id: 'test-permit-1',
                title: "Aling Nena's Store",
                subtitle: 'Permit #BP-67890',
                href: '/permits'
            }]
        }));
    } else {
         setResults(prev => ({...prev, blotter: [], permits: [] }));
    }


    // Combine loading states
    const timer = setTimeout(() => setLoading(false), 500); // Simulate loading

    return () => {
      unsubResidents();
      clearTimeout(timer);
    };
  }, [debouncedTerm]);

  return { results, loading };
}

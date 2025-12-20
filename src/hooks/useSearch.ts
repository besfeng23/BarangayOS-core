'use client';

import { useState, useEffect } from 'react';
import { db as localDb } from '@/lib/bosDb';
import { useDebounce } from './useDebounce';

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

    const performSearch = async () => {
      const upperTerm = debouncedTerm.toUpperCase();
      try {
        const [residentResults, blotterResults, businessResults] = await Promise.all([
          localDb.residents
            .where('fullNameUpper')
            .startsWith(upperTerm)
            .limit(5)
            .toArray(),
          localDb.blotters
            .filter(b => 
                upper(b.complainantName).includes(upperTerm) || 
                upper(b.respondentName).includes(upperTerm) ||
                (b.caseNumber || '').includes(upperTerm)
            )
            .limit(5)
            .toArray(),
          localDb.businesses
            .where('businessName')
            .startsWith(upperTerm)
            .limit(5)
            .toArray(),
        ]);
        
        setResults({
          residents: residentResults.map(r => ({
            id: r.id,
            title: r.fullName,
            subtitle: `ID: ${r.id.slice(0,8)}...`,
            href: `/residents/${r.id}`,
          })),
          blotter: blotterResults.map(b => ({
            id: b.id,
            title: `${b.complainantName} vs ${b.respondentName}`,
            subtitle: `Case #${b.caseNumber || b.id.slice(0,8)}`,
            href: `/blotter/${b.id}`
          })),
          permits: businessResults.map(p => ({
            id: p.id,
            title: p.businessName,
            subtitle: `Owner: ${p.ownerName}`,
            href: `/permits` // Future: link to permit detail page
          }))
        });

      } catch (error) {
        console.error("Error searching local DB:", error);
        setResults({ residents: [], blotter: [], permits: [] });
      } finally {
        setLoading(false);
      }
    };
    
    performSearch();

  }, [debouncedTerm]);

  return { results, loading };
}

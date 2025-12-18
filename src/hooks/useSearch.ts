'use client';

import { useState, useEffect } from 'react';
import { db as localDb } from '@/lib/db';
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
        const residentResults = await localDb.residents
          .where('fullNameUpper')
          .startsWith(upperTerm)
          .limit(10)
          .toArray();

        setResults(prev => ({
          ...prev,
          residents: residentResults.map(r => ({
            id: r.id,
            title: r.displayName,
            subtitle: `RBI ID: ${r.rbiId}`,
            href: `/residents/${r.id}`,
          })),
        }));
      } catch (error) {
        console.error("Error searching local DB:", error);
        setResults(prev => ({...prev, residents: [] }));
      } finally {
        setLoading(false);
      }
    };
    
    performSearch();

  }, [debouncedTerm]);

  return { results, loading };
}

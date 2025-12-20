
'use client';

import { useState, useEffect } from 'react';
import { db as localDb } from '@/lib/bosDb';
import { useDebounce } from './useDebounce';
import { toTokens } from '@/lib/bos/searchTokens';
import { nlq } from '@/ai/flows/nlq';

export interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  href: string;
}

function upper(s: string) { return (s ?? "").trim().toUpperCase(); }


export function useSearch(term: string) {
  const [results, setResults] = useState<{ [key: string]: SearchResult[] }>({
    residents: [],
    blotter: [],
    permits: [],
  });
  const [loading, setLoading] = useState(false);
  const debouncedTerm = useDebounce(term, 400); // Increased debounce for AI

  useEffect(() => {
    if (debouncedTerm.length < 3) {
      setResults({ residents: [], blotter: [], permits: [] });
      setLoading(false);
      return;
    }

    setLoading(true);

    const performSearch = async () => {
      try {
        // Step 1: Try to parse with AI
        const nlqResult = await nlq({ query: debouncedTerm, context: 'global' });
        
        let residentsQuery = localDb.residents.limit(5);
        let blotterQuery = localDb.blotters.limit(5);
        let businessQuery = localDb.businesses.limit(5);

        // Step 2: Apply AI-driven filters if available
        if (nlqResult && nlqResult.filters.length > 0) {
            nlqResult.filters.forEach(filter => {
                if (filter.field === 'purok' && (nlqResult.targetModule === 'residents' || nlqResult.targetModule === 'unknown')) {
                    residentsQuery = residentsQuery.filter(r => (r.householdNoUpper || '').includes(filter.value.toUpperCase()));
                }
                if (filter.field === 'status' && nlqResult.targetModule === 'blotter') {
                    blotterQuery = blotterQuery.filter(b => b.status.toUpperCase() === filter.value.toUpperCase());
                }
                // ... more filter logic can be added here
            });
        }
        
        // Step 3: Apply keyword search as a fallback or refinement
        const keywords = (nlqResult && nlqResult.keywords.length > 0) ? nlqResult.keywords : toTokens(debouncedTerm);
        if (keywords.length > 0) {
            residentsQuery = residentsQuery.filter(r => keywords.some(k => r.searchTokens.includes(k)));
            blotterQuery = blotterQuery.filter(b => keywords.some(k => b.searchTokens.includes(k)));
            businessQuery = businessQuery.filter(b => keywords.some(k => b.searchTokens.includes(k)));
        }

        const [residentResults, blotterResults, businessResults] = await Promise.all([
          residentsQuery.toArray(),
          blotterQuery.toArray(),
          businessQuery.toArray(),
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
        console.error("Error searching local DB with NLQ:", error);
        setResults({ residents: [], blotter: [], permits: [] });
      } finally {
        setLoading(false);
      }
    };
    
    performSearch();

  }, [debouncedTerm]);

  return { results, loading };
}

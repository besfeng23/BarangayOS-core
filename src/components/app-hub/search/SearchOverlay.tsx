'use client';

import { Input } from '@/components/ui/input';
import { Search, X, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import SearchResults from './SearchResults';
import { Button } from '@/components/ui/button';
import { useSearch } from '@/hooks/useSearch';

export default function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const { results, loading } = useSearch(query);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="fixed inset-0 z-40 bg-zinc-950/90 backdrop-blur animate-in fade-in-0">
      <div className="flex flex-col h-full">
        <div className="flex-shrink-0 p-3 border-b border-zinc-800 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
            <Input
              ref={inputRef}
              placeholder="Search Resident, ID, or Case #"
              className="bg-zinc-800 border-zinc-700 h-12 pl-10 text-lg"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
             {loading && (
                 <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 animate-spin" />
            )}
          </div>
          <Button variant="ghost" size="lg" onClick={onClose}>
            Cancel
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <SearchResults results={results} loading={loading} isOverlay />
        </div>
      </div>
    </div>
  );
}

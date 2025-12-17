'use client';

import { Input } from '@/components/ui/input';
import { Search, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import SearchResults from './SearchResults';
import { useSearch } from '@/hooks/useSearch';

export default function SearchInput() {
  const [query, setQuery] = useState('');
  const { results, loading } = useSearch(query);
  const [isOpen, setIsOpen] = useState(false);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    if (newQuery.length > 2) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild className="w-full">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search Resident, ID, or Case #"
            className="bg-zinc-800 border-zinc-700 h-9 pl-9 text-sm"
            value={query}
            onChange={handleQueryChange}
          />
          {loading && (
             <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 animate-spin" />
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <SearchResults results={results} loading={loading} />
      </PopoverContent>
    </Popover>
  );
}

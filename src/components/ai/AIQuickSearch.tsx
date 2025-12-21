
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Bot, Loader2, Search } from 'lucide-react';
import { nlq } from '@/ai/flows/nlq';
import { useToast } from '@/components/ui/toast';
import { Badge } from '@/components/ui/badge';

const SUGGESTIONS = [
  "active blotter cases",
  "residents in purok 3",
  "expired business permits",
];

export default function AIQuickSearch() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSearch = async (searchText: string) => {
    if (!searchText.trim()) return;
    
    setLoading(true);
    setQuery(searchText); // Update input field with the text being searched

    try {
      const result = await nlq({ query: searchText, context: 'dashboard' });
      
      const { targetModule, filters, keywords } = result;

      if (targetModule === 'unknown' && keywords.length === 0) {
        toast({
          variant: 'destructive',
          title: 'Could not understand query',
          description: 'Please try rephrasing your search.',
        });
        return;
      }
      
      const searchParams = new URLSearchParams();
      
      if (filters.length > 0) {
        searchParams.set('filters', JSON.stringify(filters));
      }
      if (keywords.length > 0) {
        searchParams.set('q', keywords.join(' '));
      }

      const queryString = searchParams.toString();
      const destination = `/${targetModule}?${queryString}`;
      
      router.push(destination);

    } catch (error) {
      console.error("AI Quick Search failed:", error);
      toast({
        variant: 'destructive',
        title: 'AI Search Error',
        description: 'The AI assistant could not process the request. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  }

  return (
    <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
      <div className="flex items-center gap-2">
        <Bot className="text-blue-400 h-6 w-6 flex-shrink-0" />
        <h3 className="text-lg font-semibold">AI Quick Search</h3>
      </div>
      <form onSubmit={handleFormSubmit} className="relative mt-2 flex gap-2">
        <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input 
                placeholder="Ask something like 'show me active blotter cases'" 
                className="bg-zinc-900 border-zinc-600 text-white pl-10 pr-28 h-12 w-full rounded-md"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={loading}
            />
        </div>
        <Button type="submit" size="lg" className="h-12" disabled={loading || !query.trim()}>
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Search'}
        </Button>
      </form>
      <div className="flex flex-wrap gap-2 mt-2">
        {SUGGESTIONS.map(s => (
            <Badge 
                key={s} 
                variant="secondary" 
                className="cursor-pointer hover:bg-zinc-600"
                onClick={() => handleSearch(s)}
            >
                {s}
            </Badge>
        ))}
      </div>
    </div>
  );
}

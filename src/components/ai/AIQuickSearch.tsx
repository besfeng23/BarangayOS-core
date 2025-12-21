
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Bot, Loader2, Search } from 'lucide-react';
import { nlq } from '@/ai/flows/nlq';
import { useToast } from '@/components/ui/toast';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from '@/components/ui/badge';

const SUGGESTIONS = [
  "active blotter cases",
  "residents in purok 3",
  "expired business permits",
];
const AI_DISABLED = true;

export default function AIQuickSearch() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSearch = async (searchText: string) => {
    if (!searchText.trim()) return;
    if (AI_DISABLED) {
      toast({
        title: "Coming Soon",
        description: "AI Quick Search is disabled in this demo build.",
      });
      return;
    }
    
    setLoading(true);
    setQuery(searchText);

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
      setIsOpen(false);

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

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value);
      if(e.target.value.length > 1 && !isOpen) {
          setIsOpen(true);
      } else if (e.target.value.length <= 1 && isOpen) {
          setIsOpen(false);
      }
  }

  return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild className="w-full">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                    placeholder={AI_DISABLED ? "AI Quick Search (Coming Soon)" : "AI search: active cases, purok 3 residents..."}
                    className="bg-zinc-800 border-zinc-700 h-9 pl-9 text-sm"
                    value={query}
                    onChange={handleQueryChange}
                    onKeyDown={(e) => { if(e.key === 'Enter') { handleSearch(query) }}}
                    disabled={AI_DISABLED}
                />
                {loading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 animate-spin" />
                )}
            </div>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-4" align="start">
            <div className="flex items-center gap-2 mb-4">
                <Bot className="text-blue-400 h-5 w-5 flex-shrink-0" />
                <h3 className="text-sm font-semibold">AI Assistant Suggestions</h3>
            </div>
            <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map(s => (
                    <Badge 
                        key={s} 
                        variant="secondary" 
                        className="cursor-pointer hover:bg-zinc-600"
                    onClick={() => handleSearch(s)}
                    disabled={AI_DISABLED}
                >
                    {AI_DISABLED ? `${s} (disabled)` : s}
                    </Badge>
                ))}
            </div>
        </PopoverContent>
    </Popover>
  );
}

'use client';
import { SearchResult } from '@/hooks/useSearch';
import { Users, Scale, FileText } from 'lucide-react';
import Link from 'next/link';

const groupConfig = {
  residents: {
    title: 'Residents',
    icon: Users,
  },
  blotter: {
    title: 'Blotter Cases',
    icon: Scale,
  },
  permits: {
    title: 'Business Permits',
    icon: FileText,
  },
};

const SearchResultItem = ({ item }: { item: SearchResult }) => (
  <Link
    href={item.href}
    className="block p-3 hover:bg-zinc-800 rounded-md transition-colors"
  >
    <p className="font-semibold text-zinc-100">{item.title}</p>
    <p className="text-sm text-zinc-400">{item.subtitle}</p>
  </Link>
);

export default function SearchResults({
  results,
  loading,
  isOverlay = false,
}: {
  results: { [key: string]: SearchResult[] };
  loading: boolean;
  isOverlay?: boolean;
}) {
  const hasResults = Object.values(results).some((group) => group.length > 0);

  if (loading) {
    return (
      <div className="p-4 text-center text-zinc-400">Loading results...</div>
    );
  }

  if (!hasResults) {
    return (
      <div className="p-4 text-center text-zinc-400">No results found.</div>
    );
  }

  return (
    <div className={isOverlay ? 'p-3' : ''}>
      {Object.entries(results).map(([groupKey, items]) => {
        if (items.length === 0) return null;
        const config = groupConfig[groupKey as keyof typeof groupConfig] || { title: groupKey, icon: FileText };
        const { title, icon: Icon } = config;
        
        return (
          <div key={groupKey} className="p-2">
            <h4 className="text-xs font-semibold uppercase text-zinc-500 px-3 pt-2 pb-1 flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {title}
            </h4>
            <div className="space-y-1">
              {items.map((item) => (
                <SearchResultItem key={item.href} item={item} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

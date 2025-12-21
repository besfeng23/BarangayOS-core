
'use client';

import { useIsMobile } from '@/hooks/use-mobile';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import SearchOverlay from './SearchOverlay';
import AIQuickSearch from '@/components/ai/AIQuickSearch';

export default function GlobalSearch() {
  const isMobile = useIsMobile();
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  if (isMobile) {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open search"
          onClick={() => setIsOverlayOpen(true)}
        >
          <Search className="h-5 w-5" />
        </Button>
        {isOverlayOpen && (
          <SearchOverlay onClose={() => setIsOverlayOpen(false)} />
        )}
      </>
    );
  }

  // For desktop, use the AI Quick Search directly.
  return <AIQuickSearch />;
}

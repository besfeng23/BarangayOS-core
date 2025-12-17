'use client';

import { useIsMobile } from '@/hooks/use-mobile';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import SearchInput from './SearchInput';
import SearchOverlay from './SearchOverlay';

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

  return (
    <div className="w-full max-w-md">
      <SearchInput />
    </div>
  );
}

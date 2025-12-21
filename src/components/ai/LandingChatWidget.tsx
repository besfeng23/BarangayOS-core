
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import BarangAIChatWidget from './BarangAIChatWidget';

export default function LandingChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[100] group">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-16 h-16 bg-blue-600 hover:bg-blue-700 shadow-lg text-white group-hover:scale-110 transition-transform"
          aria-label="Open BarangAI Chat"
        >
          <MessageCircle className="h-8 w-8" />
        </Button>
      </div>

      <BarangAIChatWidget isOpen={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}

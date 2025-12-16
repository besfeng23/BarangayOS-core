
"use client";

import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, TriangleAlert } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="fixed bottom-6 inset-x-0 z-50 flex justify-center">
      <div className="bg-background/60 backdrop-blur-lg border rounded-full p-2 shadow-lg flex items-center gap-2">
        <Button variant="ghost" size="icon" className="w-14 h-14 rounded-full" aria-label="Go Back">
          <ArrowLeft size={24} />
        </Button>
        <Button variant="ghost" size="icon" className="w-14 h-14 rounded-full" aria-label="Go Home">
          <Home size={24} />
        </Button>
        <Button variant="destructive" size="icon" className="w-14 h-14 rounded-full" aria-label="SOS Alert">
          <TriangleAlert size={24} />
        </Button>
      </div>
    </footer>
  );
}

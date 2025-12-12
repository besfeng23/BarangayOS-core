"use client";

import { useState, useEffect } from 'react';
import { Shield, Scale } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import type { Jurisdiction } from '@/app/blotter/page';
import { cn } from '@/lib/utils';


interface BlotterHeaderProps {
  jurisdiction: Jurisdiction;
  onJurisdictionChange: (jurisdiction: Jurisdiction) => void;
}

const DigitalClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  return (
    <div className="text-sm font-mono tracking-wider">
      {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
    </div>
  );
};

export default function BlotterHeader({ jurisdiction, onJurisdictionChange }: BlotterHeaderProps) {
  const handleToggle = (checked: boolean) => {
    onJurisdictionChange(checked ? 'pnp' : 'barangay');
  };

  return (
    <header className="flex items-center justify-between p-3 border-b border-border shrink-0 bg-[hsl(var(--header-bg))] text-[hsl(var(--header-fg))] transition-colors duration-300">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 flex items-center justify-center">
          <Scale className="h-8 w-8" />
        </div>
        <div className="hidden sm:block">
          <h1 className="text-xl font-bold">Unified Blotter System</h1>
          <p className="text-xs opacity-80">Incident Record Form (IRF)</p>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <DigitalClock />
        <div className="flex items-center space-x-2">
          <Label htmlFor="jurisdiction-toggle" className={cn("font-semibold transition-opacity", jurisdiction === 'pnp' && 'opacity-60')}>
            Barangay
          </Label>
          <Switch
            id="jurisdiction-toggle"
            checked={jurisdiction === 'pnp'}
            onCheckedChange={handleToggle}
            aria-label="Toggle Jurisdiction"
          />
          <Label htmlFor="jurisdiction-toggle" className={cn("font-semibold transition-opacity", jurisdiction === 'barangay' && 'opacity-60')}>
            PNP
          </Label>
        </div>
      </div>
    </header>
  );
}

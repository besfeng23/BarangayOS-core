
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { ResidentSearch } from './ResidentSearch';
import type { Resident } from '@/lib/firebase/schema';
import { Check, ChevronsUpDown, User, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResidentPickerProps {
  onSelectResident: (resident: Resident | null) => void;
  selectedResident: Resident | null;
  isRespondent?: boolean;
}

export const ResidentPicker = ({ onSelectResident, selectedResident, isRespondent }: ResidentPickerProps) => {
  const [open, setOpen] = useState(false);
  const [manualEntry, setManualEntry] = useState(false);
  const [manualName, setManualName] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);


  if (selectedResident) {
    return (
      <div className="flex items-center gap-2 p-2 rounded-md bg-slate-800 border border-slate-700">
        <User className="h-5 w-5 text-blue-400" />
        <span className="font-medium flex-1">{selectedResident.displayName || (selectedResident as any).fullName}</span>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onSelectResident(null)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }
  
  if (manualEntry) {
     return (
        <div className="flex items-center gap-2">
            <Input 
                placeholder="Enter non-resident name..." 
                className="h-12 text-lg bg-slate-900 border-slate-600"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                onBlur={() => onSelectResident({ fullName: manualName } as any)}
            />
             <Button variant="ghost" onClick={() => setManualEntry(false)}>Cancel</Button>
        </div>
     )
  }

  return (
    <div ref={wrapperRef}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-12 text-lg"
          >
            {selectedResident ? selectedResident.displayName : "Search and select a resident..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
            className="w-[400px] p-0 z-50"
            align="start"
            onMouseDown={(e) => e.preventDefault()}
        >
          <ResidentSearch>
            {({ residents, loading, searchTerm, setSearchTerm }) => (
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Search by name or RBI ID..."
                  value={searchTerm}
                  onValueChange={setSearchTerm}
                />
                <CommandList>
                  {loading && <CommandItem>Loading...</CommandItem>}
                  <CommandEmpty>No resident found.</CommandEmpty>
                  <CommandGroup>
                    {residents.map((resident) => (
                      <CommandItem
                        key={resident.id}
                        value={resident.displayName}
                        onSelect={() => {
                          onSelectResident(resident);
                          setOpen(false);
                        }}
                        className="aria-selected:bg-slate-700 cursor-pointer"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedResident?.id === resident.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {resident.displayName}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
                 <div className="p-2 border-t border-slate-700">
                      <Button variant="link" onClick={() => { setManualEntry(true); setOpen(false); }}>
                         {isRespondent ? 'Respondent is not a resident' : 'Enter manually for non-resident'}
                      </Button>
                  </div>
              </Command>
            )}
          </ResidentSearch>
        </PopoverContent>
      </Popover>
    </div>
  );
};

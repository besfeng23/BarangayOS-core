
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import type { Resident } from '@/lib/firebase/schema';
import { Check, ChevronsUpDown, User, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { residentConverter } from '@/lib/firebase/schema';
import { Input } from '../ui/input';

interface ResidentPickerProps {
  onSelectResident: (resident: Resident | { fullName: string } | null) => void;
  selectedResident: Resident | { fullName: string } | null;
  isRespondent?: boolean;
}

export const ResidentPicker = ({ onSelectResident, selectedResident, isRespondent }: ResidentPickerProps) => {
  const [open, setOpen] = useState(false);
  const [queryTerm, setQueryTerm] = useState('');
  const [allResidents, setAllResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [manualEntry, setManualEntry] = useState(false);
  const [manualName, setManualName] = useState('');
  
  useEffect(() => {
    const residentsRef = collection(db, 'residents').withConverter(residentConverter);
    const q = query(residentsRef, orderBy('displayName'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const residentsData: Resident[] = [];
      querySnapshot.forEach((doc) => {
        residentsData.push(doc.data());
      });
      setAllResidents(residentsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching residents for picker: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredResidents = useMemo(() => {
    if (!queryTerm) return allResidents.slice(0, 10);
    const lowercasedQuery = queryTerm.toLowerCase();
    return allResidents.filter(resident =>
      (resident.displayName ?? '').toLowerCase().includes(lowercasedQuery) ||
      (resident.rbiId && resident.rbiId.includes(lowercasedQuery))
    ).slice(0, 10);
  }, [queryTerm, allResidents]);

  const handleSelect = (resident: Resident) => {
    onSelectResident(resident);
    setOpen(false);
    setQueryTerm('');
  };

  const handleClear = () => {
    onSelectResident(null);
    setQueryTerm('');
  };
  
  const displayName = selectedResident ? ('displayName' in selectedResident ? selectedResident.displayName : selectedResident.fullName) : '';

  if (selectedResident) {
    return (
      <div className="flex items-center gap-2 p-2 rounded-md bg-slate-800 border border-slate-700">
        <User className="h-5 w-5 text-blue-400" />
        <span className="font-medium flex-1">{displayName}</span>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleClear}>
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
                onBlur={() => onSelectResident({ fullName: manualName })}
            />
             <Button variant="ghost" onClick={() => { setManualEntry(false); setManualName(''); }}>Cancel</Button>
        </div>
     )
  }

  return (
    <div data-resident-picker>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-12 text-lg"
          >
            Search and select a resident...
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-[400px] p-0 z-50" 
          align="start"
          onMouseDown={(e) => {
            // Prevent the popover from closing when clicking inside,
            // which would trigger the onBlur on the input.
            e.preventDefault();
          }}
        >
          <Command shouldFilter={false}>
            <CommandInput
              autoFocus
              placeholder="Search by name or RBI ID..."
              value={queryTerm}
              onValueChange={setQueryTerm}
            />
            <CommandList>
                {loading && <CommandItem>Loading...</CommandItem>}
                <CommandEmpty>No resident found.</CommandEmpty>
                <CommandGroup>
                  {filteredResidents.map((resident) => (
                    <CommandItem
                      key={resident.id}
                      value={resident.displayName}
                      onSelect={() => handleSelect(resident)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          displayName === resident.displayName ? "opacity-100" : "opacity-0"
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
        </PopoverContent>
      </Popover>
    </div>
  );
};

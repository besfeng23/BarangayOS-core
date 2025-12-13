'use client';

import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  FileDown,
  Printer,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import ResidentProfileDrawer from './ResidentProfileDrawer';
import { mockResidents, mockPuroks, mockSectors } from '@/data/residents-mock';
import type { Resident } from '@/types';

const getInitials = (name: string) => {
  const names = name.split(' ');
  const initials = names.map((n) => n[0]).join('');
  return initials.slice(0, 2).toUpperCase();
};

const ResidentRecords = () => {
  const [selectedResident, setSelectedResident] = useState<Resident | null>(
    null
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPuroks, setSelectedPuroks] = useState<Set<string>>(new Set());
  const [selectedSectors, setSelectedSectors] = useState<Set<string>>(
    new Set()
  );

  const filteredResidents = useMemo(() => {
    return mockResidents.filter((resident) => {
      const purokMatch =
        selectedPuroks.size === 0 || selectedPuroks.has(resident.addressSnapshot.purok);
      const sectorMatch =
        selectedSectors.size === 0 ||
        Array.from(selectedSectors).some((sector) => resident.sectorFlags[sector as keyof typeof resident.sectorFlags]);
      const searchMatch =
        searchTerm === '' ||
        resident.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resident.rbiId.includes(searchTerm);
      return purokMatch && sectorMatch && searchMatch;
    });
  }, [searchTerm, selectedPuroks, selectedSectors]);

  const handleRowClick = (resident: Resident) => {
    setSelectedResident(resident);
    setIsDrawerOpen(true);
  };

  const handlePurokChange = (purok: string) => {
    setSelectedPuroks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(purok)) {
        newSet.delete(purok);
      } else {
        newSet.add(purok);
      }
      return newSet;
    });
  };

  const handleSectorChange = (sector: string) => {
    setSelectedSectors((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sector)) {
        newSet.delete(sector);
      } else {
        newSet.add(sector);
      }
      return newSet;
    });
  };

  return (
    <div className="flex h-screen bg-slate-900 text-gray-200">
      <div className="flex flex-col flex-1">
        <header className="bg-slate-800/50 border-b border-slate-700 p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Resident Records</h1>
            <div className="flex items-center gap-2 text-sm">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              Online
            </div>
          </div>
        </header>

        {/* Stats Panel */}
        <div className="bg-slate-900 border-b border-slate-700 p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-blue-400">10,234</p>
              <p className="text-sm text-slate-400">Total Population</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-green-400">7,890</p>
              <p className="text-sm text-slate-400">Registered Voters</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-yellow-400">1,567</p>
              <p className="text-sm text-slate-400">Households</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-purple-400">
                {
                  Object.values(mockSectors).reduce(
                    (acc, sector) => acc + sector.count,
                    0
                  )
                }
              </p>
              <p className="text-sm text-slate-400">In Sectors</p>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="p-4 bg-slate-800/50 border-b border-slate-700 flex flex-wrap items-center gap-4">
          <div className="relative flex-grow md:flex-grow-0 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search by name or RBI ID..."
              className="bg-slate-900 border-slate-600 text-white pl-10 h-12"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-12 w-full md:w-auto">
                <Filter className="mr-2 h-4 w-4" />
                Filter by Purok
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-slate-800 text-white border-slate-700">
              <DropdownMenuLabel>Select Puroks</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {mockPuroks.map((purok) => (
                <DropdownMenuCheckboxItem
                  key={purok}
                  checked={selectedPuroks.has(purok)}
                  onCheckedChange={() => handlePurokChange(purok)}
                >
                  {purok}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-12 w-full md:w-auto">
                <Users className="mr-2 h-4 w-4" />
                Filter by Sector
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-slate-800 text-white border-slate-700">
              <DropdownMenuLabel>Select Sectors</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {Object.entries(mockSectors).map(([key, { label }]) => (
                <DropdownMenuCheckboxItem
                  key={key}
                  checked={selectedSectors.has(key)}
                  onCheckedChange={() => handleSectorChange(key)}
                >
                  {label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex-grow flex justify-end gap-2">
            <Button variant="outline" className="h-12">
              <FileDown className="mr-2 h-4 w-4" /> Export
            </Button>
            <Button variant="outline" className="h-12">
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 h-12 text-lg px-6">
              <Plus className="mr-2 h-6 w-6" /> New Resident
            </Button>
          </div>
        </div>

        {/* Master Grid */}
        <div className="flex-1 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700 hover:bg-slate-800/50">
                <TableHead className="w-[50px]"><Checkbox /></TableHead>
                <TableHead className="w-[300px] text-lg text-gray-300">Name / ID</TableHead>
                <TableHead className="text-lg text-gray-300">Purok / Address</TableHead>
                <TableHead className="text-lg text-gray-300">Age / Sex</TableHead>
                <TableHead className="text-lg text-gray-300">Civil Status</TableHead>
                <TableHead className="text-lg text-gray-300">Tags</TableHead>
                <TableHead className="text-lg text-gray-300">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResidents.map((resident) => {
                const age = Math.floor(
                  (new Date() - new Date(resident.dateOfBirth.seconds * 1000)) /
                    (1000 * 60 * 60 * 24 * 365.25)
                );
                const tags = Object.entries(resident.sectorFlags)
                  .filter(([, value]) => value)
                  .map(([key]) => mockSectors[key as keyof typeof mockSectors]?.label);
                
                return (
                  <TableRow
                    key={resident.id}
                    className="border-slate-800 h-[80px] hover:bg-slate-800/50 cursor-pointer"
                    onClick={() => handleRowClick(resident)}
                  >
                    <TableCell><Checkbox onClick={(e) => e.stopPropagation()} /></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={resident.photoFilePath} alt={resident.displayName} />
                          <AvatarFallback>{getInitials(resident.displayName)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-lg">{resident.displayName}</p>
                          <p className="text-sm text-slate-400 font-mono">{resident.rbiId}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                          <p className="font-medium">{resident.addressSnapshot.purok}</p>
                          <p className="text-sm text-slate-400 truncate max-w-xs">{resident.addressSnapshot.addressLine}</p>
                      </div>
                    </TableCell>
                    <TableCell>{age} / {resident.sex}</TableCell>
                    <TableCell className="capitalize">{resident.civilStatus}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {tags.slice(0, 2).map(tag => tag && <Badge key={tag} variant="secondary">{tag}</Badge>)}
                        {tags.length > 2 && <Badge variant="outline">+{tags.length - 2} more</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          resident.status === 'active'
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'bg-yellow-600 hover:bg-yellow-700'
                        }
                      >
                        {resident.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
      <ResidentProfileDrawer
        resident={selectedResident}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        userRole="SECRETARY"
      />
    </div>
  );
};

export default ResidentRecords;

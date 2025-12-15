
'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  FileDown,
  Printer,
  ChevronDown,
  QrCode,
  MoreVertical,
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
import { mockPuroks, mockSectors } from '@/data/residents-mock';
import type { Resident } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { collection, onSnapshot, query, where, orderBy, limit, startAfter, getDocs, Query, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { residentConverter, type Resident as ResidentSchema } from '@/lib/firebase/schema';
import { Skeleton } from '@/components/ui/skeleton';
import NewResidentModal from './NewResidentModal';

const PAGE_SIZE = 50;

const getInitials = (name: string) => {
  if (!name) return 'N/A';
  const names = name.split(' ');
  const initials = names.map((n) => n[0]).join('');
  return initials.slice(0, 2).toUpperCase();
};

const StatCard = ({ title, value }: { title: string, value: string | number }) => (
    <div className="bg-slate-800/50 p-3 rounded-lg">
        <p className="text-sm text-slate-400">{title}</p>
        <p className="text-2xl font-bold text-blue-400">{value}</p>
    </div>
);


const ResidentRecords = () => {
  const [allResidents, setAllResidents] = useState<ResidentSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(
    null
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNewResidentModalOpen, setIsNewResidentModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPuroks, setSelectedPuroks] = useState<Set<string>>(new Set());
  const [selectedSectors, setSelectedSectors] = useState<Set<string>>(
    new Set()
  );

  const isMobile = useIsMobile();

  const buildQuery = useCallback(() => {
    const residentsRef = collection(db, 'residents').withConverter(residentConverter);
    let q: Query<DocumentData> = query(residentsRef, orderBy('displayName'), limit(PAGE_SIZE));

    // Note: Firestore does not support inequality filters on multiple fields.
    // Full-text search and complex filtering would require a dedicated search service like Algolia or Typesense.
    // For this demo, we will only filter by search term on the client side after initial load.
    // The pagination will be based on the ordered list of all residents.
    
    return q;
  }, []);

  const fetchInitialResidents = useCallback(() => {
    setLoading(true);
    const q = buildQuery();

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const residentsData: ResidentSchema[] = [];
        querySnapshot.forEach((doc) => {
            residentsData.push(doc.data() as ResidentSchema);
        });
        
        const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
        setLastVisible(lastDoc);
        setAllResidents(residentsData);
        setHasMore(querySnapshot.docs.length === PAGE_SIZE);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching initial residents: ", error);
        setLoading(false);
    });

    return unsubscribe;
  }, [buildQuery]);


  useEffect(() => {
    const unsubscribe = fetchInitialResidents();
    return () => unsubscribe();
  }, [fetchInitialResidents]);
  
  const fetchMoreResidents = async () => {
    if (!lastVisible || !hasMore) return;

    setLoadingMore(true);
    const residentsRef = collection(db, 'residents').withConverter(residentConverter);
    const nextQuery = query(residentsRef, orderBy('displayName'), startAfter(lastVisible), limit(PAGE_SIZE));
    
    try {
        const documentSnapshots = await getDocs(nextQuery);
        const newResidents = documentSnapshots.docs.map(doc => doc.data() as ResidentSchema);
        
        const lastDoc = documentSnapshots.docs[documentSnapshots.docs.length - 1];
        setLastVisible(lastDoc);
        setAllResidents(prev => [...prev, ...newResidents]);
        setHasMore(documentSnapshots.docs.length === PAGE_SIZE);
    } catch (error) {
        console.error("Error fetching more residents: ", error);
    } finally {
        setLoadingMore(false);
    }
  };


  const filteredResidents = useMemo(() => {
    // Client-side filtering
    return allResidents.filter((resident) => {
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
  }, [searchTerm, selectedPuroks, selectedSectors, allResidents]);

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
  
  const getAge = (dateOfBirth?: { seconds: number }) => {
    if(!dateOfBirth) return 'N/A';
    return Math.floor(
      (new Date() - new Date(dateOfBirth.seconds * 1000)) /
      (1000 * 60 * 60 * 24 * 365.25)
    );
  }
  
  const renderLoadingSkeleton = (count = 5) => (
    Array.from({ length: count }).map((_, index) => (
      <TableRow key={index} className="border-slate-800 h-[80px]">
        <TableCell><Skeleton className="h-4 w-4" /></TableCell>
        <TableCell>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div>
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24 mt-2" />
            </div>
          </div>
        </TableCell>
        <TableCell><Skeleton className="h-4 w-28" /></TableCell>
        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
      </TableRow>
    ))
  );


  const renderDesktopView = () => (
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
          {loading ? renderLoadingSkeleton() : filteredResidents.map((resident) => {
            const age = getAge(resident.dateOfBirth);
            const tags = resident.sectorFlags ? Object.entries(resident.sectorFlags)
              .filter(([, value]) => value)
              .map(([key]) => mockSectors[key as keyof typeof mockSectors]?.label) : [];

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
       {hasMore && (
        <div className="flex justify-center p-4">
            <Button onClick={fetchMoreResidents} disabled={loadingMore}>
                {loadingMore ? 'Loading...' : 'Load More'}
            </Button>
        </div>
        )}
    </div>
  );

  const renderMobileView = () => (
      <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-24">
          {loading && Array.from({length: 5}).map((_, i) => (
             <div key={i} className="bg-slate-800/50 rounded-lg p-4 space-y-2">
                <div className="flex items-start gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                </div>
            </div>
          ))}
          {!loading && filteredResidents.map(resident => {
              const age = getAge(resident.dateOfBirth);
              const tags = resident.sectorFlags ? Object.entries(resident.sectorFlags)
                .filter(([, value]) => value)
                .map(([key]) => mockSectors[key as keyof typeof mockSectors]?.label) : [];
              
              return (
                  <div key={resident.id} className="bg-slate-800/50 rounded-lg p-4 cursor-pointer relative" onClick={() => handleRowClick(resident)}>
                      <div className="flex items-start gap-4">
                          <Avatar className="w-12 h-12">
                              <AvatarImage src={resident.photoFilePath} alt={resident.displayName} />
                              <AvatarFallback>{getInitials(resident.displayName)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                              <p className="font-bold text-lg">{resident.displayName}</p>
                              <p className="text-sm text-slate-400">
                                  {resident.rbiId} &middot; {age} &middot; {resident.sex} &middot; <span className="capitalize">{resident.civilStatus}</span>
                              </p>
                              <p className="text-slate-300 mt-1">{resident.addressSnapshot.purok} &middot; {resident.addressSnapshot.addressLine}</p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                  {tags.slice(0, 2).map(tag => tag && <Badge key={tag} variant="secondary">{tag}</Badge>)}
                                  {tags.length > 2 && <Badge variant="outline">+{tags.length - 2} more</Badge>}
                              </div>
                          </div>
                      </div>
                      <Badge className={`absolute top-4 right-4 ${resident.status === 'active' ? 'bg-green-600' : 'bg-yellow-600'}`}>
                          {resident.status.toUpperCase()}
                      </Badge>
                  </div>
              )
          })}
          {hasMore && (
            <div className="flex justify-center p-4">
                <Button onClick={fetchMoreResidents} disabled={loadingMore} className="w-full">
                    {loadingMore ? 'Loading...' : 'Load More'}
                </Button>
            </div>
           )}
      </div>
  );

  const renderFilterContent = () => (
    <div className="p-4 space-y-6">
        <div>
            <h3 className="text-lg font-semibold mb-2">Filter by Purok</h3>
            <div className="grid grid-cols-2 gap-2">
                {mockPuroks.map((purok) => (
                    <Button key={purok} variant={selectedPuroks.has(purok) ? 'default' : 'outline'} onClick={() => handlePurokChange(purok)}>
                        {purok}
                    </Button>
                ))}
            </div>
        </div>
        <div>
            <h3 className="text-lg font-semibold mb-2">Filter by Sector</h3>
            <div className="grid grid-cols-2 gap-2">
                {Object.entries(mockSectors).map(([key, { label }]) => (
                    <Button key={key} variant={selectedSectors.has(key) ? 'default' : 'outline'} onClick={() => handleSectorChange(key)}>
                        {label}
                    </Button>
                ))}
            </div>
        </div>
    </div>
  );

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
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="Total Population" value="8,782" />
            <StatCard title="Registered Voters" value="5,109" />
            <StatCard title="Households" value="1,567" />
            <StatCard title="Tagged Residents" value="560" />
          </div>
        </div>

        {/* Action & Filter Bar */}
        <div className="p-4 bg-slate-800/50 border-b border-slate-700 flex flex-wrap items-center gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search by name or RBI ID..."
              className="bg-slate-900 border-slate-600 text-white pl-10 h-12"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="hidden md:flex flex-grow items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-12">
                  <Filter className="mr-2 h-4 w-4" />
                  Purok
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
                <Button variant="outline" className="h-12">
                  <Users className="mr-2 h-4 w-4" />
                  Sector
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
          </div>

          <div className="hidden md:flex justify-end gap-2">
            <Button variant="outline" className="h-12">
              <FileDown className="mr-2 h-4 w-4" /> Export
            </Button>
            <Button variant="outline" className="h-12">
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 h-12 text-lg px-6" onClick={() => setIsNewResidentModalOpen(true)}>
              <Plus className="mr-2 h-6 w-6" /> New Resident
            </Button>
          </div>
        </div>

        {isMobile ? renderMobileView() : renderDesktopView()}
      </div>

      <ResidentProfileDrawer
        resident={selectedResident}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        userRole="SECRETARY"
      />
      
      <NewResidentModal 
        isOpen={isNewResidentModalOpen}
        onClose={() => setIsNewResidentModalOpen(false)}
      />

      {/* Mobile Sticky Footer */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-800/80 backdrop-blur-lg border-t border-slate-700 p-2 flex justify-around items-center">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" className="flex flex-col h-auto">
                        <Filter className="h-6 w-6" />
                        <span className="text-xs">Filters</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="bg-slate-900 border-t-slate-700 text-white">
                    <SheetHeader>
                        <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    {renderFilterContent()}
                </SheetContent>
            </Sheet>

            <Button variant="ghost" className="flex flex-col h-auto">
                <QrCode className="h-6 w-6" />
                <span className="text-xs">Scan QR</span>
            </Button>
            
            <Button className="bg-blue-600 hover:bg-blue-700 rounded-full h-16 w-16 text-lg absolute -top-8 shadow-lg border-4 border-slate-900" onClick={() => setIsNewResidentModalOpen(true)}>
                <Plus className="h-8 w-8" />
            </Button>
            
            <div className="w-16"></div>

            <Button variant="ghost" className="flex flex-col h-auto">
                <FileDown className="h-6 w-6" />
                <span className="text-xs">Export</span>
            </Button>
            
            <Button variant="ghost" className="flex flex-col h-auto">
                <MoreVertical className="h-6 w-6" />
                <span className="text-xs">More</span>
            </Button>
        </div>
      )}
    </div>
  );
};

export default ResidentRecords;

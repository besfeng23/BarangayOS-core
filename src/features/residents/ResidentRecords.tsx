

'use client';

import React, { useState, useMemo, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Users,
  Search,
  Filter,
  Plus,
  FileDown,
  ChevronDown,
  QrCode,
  MoreVertical,
  Loader2,
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
import { collection, onSnapshot, query, where, orderBy, limit, startAfter, getDocs, Query, DocumentData, QueryDocumentSnapshot, addDoc, serverTimestamp, writeBatch, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { residentConverter, type Resident as ResidentSchema, blotterCaseConverter, businessPermitConverter } from '@/lib/firebase/schema';
import { Skeleton } from '@/components/ui/skeleton';
import NewResidentModal from '../residents/NewResidentModal';
import { EmptyState } from '../ui/EmptyState';
import { useToast } from '@/components/ui/toast';

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

// --- Golden Data Seeding Logic ---
const goldenResidents = [
  {
    "firstName": "Kapitana Teresita", "lastName": "Ramos", "middleName": "Gomez",
    "birthDate": "1968-05-20", "sex": "Female", "civilStatus": "Married",
    "address": "Blk 12 Lot 34, Main St.", "purok": "Purok 1", "tags": ["Voter"],
    "systemId": "BOS-2025-001"
  },
  {
    "firstName": "Kagawad Roberto", "lastName": "Santos", "middleName": "Cruz",
    "birthDate": "1975-09-15", "sex": "Male", "civilStatus": "Married",
    "address": "105-A, Bonifacio Ave.", "purok": "Purok 2", "tags": ["Voter"],
    "systemId": "BOS-2025-002"
  },
  {
    "firstName": "Nanay Remedios", "lastName": "Mercado", "middleName": "Lim",
    "birthDate": "1954-12-08", "sex": "Female", "civilStatus": "Widowed",
    "address": "45-B, Sampaguita St.", "purok": "Purok 3", "tags": ["Senior Citizen", "Voter"],
    "systemId": "BOS-2025-003"
  },
   {
    "firstName": "John Michael", "lastName": "David", "middleName": "Perez",
    "birthDate": "1998-02-28", "sex": "Male", "civilStatus": "Single",
    "address": "22 Acacia St.", "purok": "Purok 4", "tags": ["Voter"],
    "systemId": "BOS-2025-004"
  },
  {
    "firstName": "Christina", "lastName": "Bernardo", "middleName": "Garcia",
    "birthDate": "2001-07-11", "sex": "Female", "civilStatus": "Single",
    "address": "88 Narra St., Creekside", "purok": "Purok 5", "tags": [],
    "systemId": "BOS-2025-005"
  }
];

const goldenBlotter = [
  {
    "complainant": "Nanay Remedios Mercado", "respondent": "John Michael David",
    "natureOfCase": "Noise Complaint", "status": "ACTIVE",
    "dateOfIncident": new Date().toISOString().split('T')[0],
    "narrative": "Respondent was playing loud music (videoke) past 10:00 PM on a weekday, disturbing the peace in the neighborhood. Several verbal warnings were ignored."
  },
  {
    "complainant": "Kapitana Teresita Ramos", "respondent": "Unknown",
    "natureOfCase": "Property Dispute", "status": "ACTIVE",
    "dateOfIncident": new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days ago
    "narrative": "A portion of the barangay's vacant lot near Purok 2 has been illegally used as a dumping ground for construction debris by an unidentified party."
  }
];

const goldenPermits = [
  { "businessName": "Tindahan ni Aling Remy", "owner": "Nanay Remedios Mercado", "type": "Retail", "status": "Active", "feesCollected": 500, "purok": "Purok 3", "year": 2024 },
  { "businessName": "JM's Computer Repair", "owner": "John Michael David", "type": "Service", "status": "Active", "feesCollected": 1500, "purok": "Purok 4", "year": 2024 },
  { "businessName": "Kagawad's Farm Supplies", "owner": "Kagawad Roberto Santos", "type": "Retail", "status": "Active", "feesCollected": 800, "purok": "Purok 2", "year": 2024 },
  { "businessName": "Tita's Eatery", "owner": "Kagawad Roberto Santos", "type": "Food", "status": "Active", "feesCollected": 600, "purok": "Purok 2", "year": 2024 },
  { "businessName": "Online Seller - CB", "owner": "Christina Bernardo", "type": "Online", "status": "Active", "feesCollected": 300, "purok": "Purok 5", "year": 2024 },
  { "businessName": "Piso Wifi Services", "owner": "John Michael David", "type": "Service", "status": "Active", "feesCollected": 200, "purok": "Purok 4", "year": 2023 },
  { "businessName": "Loading Station", "owner": "Nanay Remedios Mercado", "type": "Service", "status": "Active", "feesCollected": 150, "purok": "Purok 3", "year": 2023 },
  { "businessName": "Freelance Web Dev", "owner": "Christina Bernardo", "type": "Service", "status": "Active", "feesCollected": 0, "purok": "Purok 5", "year": 2023 },
  { "businessName": "Sari-Sari Store 2", "owner": "Kapitana Teresita Ramos", "type": "Retail", "status": "Active", "feesCollected": 500, "purok": "Purok 1", "year": 2022 },
  { "businessName": "Vegetable Stand", "owner": "Kagawad Roberto Santos", "type": "Retail", "status": "Active", "feesCollected": 100, "purok": "Purok 2", "year": 2022 }
];


async function wipeCollection(collectionName: string) {
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef);
    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);
    querySnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });
    await batch.commit();
}
// --- End Seeding Logic ---


function ResidentRecordsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [allResidents, setAllResidents] = useState<ResidentSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNewResidentModalOpen, setIsNewResidentModalOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPuroks, setSelectedPuroks] = useState<Set<string>>(new Set());
  const [selectedSectors, setSelectedSectors] = useState<Set<string>>(new Set());

  const isMobile = useIsMobile();

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      router.push('/residents/new');
      // Optional: remove the query param from URL
      // router.replace('/residents', undefined);
    }
  }, [searchParams, router]);

  const buildQuery = useCallback(() => {
    const residentsRef = collection(db, 'residents').withConverter(residentConverter);
    // Base query that filters out archived residents
    let q: Query<DocumentData> = query(
      residentsRef,
      where('status', '==', 'active'),
      orderBy('displayName'),
      limit(PAGE_SIZE)
    );
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
    const nextQuery = query(
        residentsRef, 
        where('status', '==', 'active'),
        orderBy('displayName'), 
        startAfter(lastVisible), 
        limit(PAGE_SIZE)
    );
    
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
    return allResidents.filter((resident) => {
      const purokMatch =
        selectedPuroks.size === 0 || selectedPuroks.has(resident.addressSnapshot.purok);
      const sectorMatch =
        selectedSectors.size === 0 ||
        Array.from(selectedSectors).some((sector) => resident.sectorFlags && resident.sectorFlags[sector as keyof typeof resident.sectorFlags]);
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

  const handleEditResident = (resident: Resident) => {
    setEditingResident(resident);
    setIsNewResidentModalOpen(true);
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

  const handleCloseModal = () => {
    setIsNewResidentModalOpen(false);
    setEditingResident(null); // Clear editing state on close
  };
  
  const getAge = (dateOfBirth?: { seconds: number } | Date) => {
    if(!dateOfBirth) return 'N/A';
    const dob = dateOfBirth instanceof Date ? dateOfBirth : new Date(dateOfBirth.seconds * 1000);
    return Math.floor(
      (new Date().getTime() - dob.getTime()) /
      (1000 * 60 * 60 * 24 * 365.25)
    );
  }
  
  const handleSeedData = async () => {
    if (!window.confirm("This will wipe all local data and replace it with demo data. Are you sure?")) {
        return;
    }
    setIsSeeding(true);
    toast({ title: "Seeding...", description: "Wiping and inserting golden sample data." });

    try {
        // 1. WIPE
        await wipeCollection('residents');
        await wipeCollection('blotter_cases');
        await wipeCollection('business_permits');
        toast({ title: "Wipe Complete", description: "Cleared old demo data." });

        // 2. SEED RESIDENTS
        const residentsRef = collection(db, 'residents').withConverter(residentConverter);
        for (const r of goldenResidents) {
            const newResident = {
                barangayId: "TEST-BARANGAY-1",
                rbiId: r.systemId,
                fullName: { first: r.firstName, last: r.lastName, middle: r.middleName },
                displayName: `${r.lastName.toUpperCase()}, ${r.firstName}`,
                displayNameLower: `${r.lastName.toLowerCase()}, ${r.firstName.toLowerCase()}`,
                sex: r.sex === 'Male' ? 'M' : 'F',
                dateOfBirth: Timestamp.fromDate(new Date(r.birthDate)),
                civilStatus: r.civilStatus.toLowerCase(),
                addressSnapshot: { purok: r.purok, addressLine: r.address },
                status: 'active',
                consent: { signed: true, signedAt: serverTimestamp() },
                createdBy: "SEED-SCRIPT",
                updatedBy: "SEED-SCRIPT",
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                sectorFlags: r.tags.reduce((acc, tag) => {
                    if (tag === 'Senior Citizen') acc.senior = true;
                    if (tag === 'PWD') acc.pwd = true;
                    return acc;
                }, {} as any)
            };
            await addDoc(residentsRef, newResident);
        }

        // 3. SEED BLOTTER
        const blotterRef = collection(db, 'blotter_cases').withConverter(blotterCaseConverter);
        for (const b of goldenBlotter) {
             const newCase = {
                caseId: `BC-DEMO-${Date.now() + Math.random()}`,
                complainant: b.complainant,
                respondent: b.respondent,
                nature: b.natureOfCase,
                narrative: b.narrative,
                status: b.status.toUpperCase(),
                incidentAt: Timestamp.fromDate(new Date(b.dateOfIncident)),
                date: b.dateOfIncident,
                barangayId: "TEST-BARANGAY-1",
                createdBy: "SEED-SCRIPT",
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };
            await addDoc(blotterRef, newCase);
        }

        // 4. SEED PERMITS
        const permitsRef = collection(db, 'business_permits').withConverter(businessPermitConverter);
        for (const p of goldenPermits) {
            const newPermit = {
                permitNo: `BP-DEMO-${Date.now() + Math.random()}`,
                status: p.status,
                businessName: p.businessName,
                businessAddress: { purok: p.purok, street: "TBD", barangay: "Dau", city: "Mabalacat", province: "Pampanga" },
                owner: { fullName: p.owner, contactNo: 'N/A', address: 'N/A', residentId: 'N/A'},
                feesCollected: p.feesCollected,
                barangayId: "TEST-BARANGAY-1",
                issuedBy: "SEED-SCRIPT",
                category: p.type,
                applicationType: 'NEW',
                payment: { status: 'PAID' },
                totals: { total: p.feesCollected, subtotal: p.feesCollected, penalties: 0, discounts: 0},
                issuedAt: serverTimestamp(),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                requirements: [],
                flags: []
            };
            await addDoc(permitsRef, newPermit as any);
        }

        toast({ title: "Success!", description: "Golden sample data has been seeded." });
        window.location.reload();
    } catch (error) {
        console.error("Error seeding data:", error);
        toast({ variant: "destructive", title: "Seeding Failed", description: "Could not add demo data." });
    } finally {
        setIsSeeding(false);
    }
  };

  const renderLoadingSkeleton = (count = 10) => (
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

  const clearSearch = () => {
    setSearchTerm('');
    setSelectedPuroks(new Set());
    setSelectedSectors(new Set());
  };


  const renderDesktopView = () => (
    <div className="border border-slate-700 rounded-lg flex-1 overflow-y-auto">
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
          {loading && renderLoadingSkeleton()}
          {!loading && filteredResidents.map((resident) => {
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
       {!loading && filteredResidents.length === 0 && (
         <tr>
            <td colSpan={7} className="p-10">
                <EmptyState 
                    type={searchTerm ? 'no-results' : 'no-data'} 
                    query={searchTerm}
                    onAction={searchTerm ? clearSearch : () => router.push('/residents/new')}
                    actionText={searchTerm ? 'Clear Search' : '+ Add New Resident'}
                />
            </td>
        </tr>
       )}
       {hasMore && !loading && (
        <div className="flex justify-center p-4 border-t border-slate-700">
            <Button onClick={fetchMoreResidents} disabled={loadingMore} variant="outline" className="w-full">
                {loadingMore ? 'Loading...' : 'Load More Results'}
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
           {!loading && filteredResidents.length === 0 && (
             <div className="pt-10">
                <EmptyState 
                    type={searchTerm ? 'no-results' : 'no-data'} 
                    query={searchTerm}
                    onAction={searchTerm ? clearSearch : () => router.push('/residents/new')}
                    actionText={searchTerm ? 'Clear Search' : '+ Add New Resident'}
                />
            </div>
           )}
          {hasMore && !loading && (
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
         <Button onClick={clearSearch} variant="destructive" className="w-full">Clear All Filters</Button>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-slate-900 text-gray-200">

        <div className="p-4">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="Total Population" value={loading ? '...' : allResidents.length} />
            <StatCard title="Registered Voters" value={loading ? '...' : '5,109'} />
            <StatCard title="Households" value={loading ? '...' : '1,567'} />
            <StatCard title="Tagged Residents" value={loading ? '...' : '560'} />
          </div>
        </div>

        <div className="p-4 bg-slate-900/50 border-y border-slate-700 flex flex-wrap items-center gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search by name or RBI ID..."
              className="bg-slate-800 border-slate-600 text-white pl-10 h-12"
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
                  {selectedPuroks.size > 0 && <Badge variant="secondary" className="ml-2">{selectedPuroks.size}</Badge>}
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
                   {selectedSectors.size > 0 && <Badge variant="secondary" className="ml-2">{selectedSectors.size}</Badge>}
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
             {(selectedPuroks.size > 0 || selectedSectors.size > 0 || searchTerm) && (
              <Button variant="ghost" onClick={clearSearch}>Clear</Button>
            )}
          </div>

          <div className="hidden md:flex justify-end gap-2">
            <Button variant="outline" className="h-12">
              <FileDown className="mr-2 h-4 w-4" /> Export
            </Button>
             <Button variant="secondary" className="h-12 text-lg px-6" onClick={handleSeedData} disabled={isSeeding}>
                {isSeeding ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <Plus className="mr-2 h-6 w-6" />}
                {isSeeding ? 'Seeding...' : 'Seed Data'}
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 h-12 text-lg px-6" onClick={() => router.push('/residents/new')}>
              <Plus className="mr-2 h-6 w-6" /> New Resident
            </Button>
          </div>
        </div>

        {isMobile ? renderMobileView() : renderDesktopView()}
      

      <ResidentProfileDrawer
        resident={selectedResident}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onEdit={handleEditResident}
        userRole="SECRETARY"
      />
      
      <NewResidentModal 
        isOpen={isNewResidentModalOpen}
        onClose={handleCloseModal}
        residentToEdit={editingResident}
      />

      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-800/80 backdrop-blur-lg border-t border-slate-700 p-2 flex justify-around items-center">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" className="flex flex-col h-auto">
                        <Filter className="h-6 w-6" />
                        <span className="text-xs">Filters</span>
                         { (selectedPuroks.size > 0 || selectedSectors.size > 0) && <Badge variant="destructive" className="absolute top-0 right-2 w-4 h-4 p-0 text-xs">{selectedPuroks.size + selectedSectors.size}</Badge>}
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
            
            <Button className="bg-blue-600 hover:bg-blue-700 rounded-full h-16 w-16 text-lg absolute -top-8 shadow-lg border-4 border-slate-900" onClick={() => router.push('/residents/new')}>
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
}


export default function ResidentRecords() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResidentRecordsContent />
        </Suspense>
    );
}

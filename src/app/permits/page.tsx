
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  MoreVertical,
  Search,
  Plus,
  FileDown,
  Printer,
  ChevronDown,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import NewPermitModal from '@/components/permits/NewPermitModal';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { businessPermitConverter, type BusinessPermit } from '@/lib/firebase/schema';
import { Skeleton } from '@/components/ui/skeleton';

const statusStyles: Record<string, string> = {
  Active: 'bg-green-600',
  Inactive: 'bg-red-600',
  'Pending Renewal': 'bg-yellow-600',
};


export default function BusinessPermitsPage() {
  const [permits, setPermits] = useState<BusinessPermit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewPermitModalOpen, setIsNewPermitModalOpen] = useState(false);

  useEffect(() => {
    const permitsRef = collection(db, 'business_permits').withConverter(businessPermitConverter);
    const q = query(permitsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const permitsData: BusinessPermit[] = [];
        querySnapshot.forEach((doc) => {
            permitsData.push(doc.data());
        });
        setPermits(permitsData);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching permits: ", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredPermits = useMemo(() => {
    return permits.filter(permit =>
        (permit.businessName && permit.businessName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (permit.owner && permit.owner.fullName && permit.owner.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (permit.permitNo && permit.permitNo.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, permits]);
  
  
   const renderLoadingSkeleton = () => (
    Array.from({ length: 5 }).map((_, i) => (
      <TableRow key={i} className="border-slate-800 h-[70px]">
        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
        <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
        <TableCell className="text-right"><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
      </TableRow>
    ))
  );

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-gray-200 font-sans p-4 sm:p-6 lg:p-8">
      <header className="flex items-center justify-between pb-4 border-b border-slate-700 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Business Permits</h1>
          <p className="text-slate-400 text-sm sm:text-base">Logbook of all registered businesses.</p>
        </div>
        <Link href="/" passHref>
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Hub
          </Button>
        </Link>
      </header>
      

      <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="relative flex-grow min-w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search Business or Owner..."
                className="bg-slate-800 border-slate-600 text-white pl-10 h-12"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
          </div>
          <div className="flex gap-2">
              <Button variant="outline" className="h-12">
                  Type <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
               <Button variant="outline" className="h-12">
                  Status <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
          </div>
          <div className="flex gap-2 ml-auto">
              <Button variant="outline" className="h-12">
                  <FileDown className="mr-2 h-4 w-4" /> Export
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 h-12 text-lg px-6" onClick={() => setIsNewPermitModalOpen(true)}>
                  <Plus className="mr-2 h-6 w-6" /> New Permit
              </Button>
          </div>
      </div>

      <div className="border border-slate-700 rounded-lg flex-1 overflow-y-auto">
          <Table>
              <TableHeader>
                  <TableRow className="border-slate-700 hover:bg-slate-800/50">
                      <TableHead>Business Name</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Type</TableHead>
                       <TableHead>Purok</TableHead>
                      <TableHead>Issued</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-16 text-right"></TableHead>
                  </TableRow>
              </TableHeader>
              <TableBody>
                  {loading ? renderLoadingSkeleton() : filteredPermits.map((permit) => (
                      <TableRow key={permit.id} className="border-slate-800 hover:bg-slate-800/50">
                           <TableCell className="font-medium">{permit.businessName}</TableCell>
                           <TableCell>{permit.owner.fullName}</TableCell>
                           <TableCell>{permit.category}</TableCell>
                           <TableCell>{permit.businessAddress.purok}</TableCell>
                           <TableCell>{permit.issuedAt?.toDate ? new Date(permit.issuedAt.seconds * 1000).toLocaleDateString() : 'Pending...'}</TableCell>
                           <TableCell>
                              <Badge className={`${statusStyles[permit.status]} text-white`}>
                                  {permit.status}
                              </Badge>
                           </TableCell>
                           <TableCell className="text-right">
                              <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                          <MoreVertical className="h-5 w-5" />
                                      </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="bg-slate-800 text-white border-slate-700">
                                      <DropdownMenuItem>View Details</DropdownMenuItem>
                                      <DropdownMenuItem>Print Certificate</DropdownMenuItem>
                                      <DropdownMenuItem>View Audit Log</DropdownMenuItem>
                                  </DropdownMenuContent>
                              </DropdownMenu>
                           </TableCell>
                      </TableRow>
                  ))}
              </TableBody>
          </Table>
      </div>

       <NewPermitModal isOpen={isNewPermitModalOpen} onClose={() => setIsNewPermitModalOpen(false)} />

    </div>
  );
}

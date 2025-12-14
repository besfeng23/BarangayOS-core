
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { BusinessPermit as AppBusinessPermit } from '@/types/permits';
import type { PermitStatus, PaymentStatus } from '@/types/permits';
import NewApplicationModal from '@/components/permits/NewApplicationModal';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { businessPermitConverter, type BusinessPermit } from '@/lib/firebase/schema';
import { Skeleton } from '@/components/ui/skeleton';

const statusStyles: Record<PermitStatus, string> = {
  DRAFT: 'bg-gray-500',
  PENDING_REVIEW: 'bg-yellow-500 text-yellow-900',
  FOR_PAYMENT: 'bg-blue-500',
  FOR_INSPECTION: 'bg-purple-500',
  FOR_APPROVAL: 'bg-cyan-500',
  FOR_RELEASE: 'bg-teal-500',
  RELEASED: 'bg-green-600',
  REJECTED: 'bg-red-600',
  CANCELLED: 'bg-red-800',
};

const paymentStatusStyles: Record<PaymentStatus, string> = {
  UNPAID: 'border-yellow-500 text-yellow-500',
  PAID: 'border-green-500 text-green-500',
  PARTIAL: 'border-blue-500 text-blue-500',
  WAIVED: 'border-gray-500 text-gray-500',
};

const StatCard = ({ title, value, subtext, className }: { title: string; value: string | number, subtext: string, className?: string }) => (
    <Card className={`border-slate-700 flex-1 cursor-pointer hover:brightness-110 transition-all ${className}`}>
        <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-white/90">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="text-4xl font-bold">{value}</div>
            <p className="text-xs text-white/70">{subtext}</p>
        </CardContent>
    </Card>
);

export default function BusinessPermitsPage() {
  const [permits, setPermits] = useState<BusinessPermit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPermits, setSelectedPermits] = useState<Set<string>>(new Set());
  const [isNewApplicationModalOpen, setIsNewApplicationModalOpen] = useState(false);

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
  
  const kpiValues = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return {
        pendingReview: permits.filter(p => p.status === 'PENDING_REVIEW').length,
        forPayment: permits.filter(p => p.status === 'FOR_PAYMENT').length,
        forRelease: permits.filter(p => p.status === 'FOR_RELEASE').length,
        releasedToday: permits.filter(p => 
            p.status === 'RELEASED' && 
            p.releasedAt && 
            p.releasedAt.toDate().setHours(0,0,0,0) === today.getTime()
        ).length,
        expired: permits.filter(p => p.validUntil && p.validUntil.toDate() < new Date()).length
    };
  }, [permits]);


  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPermits(new Set(filteredPermits.map(p => p.id)));
    } else {
      setSelectedPermits(new Set());
    }
  };

  const handleSelectRow = (permitId: string) => {
    setSelectedPermits(prev => {
      const newSet = new Set(prev);
      if (newSet.has(permitId)) {
        newSet.delete(permitId);
      } else {
        newSet.add(permitId);
      }
      return newSet;
    });
  };
  
   const renderLoadingSkeleton = () => (
    Array.from({ length: 5 }).map((_, i) => (
      <TableRow key={i} className="border-slate-800 h-[70px]">
        <TableCell><Skeleton className="h-4 w-4" /></TableCell>
        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
        <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
        <TableCell className="text-right"><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
      </TableRow>
    ))
  );

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-gray-200 font-sans p-4 sm:p-6 lg:p-8">
      <header className="flex items-center justify-between pb-4 border-b border-slate-700 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Business Permits</h1>
          <p className="text-slate-400 text-sm sm:text-base">Manage all business applications and permits.</p>
        </div>
        <Link href="/" passHref>
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Hub
          </Button>
        </Link>
      </header>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <StatCard title="Pending Review" value={kpiValues.pendingReview} subtext="New & Renewals" className="bg-slate-800" />
          <StatCard title="For Payment" value={kpiValues.forPayment} subtext="Approved applications" className="bg-amber-600 text-white" />
          <StatCard title="For Release" value={kpiValues.forRelease} subtext="Paid & ready" className="bg-slate-800" />
          <StatCard title="Released Today" value={kpiValues.releasedToday} subtext="Total permits issued" className="bg-emerald-700 text-white" />
          <StatCard title="Expired / For Renewal" value={kpiValues.expired} subtext="Next 30 days" className="bg-red-900 text-white" />
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="relative flex-grow min-w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search Business, Owner, or Permit #"
                className="bg-slate-800 border-slate-600 text-white pl-10 h-12"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
          </div>
          <div className="flex gap-2">
              <Button variant="outline" className="h-12">
                  Status <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" className="h-12">
                  Type <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
               <Button variant="outline" className="h-12">
                  Payment <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
          </div>
          <div className="flex gap-2 ml-auto">
              <Button variant="outline" className="h-12" disabled={selectedPermits.size === 0}>
                  <FileDown className="mr-2 h-4 w-4" /> Export
              </Button>
              <Button variant="outline" className="h-12" disabled={selectedPermits.size === 0}>
                  <Printer className="mr-2 h-4 w-4" /> Print Batch
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 h-12 text-lg px-6" onClick={() => setIsNewApplicationModalOpen(true)}>
                  <Plus className="mr-2 h-6 w-6" /> New Application
              </Button>
          </div>
      </div>

      <div className="border border-slate-700 rounded-lg flex-1 overflow-y-auto">
          <Table>
              <TableHeader>
                  <TableRow className="border-slate-700 hover:bg-slate-800/50">
                      <TableHead className="w-12">
                          <Checkbox 
                            checked={selectedPermits.size === filteredPermits.length && filteredPermits.length > 0}
                            onCheckedChange={(checked) => handleSelectAll(Boolean(checked))}
                          />
                      </TableHead>
                      <TableHead>Permit #</TableHead>
                      <TableHead>Business Name</TableHead>
                      <TableHead>Owner</TableHead>
                       <TableHead>Purok</TableHead>
                      <TableHead>Filed</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead className="w-16 text-right"></TableHead>
                  </TableRow>
              </TableHeader>
              <TableBody>
                  {loading ? renderLoadingSkeleton() : filteredPermits.map((permit) => (
                      <TableRow key={permit.id} className="border-slate-800 hover:bg-slate-800/50">
                           <TableCell>
                              <Checkbox 
                                checked={selectedPermits.has(permit.id)}
                                onCheckedChange={() => handleSelectRow(permit.id)}
                              />
                           </TableCell>
                           <TableCell className="font-mono">{permit.permitNo}</TableCell>
                           <TableCell className="font-medium">{permit.businessName}</TableCell>
                           <TableCell>{permit.owner.fullName}</TableCell>
                           <TableCell>{permit.businessAddress.purok}</TableCell>
                           <TableCell>{permit.filedAt?.toDate ? new Date(permit.filedAt.seconds * 1000).toLocaleDateString() : 'Pending...'}</TableCell>
                           <TableCell>
                              <Badge className={`${statusStyles[permit.status]} text-white`}>
                                  {permit.status.replace(/_/g, ' ')}
                              </Badge>
                           </TableCell>
                           <TableCell>
                              <Badge variant="outline" className={paymentStatusStyles[permit.payment.status]}>
                                  {permit.payment.status}
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
                                      <DropdownMenuItem>Open</DropdownMenuItem>
                                      <DropdownMenuItem>Print Permit</DropdownMenuItem>
                                      <DropdownMenuItem>View Audit Log</DropdownMenuItem>
                                  </DropdownMenuContent>
                              </DropdownMenu>
                           </TableCell>
                      </TableRow>
                  ))}
              </TableBody>
          </Table>
      </div>

       <NewApplicationModal isOpen={isNewApplicationModalOpen} onClose={() => setIsNewApplicationModalOpen(false)} />

    </div>
  );
}

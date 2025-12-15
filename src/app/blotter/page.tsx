
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Printer, ArrowLeft } from 'lucide-react';
import NewEntryModal from '@/components/blotter/BlotterLogModule/NewEntryModal';
import PrintPreviewModal from '@/components/blotter/KPForm7/PrintPreviewModal';
import type { BlotterCase as BlotterCaseType } from '@/types/blotter';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { blotterCaseConverter, type BlotterCase as BlotterCaseSchema } from '@/lib/firebase/schema';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

const statusStyles: Record<BlotterCaseType['status'], string> = {
  ACTIVE: 'bg-blue-600 hover:bg-blue-700',
  SETTLED: 'bg-green-600 hover:bg-green-700',
  FOR_HEARING: 'bg-orange-600 hover:bg-orange-700',
};

const BlotterLogModule = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isNewEntryModalOpen, setIsNewEntryModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<BlotterCaseType | null>(null);
  const [cases, setCases] = useState<BlotterCaseSchema[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);

    const blotterRef = collection(db, 'blotter_cases').withConverter(blotterCaseConverter);
    const q = query(blotterRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const casesData: BlotterCaseSchema[] = [];
        querySnapshot.forEach((doc) => {
            casesData.push(doc.data());
        });
        setCases(casesData);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching blotter cases: ", error);
        setLoading(false);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, []);

  const handlePrintClick = (caseData: BlotterCaseType) => {
    setSelectedCase(caseData);
    setIsPrintModalOpen(true);
  };
  
  const renderLoadingSkeleton = () => (
    Array.from({ length: 3 }).map((_, i) => (
      <TableRow key={i} className="border-slate-800 h-[70px]">
        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
        <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
        <TableCell className="text-right"><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
      </TableRow>
    ))
  );


  return (
    <div className="flex flex-col h-screen bg-slate-950 text-gray-200 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center gap-4">
            <Link href="/" passHref>
                <Button variant="outline" size="icon">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
            </Link>
            <h1 className="text-2xl font-bold">Blotter Log Records</h1>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full ${isOnline ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
          <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
          {isOnline ? 'Online' : 'Offline'}
        </div>
      </header>

      {/* Main Body */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-full md:w-64 bg-slate-900 p-4 space-y-6 border-b md:border-b-0 md:border-r border-slate-700">
          <div className="space-y-2">
            <Button variant="ghost" className="w-full justify-start text-lg bg-slate-700">All Cases</Button>
            <Button variant="ghost" className="w-full justify-start text-lg">For Hearing</Button>
            <Button variant="ghost" className="w-full justify-start text-lg">Settled</Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search Name or Case #"
              className="bg-slate-950 border-slate-600 text-white pl-10 h-12"
            />
          </div>
        </aside>

        {/* Right Content */}
        <main className="flex-1 p-6 flex flex-col">
          <div className="flex justify-end mb-6">
            <Button className="bg-blue-600 hover:bg-blue-700 h-14 text-lg px-6" onClick={() => setIsNewEntryModalOpen(true)}>
              <Plus className="mr-2 h-6 w-6" />
              NEW BLOTTER ENTRY
            </Button>
          </div>
          <div className="border border-slate-700 rounded-lg flex-1 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700 hover:bg-slate-800/50">
                  <TableHead className="text-lg text-gray-300">Case ID</TableHead>
                  <TableHead className="text-lg text-gray-300">Date Filed</TableHead>
                  <TableHead className="text-lg text-gray-300">Complainant</TableHead>
                  <TableHead className="text-lg text-gray-300">Nature of Case</TableHead>
                  <TableHead className="text-lg text-gray-300">Status</TableHead>
                  <TableHead className="text-lg text-gray-300 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? renderLoadingSkeleton() : cases.map((c) => (
                  <TableRow key={c.id} className="border-slate-800 h-[70px] hover:bg-slate-800/50">
                    <TableCell className="font-mono text-lg">{c.caseId}</TableCell>
                    <TableCell className="text-lg">{c.createdAt?.toDate ? format(c.createdAt.toDate(), 'yyyy-MM-dd') : 'Just Now'}</TableCell>
                    <TableCell className="text-lg">{c.complainant}</TableCell>
                    <TableCell className="text-lg">{c.nature}</TableCell>
                    <TableCell>
                      <Badge className={statusStyles[c.status]}>{c.status.replace('_', ' ')}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handlePrintClick(c)}>
                        <Printer className="h-5 w-5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </main>
      </div>
      <NewEntryModal isOpen={isNewEntryModalOpen} onClose={() => setIsNewEntryModalOpen(false)} isOnline={isOnline} />
      {selectedCase && (
        <PrintPreviewModal 
          isOpen={isPrintModalOpen} 
          onClose={() => setIsPrintModalOpen(false)} 
          caseData={selectedCase}
        />
      )}
    </div>
  );
};

export default BlotterLogModule;

    
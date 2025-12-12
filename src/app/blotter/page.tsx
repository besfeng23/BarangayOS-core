
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Plus } from 'lucide-react';
import NewEntryModal from '@/components/blotter/BlotterLogModule/NewEntryModal';

type CaseStatus = 'ACTIVE' | 'SETTLED' | 'FOR_HEARING';

interface BlotterCase {
  id: string;
  caseId: string;
  date: string;
  complainant: string;
  nature: string;
  status: CaseStatus;
}

const mockCases: BlotterCase[] = [
  { id: '1', caseId: '2024-001', date: '2024-07-28', complainant: 'Juan Dela Cruz', nature: 'Noise Complaint', status: 'ACTIVE' },
  { id: '2', caseId: '2024-002', date: '2024-07-27', complainant: 'Maria Santos', nature: 'Unjust Vexation', status: 'SETTLED' },
  { id: '3', caseId: '2024-003', date: '2024-07-26', complainant: 'Pedro Penduko', nature: 'Gossip', status: 'FOR_HEARING' },
];

const statusStyles: Record<CaseStatus, string> = {
  ACTIVE: 'bg-blue-600 hover:bg-blue-700',
  SETTLED: 'bg-green-600 hover:bg-green-700',
  FOR_HEARING: 'bg-orange-600 hover:bg-orange-700',
};

const BlotterLogModule = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-gray-200 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-slate-700">
        <h1 className="text-2xl font-bold">Blotter Log Records</h1>
        <div className={`flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full ${isOnline ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
          <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
          {isOnline ? 'Online' : 'Offline'}
        </div>
      </header>

      {/* Main Body */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-full md:w-64 bg-slate-800 p-4 space-y-6 border-b md:border-b-0 md:border-r border-slate-700">
          <div className="space-y-2">
            <Button variant="ghost" className="w-full justify-start text-lg bg-slate-700">All Cases</Button>
            <Button variant="ghost" className="w-full justify-start text-lg">For Hearing</Button>
            <Button variant="ghost" className="w-full justify-start text-lg">Settled</Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search Name or Case #"
              className="bg-slate-900 border-slate-600 text-white pl-10 h-12"
            />
          </div>
        </aside>

        {/* Right Content */}
        <main className="flex-1 p-6 flex flex-col">
          <div className="flex justify-end mb-6">
            <Button className="bg-blue-600 hover:bg-blue-700 h-14 text-lg px-6" onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-2 h-6 w-6" />
              NEW BLOTTER ENTRY
            </Button>
          </div>
          <div className="border border-slate-700 rounded-lg flex-1 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700 hover:bg-slate-800/50">
                  <TableHead className="text-lg text-gray-300">Case ID</TableHead>
                  <TableHead className="text-lg text-gray-300">Date</TableHead>
                  <TableHead className="text-lg text-gray-300">Complainant</TableHead>
                  <TableHead className="text-lg text-gray-300">Nature of Case</TableHead>
                  <TableHead className="text-lg text-gray-300">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockCases.map((c) => (
                  <TableRow key={c.id} className="border-slate-800 h-[70px] hover:bg-slate-800/50">
                    <TableCell className="font-mono text-lg">{c.caseId}</TableCell>
                    <TableCell className="text-lg">{c.date}</TableCell>
                    <TableCell className="text-lg">{c.complainant}</TableCell>
                    <TableCell className="text-lg">{c.nature}</TableCell>
                    <TableCell>
                      <Badge className={statusStyles[c.status]}>{c.status.replace('_', ' ')}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </main>
      </div>
      <NewEntryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default BlotterLogModule;

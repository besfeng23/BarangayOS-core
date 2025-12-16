
'use client';

import React from 'react';
import {
  FileText,
  Search,
  Plus,
  Printer,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import BlotterCaseCard from '@/components/blotter/BlotterCaseCard';
import type { BlotterCase as BlotterCaseType } from '@/types/blotter';
import NewEntryModal from '@/components/blotter/BlotterLogModule/NewEntryModal';
import PrintPreviewModal from '@/components/blotter/KPForm7/PrintPreviewModal';
import { useSearchParams } from 'next/navigation';
import { onSnapshot, collection, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { blotterCaseConverter } from '@/lib/firebase/schema';

const BlotterLogPage = () => {
  const [cases, setCases] = React.useState<BlotterCaseType[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedCase, setSelectedCase] = React.useState<BlotterCaseType | null>(null);
  const [isNewEntryModalOpen, setIsNewEntryModalOpen] = React.useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = React.useState(false);
  const isMobile = useIsMobile();
  const [isOnline, setIsOnline] = React.useState(true); // Mock connectivity

  const searchParams = useSearchParams();

  React.useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setIsNewEntryModalOpen(true);
    }
  }, [searchParams]);

  React.useEffect(() => {
    const casesRef = collection(db, 'blotter_cases').withConverter(blotterCaseConverter);
    const q = query(casesRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedCases = snapshot.docs.map(doc => doc.data() as BlotterCaseType);
      setCases(fetchedCases);
      if (fetchedCases.length > 0 && !selectedCase) {
        setSelectedCase(fetchedCases[0]);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching blotter cases: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedCase]);

  const handlePrint = (caseData: BlotterCaseType) => {
    setSelectedCase(caseData);
    setIsPrintModalOpen(true);
  };
  
  const SidebarContent = () => (
     <div className="bg-slate-900 h-full flex flex-col">
        <div className="p-4 border-b border-slate-700">
            <h2 className="text-xl font-bold">Blotter Cases</h2>
        </div>
         <div className="p-4">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input placeholder="Search Case..." className="bg-slate-800 border-slate-600 text-white pl-10 h-11" />
            </div>
             <div className="flex gap-2 mt-2">
                <Button variant="outline" className="flex-1">All Cases</Button>
                <Button variant="ghost" className="flex-1">For Hearing</Button>
                <Button variant="ghost" className="flex-1">Settled</Button>
            </div>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 px-4">
            {loading && <p>Loading cases...</p>}
            {cases.map(c => (
                <BlotterCaseCard 
                    key={c.id} 
                    caseNumber={c.caseId}
                    complainant={c.complainant}
                    respondent={c.respondent || ''}
                    type={c.nature}
                    status={c.status === 'ACTIVE' ? 'Pending' : 'Resolved'}
                    date={new Date(c.incidentAt.seconds * 1000).toLocaleDateString()}
                    onSelect={() => setSelectedCase(c)}
                />
            ))}
        </div>
     </div>
  );

  const MainContent = () => (
    <div className="bg-slate-950 p-6 flex-1 flex flex-col">
        {selectedCase ? (
            <>
                <div className="flex justify-between items-center pb-4 border-b border-slate-700">
                    <div>
                        <Badge className="bg-yellow-900/30 text-yellow-500 text-sm font-bold mb-2">{selectedCase.status}</Badge>
                        <h1 className="text-3xl font-bold">{selectedCase.nature}</h1>
                        <p className="text-slate-400 font-mono">{selectedCase.caseId}</p>
                    </div>
                    <Button className="h-12 text-lg" onClick={() => handlePrint(selectedCase)}>
                        <Printer className="mr-2 h-5 w-5" />
                        Print KP Form #7
                    </Button>
                </div>
                <div className="mt-6 space-y-4 text-lg">
                    <p><strong>Complainant:</strong> {selectedCase.complainant}</p>
                    <p><strong>Respondent:</strong> {selectedCase.respondent}</p>
                    <p><strong>Date of Incident:</strong> {new Date(selectedCase.incidentAt.seconds * 1000).toLocaleString()}</p>
                </div>
                 <div className="mt-6">
                    <h3 className="font-bold text-xl mb-2">Narrative</h3>
                    <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 max-h-96 overflow-y-auto">
                        <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{selectedCase.narrative}</p>
                    </div>
                </div>
            </>
        ) : (
            <div className="flex items-center justify-center h-full">
                <p className="text-slate-500">Select a case to view details or create a new entry.</p>
            </div>
        )}
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-900 text-gray-200 font-sans">
      
      <header className="fixed top-0 left-0 right-0 z-20 h-16 bg-slate-950/80 backdrop-blur-lg border-b border-slate-700 flex items-center justify-between px-4">
        <Link href="/" passHref>
          <Button variant="ghost">Back to Hub</Button>
        </Link>
        <h1 className="text-xl font-bold">Blotter Log Module</h1>
        <Button className="bg-blue-600 hover:bg-blue-700 h-11 text-lg" onClick={() => setIsNewEntryModalOpen(true)}>
          <Plus className="mr-2 h-5 w-5"/>
          New Entry
        </Button>
      </header>

      <main className="flex pt-16 h-full w-full">
        {isMobile ? (
          <div className="w-full">
            {selectedCase ? <MainContent /> : <SidebarContent />}
          </div>
        ) : (
          <>
            <aside className="w-96 border-r border-slate-700">
              <SidebarContent />
            </aside>
            <section className="flex-1">
              <MainContent />
            </section>
          </>
        )}
      </main>

      <NewEntryModal 
        isOpen={isNewEntryModalOpen} 
        onClose={() => setIsNewEntryModalOpen(false)}
        isOnline={isOnline}
      />
      {selectedCase && <PrintPreviewModal 
        isOpen={isPrintModalOpen} 
        onClose={() => setIsPrintModalOpen(false)}
        caseData={selectedCase}
      />}
    </div>
  );
};

export default BlotterLogPage;

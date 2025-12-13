'use client';

import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Resident, UserRole, BlotterCaseSummary } from '@/types';
import { Shield, FileText, Users, Briefcase, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface ResidentProfileDrawerProps {
  resident: Resident | null;
  isOpen: boolean;
  onClose: () => void;
  userRole: UserRole;
}

const getInitials = (name: string) => {
  const names = name.split(' ');
  const initials = names.map((n) => n[0]).join('');
  return initials.slice(0, 2).toUpperCase();
};

const mockBlotterHistory: BlotterCaseSummary[] = [
    { caseId: 'blot-1', caseNo: '2024-001', title: 'Noise Complaint', status: 'pending', role: 'respondent'},
    { caseId: 'blot-2', caseNo: '2023-105', title: 'Unjust Vexation', status: 'settled', role: 'complainant'},
];

const mockDocumentHistory = [
    { id: 'doc-1', type: 'Barangay Clearance', date: '2024-06-15', issuedBy: 'Jane Doe' },
    { id: 'doc-2', type: 'Certificate of Indigency', date: '2023-11-20', issuedBy: 'Jane Doe' },
];

const InfoField = ({ label, value }: { label: string; value: string | undefined | null }) => (
  <div>
    <p className="text-sm text-slate-400">{label}</p>
    <p className="font-medium text-lg">{value || 'N/A'}</p>
  </div>
);


const ResidentProfileDrawer = ({
  resident,
  isOpen,
  onClose,
  userRole,
}: ResidentProfileDrawerProps) => {
  if (!resident) return null;

  const canSeeBlotter = userRole === 'BARANGAY_CAPTAIN' || userRole === 'SECRETARY' || userRole === 'SUPER_ADMIN';

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full md:w-3/5 lg:w-2/5 xl:w-1/3 bg-slate-900 border-l border-slate-700 text-white p-0 overflow-y-auto">
        <SheetHeader className="p-6 bg-slate-800/50">
          <div className="flex items-start gap-4">
            <Avatar className="w-24 h-24 text-4xl">
              <AvatarImage src={resident.photoFilePath} />
              <AvatarFallback>{getInitials(resident.displayName)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <SheetTitle className="text-3xl font-bold">{resident.displayName}</SheetTitle>
              <SheetDescription className="text-slate-400">
                RBI ID: {resident.rbiId} &middot; {resident.status.toUpperCase()}
              </SheetDescription>
              <div className="mt-4 flex gap-2">
                <Button size="sm">
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
                <Button size="sm" variant="outline">
                  <PlusCircle className="mr-2 h-4 w-4" /> Issue Document
                </Button>
                 <Button size="sm" variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" /> Archive
                </Button>
              </div>
            </div>
          </div>
        </SheetHeader>

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 gap-1 bg-slate-800/50 p-2 h-auto">
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="household">Household</TabsTrigger>
            <TabsTrigger value="socio-economic">Socio-Econ</TabsTrigger>
            {canSeeBlotter && <TabsTrigger value="blotter" className="text-red-400">Blotter</TabsTrigger>}
            <TabsTrigger value="documents">Docs</TabsTrigger>
          </TabsList>

          <div className="p-6">
            <TabsContent value="personal">
              <div className="grid grid-cols-2 gap-x-6 gap-y-8">
                <InfoField label="First Name" value={resident.fullName.first} />
                <InfoField label="Last Name" value={resident.fullName.last} />
                <InfoField label="Middle Name" value={resident.fullName.middle} />
                <InfoField label="Suffix" value={resident.fullName.suffix} />
                <InfoField label="Date of Birth" value={format(new Date(resident.dateOfBirth.seconds * 1000), 'MMMM d, yyyy')} />
                <InfoField label="Place of Birth" value={resident.placeOfBirth} />
                <InfoField label="Sex" value={resident.sex === 'M' ? 'Male' : 'Female'} />
                <InfoField label="Civil Status" value={resident.civilStatus} />
                <InfoField label="Mobile" value={resident.contact.mobile} />
                <InfoField label="Email" value={resident.contact.email} />
                <InfoField label="Voter" value={resident.voter?.isVoter ? `Yes - Precinct ${resident.voter.precinctNumber}` : 'No'} />
                <InfoField label="Consent Signed" value={resident.consent.signed ? `Yes, on ${format(new Date(resident.consent.signedAt!.seconds * 1000), 'yyyy-MM-dd')}` : 'No'} />
              </div>
            </TabsContent>
            
            <TabsContent value="household">
                <p>Household Info Coming Soon...</p>
            </TabsContent>

            <TabsContent value="socio-economic">
               <div className="space-y-4">
                    <h3 className="font-bold text-xl mb-2">Sectoral Information</h3>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(resident.sectorFlags).map(([key, value]) => value && <Badge key={key}>{key.replace(/([A-Z])/g, ' $1').toUpperCase()}</Badge>)}
                    </div>
                    {Object.values(resident.sectorFlags).every(v => !v) && <p className="text-slate-400">No sectoral tags.</p>}
               </div>
            </TabsContent>

            {canSeeBlotter && (
              <TabsContent value="blotter">
                <div className="space-y-4">
                  {mockBlotterHistory.map(c => (
                     <div key={c.caseId} className="flex items-center gap-4 p-3 bg-slate-800 rounded-md">
                        <Shield className="h-6 w-6 text-red-400"/>
                        <div className="flex-1">
                            <p className="font-bold">{c.title} <span className="text-xs font-mono text-slate-400">{c.caseNo}</span></p>
                            <p className="text-sm capitalize">{c.role}</p>
                        </div>
                        <Badge variant={c.status === 'settled' ? 'default' : 'destructive'}>{c.status.toUpperCase()}</Badge>
                     </div>
                  ))}
                  {mockBlotterHistory.length === 0 && <p className="text-slate-400">No blotter history found for this resident.</p>}
                </div>
              </TabsContent>
            )}

            <TabsContent value="documents">
              <div className="space-y-4">
                  {mockDocumentHistory.map(doc => (
                     <div key={doc.id} className="flex items-center gap-4 p-3 bg-slate-800 rounded-md">
                        <FileText className="h-6 w-6 text-blue-400"/>
                        <div className="flex-1">
                            <p className="font-bold">{doc.type}</p>
                            <p className="text-sm text-slate-400">Issued on {doc.date} by {doc.issuedBy}</p>
                        </div>
                        <Button variant="outline" size="sm">Reprint</Button>
                     </div>
                  ))}
                  {mockDocumentHistory.length === 0 && <p className="text-slate-400">No documents have been issued to this resident.</p>}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default ResidentProfileDrawer;


'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, UserSearch, FileCheck2, Bot, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Resident } from '@/types';
import { mockResidents } from '@/data/residents-mock';

// Mock data for certificate templates
const mockTemplates = [
  {
    id: 'cert-1',
    name: 'Barangay Clearance',
    fee: 50.0,
    validityDays: 30,
    requirements: ['Valid ID'],
    requiredFields: ['purpose'],
  },
  {
    id: 'cert-2',
    name: 'Certificate of Residency',
    fee: 0,
    validityDays: 0,
    requirements: ['Proof of Billing'],
    requiredFields: ['purpose'],
  },
  {
    id: 'cert-3',
    name: 'Certificate of Indigency',
    fee: 0,
    validityDays: 180,
    requirements: ['Interview with Social Worker'],
    requiredFields: [],
  },
  {
    id: 'cert-4',
    name: 'Business Clearance',
    fee: 250.0,
    validityDays: 365,
    requirements: ['DTI Registration', 'Owner ID'],
    requiredFields: ['businessName', 'businessType'],
  },
];

const getInitials = (name: string) => {
    if (!name) return 'N/A';
    const names = name.split(' ');
    const initials = names.map((n) => n[0]).join('');
    return initials.slice(0, 2).toUpperCase();
};


export default function CertificatesPage() {
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<(typeof mockTemplates)[0] | null>(null);
  const [step, setStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredResidents = mockResidents.filter(
    (r) =>
      r.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.rbiId.includes(searchTerm)
  );

  const handleSelectResident = (resident: Resident) => {
    setSelectedResident(resident);
    setStep(2);
  };

  const handleSelectTemplate = (template: (typeof mockTemplates)[0]) => {
    setSelectedTemplate(template);
    setStep(3);
  };
  
  const resetFlow = () => {
    setSelectedResident(null);
    setSelectedTemplate(null);
    setStep(1);
  }

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-gray-200 font-sans p-4 sm:p-6 lg:p-8">
      <header className="flex items-center justify-between pb-4 border-b border-slate-700 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Issue Certificate</h1>
          <p className="text-slate-400 text-sm sm:text-base">
            Follow the steps to generate a new barangay document.
          </p>
        </div>
        <Link href="/" passHref>
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Hub
          </Button>
        </Link>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
        {/* Step 1: Resident Finder */}
        <Card className={`bg-slate-800/50 border-slate-700 flex flex-col ${step > 1 ? 'opacity-50' : ''}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <UserSearch className="text-blue-400" />
              Step 1: Find the Resident
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col flex-1 gap-4">
            <Input
              placeholder="Search by name or RBI ID..."
              className="bg-slate-900 border-slate-600 h-12 text-lg"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              disabled={step > 1}
            />
            <ScrollArea className="flex-1">
                <div className="space-y-2 pr-4">
                    {filteredResidents.map(res => (
                        <div key={res.id} onClick={() => step === 1 && handleSelectResident(res)} className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-700 cursor-pointer">
                            <Avatar>
                                <AvatarImage src={res.photoFilePath} />
                                <AvatarFallback>{getInitials(res.displayName)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{res.displayName}</p>
                                <p className="text-sm text-slate-400">{res.rbiId} &middot; {res.addressSnapshot.purok}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
             <Button variant="outline" className="w-full h-12 text-lg" disabled={step > 1}>
              Walk-in (No Record)
            </Button>
          </CardContent>
        </Card>

        {/* Step 2: Certificate Type */}
        <Card className={`bg-slate-800/50 border-slate-700 flex flex-col ${step !== 2 ? 'opacity-50' : ''}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <FileCheck2 className="text-blue-400" />
              Step 2: Choose Certificate
            </CardTitle>
            {selectedResident && step >= 2 && (
                <div className="pt-2 text-sm text-slate-300 border-t border-slate-700 mt-2">
                    <p>Requestor: <span className="font-bold">{selectedResident.displayName}</span></p>
                    <Button variant="link" className="p-0 h-auto" onClick={resetFlow}>Change</Button>
                </div>
            )}
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockTemplates.map(t => (
                    <div key={t.id} onClick={() => step === 2 && handleSelectTemplate(t)} className="p-4 bg-slate-900 rounded-lg cursor-pointer hover:ring-2 ring-blue-500">
                        <p className="font-bold text-lg">{t.name}</p>
                        <p className="text-sm text-slate-400">Fee: ₱{t.fee.toFixed(2)}</p>
                        <p className="text-sm text-slate-400">Validity: {t.validityDays > 0 ? `${t.validityDays} days` : 'N/A'}</p>
                    </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Details & Issue */}
        <Card className={`bg-slate-800/50 border-slate-700 flex flex-col ${step !== 3 ? 'opacity-50' : ''}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <Sparkles className="text-blue-400" />
              Step 3: Details & Issue
            </CardTitle>
             {selectedTemplate && step === 3 && (
                <div className="pt-2 text-sm text-slate-300 border-t border-slate-700 mt-2">
                    <p>Certificate: <span className="font-bold">{selectedTemplate.name}</span></p>
                    <Button variant="link" className="p-0 h-auto" onClick={() => setStep(2)}>Change</Button>
                </div>
            )}
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-4">
            {step === 3 && selectedTemplate && (
                <>
                    <div>
                        <label className="text-lg">Purpose</label>
                        <Select>
                            <SelectTrigger className="h-12 text-lg bg-slate-900 border-slate-600 mt-1">
                                <SelectValue placeholder="Select purpose or type..." />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 text-white border-slate-700">
                                <SelectItem value="employment">Local Employment</SelectItem>
                                <SelectItem value="travel">Travel/Transport</SelectItem>
                                <SelectItem value="loan">Loan Application</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {selectedTemplate.requiredFields.includes('businessName') && (
                        <div>
                             <label className="text-lg">Business Name</label>
                             <Input className="h-12 text-lg bg-slate-900 border-slate-600 mt-1"/>
                        </div>
                    )}
                    <div>
                        <label className="text-lg">Additional Notes (optional)</label>
                        <Textarea className="bg-slate-900 border-slate-600 mt-1" />
                    </div>
                    
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost"><Bot className="mr-2" /> AI Assist</Button>
                    </div>
                    
                    <div className="border-t border-slate-700 pt-4 space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400">Fee</span>
                            <span className="font-bold">₱{selectedTemplate.fee.toFixed(2)}</span>
                        </div>
                         <div className="flex justify-between items-center">
                            <span className="text-slate-400">OR Number</span>
                            <Input className="h-10 text-lg bg-slate-900 border-slate-600 w-1/2" placeholder="Enter O.R. #"/>
                        </div>
                    </div>
                </>
            )}
          </CardContent>
           {step === 3 && (
            <div className="p-4 border-t border-slate-700 flex justify-end gap-2">
                <Button variant="outline" className="h-12 text-lg">Save Draft</Button>
                <Button className="bg-blue-600 hover:bg-blue-700 h-12 text-lg">Preview & Issue</Button>
            </div>
           )}
        </Card>
      </div>
    </div>
  );
}

    

"use client";

import React, { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import KPForm7Print from './KPForm7Print';
import type { BlotterCase } from '@/types/blotter';
import { Printer } from 'lucide-react';
import Link from 'next/link';

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseData: BlotterCase;
}

const PrintPreviewModal = ({ isOpen, onClose, caseData }: PrintPreviewModalProps) => {
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-200 border-gray-400 text-black max-w-5xl w-full h-[90vh] flex flex-col no-print">
        <DialogHeader>
          <DialogTitle className="text-2xl text-slate-900">Print Preview: KP Form #7</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto bg-gray-500 p-8">
          {/* This is the component that will be printed */}
          <KPForm7Print ref={componentRef} caseData={caseData} />
        </div>

        <DialogFooter className="mt-4 sm:justify-between">
          <Link href="/" passHref>
             <Button variant="outline" className="h-12 text-lg">Back to Hub</Button>
          </Link>
          <div className="flex gap-2">
            <Button variant="secondary" className="h-12 text-lg" onClick={onClose}>
              Close
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 h-12 text-lg" onClick={handlePrint}>
              <Printer className="mr-2 h-5 w-5" />
              Print Now
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PrintPreviewModal;

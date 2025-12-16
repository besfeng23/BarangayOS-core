
"use client";

import React, { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import PrintableReport from './PrintableReport';
import type { ReportData } from '@/types/reports';

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: ReportData;
}

const PrintPreviewModal = ({ isOpen, onClose, reportData }: PrintPreviewModalProps) => {
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-200 border-gray-400 text-black max-w-5xl w-full h-[90vh] flex flex-col no-print">
        <DialogHeader>
          <DialogTitle className="text-2xl text-slate-900">Print Preview: Barangay Activity Summary</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto bg-gray-500 p-8">
          <PrintableReport ref={componentRef} reportData={reportData} />
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" className="h-12 text-lg" onClick={onClose}>
            Close
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 h-12 text-lg" onClick={handlePrint}>
            <Printer className="mr-2 h-5 w-5" />
            Print Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PrintPreviewModal;

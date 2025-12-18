
"use client";

import React, { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import type { Transaction } from '@/types/transactions';
import type { Resident } from '@/lib/firebase/schema';
import PrintCertificate from './PrintCertificate';
import { logActivity } from '@/lib/activityLog';

interface PrintCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction;
  resident: Resident;
}

const PrintCertificateModal = ({ isOpen, onClose, transaction, resident }: PrintCertificateModalProps) => {
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
    logActivity(`Printed ${transaction.type} for ${resident.displayName}`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-200 border-gray-400 text-black max-w-5xl w-full h-[90vh] flex flex-col no-print">
        <DialogHeader>
          <DialogTitle className="text-2xl text-slate-900">Print Preview: {transaction.type}</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto bg-gray-500 p-8">
          <PrintCertificate ref={componentRef} transaction={transaction} resident={resident} />
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" className="h-12 text-lg" onClick={onClose}>
            Cancel
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 h-12 text-lg" onClick={handlePrint}>
            <Printer className="mr-2 h-5 w-5" />
            Print Now & Log
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PrintCertificateModal;

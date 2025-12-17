
"use client";

import React, { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import PermitDocument from './PermitDocument';
import type { BusinessPermit, Resident } from '@/lib/firebase/schema';

interface PrintPermitModalProps {
  isOpen: boolean;
  onClose: () => void;
  permit: BusinessPermit;
  resident: Resident;
}

const PrintPermitModal = ({ isOpen, onClose, permit, resident }: PrintPermitModalProps) => {
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-200 border-gray-400 text-black max-w-5xl w-full h-[90vh] flex flex-col no-print">
        <DialogHeader>
          <DialogTitle className="text-2xl text-slate-900">Print Preview: Business Registration</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto bg-gray-500 p-8">
          <PermitDocument ref={componentRef} permit={permit} resident={resident} />
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


export default PrintPermitModal;

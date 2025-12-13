
"use client";

import React from 'react';
import type { ApplicationReceipt } from '@/types/permits';

interface PrintApplicationReceiptProps {
  receiptData: ApplicationReceipt;
}

const PrintApplicationReceipt = React.forwardRef<HTMLDivElement, PrintApplicationReceiptProps>(({ receiptData }, ref) => {
  const provinceName = "Pampanga"; // Placeholder
  const cityName = "Mabalacat"; // Placeholder
  const barangayName = "Dau"; // Placeholder
  
  return (
    <div ref={ref} id="print-area" className="bg-white text-black p-8 max-w-4xl mx-auto print-container">
      {/* Header */}
      <div className="text-center text-sm mb-12">
        <p>Republic of the Philippines</p>
        <p>Province of {provinceName}</p>
        <p>City/Municipality of {cityName}</p>
        <p className="font-bold uppercase mt-4">BARANGAY {barangayName.toUpperCase()}</p>
      </div>

      {/* Body */}
      <div className="text-center mb-8">
        <h1 className="text-lg font-bold tracking-[0.2em]">BUSINESS PERMIT APPLICATION RECEIPT</h1>
      </div>
      
      <div className="border-t border-b border-black py-4 mb-8">
          <div className="flex justify-between text-sm">
            <p><strong>Application ID:</strong> {receiptData.applicationId}</p>
            <p><strong>Date:</strong> {receiptData.dateApplied}</p>
          </div>
      </div>

      <div className="text-base leading-relaxed space-y-4">
        <p>This is to certify that an application for a business permit has been received with the following details:</p>
        
        <table className="w-full text-left text-sm">
            <tbody>
                <tr className="border-b"><td className="py-2 pr-4 font-bold">Business Name:</td><td className="py-2">{receiptData.businessName}</td></tr>
                <tr className="border-b"><td className="py-2 pr-4 font-bold">Owner/Proprietor:</td><td className="py-2">{receiptData.ownerName}</td></tr>
                <tr className="border-b"><td className="py-2 pr-4 font-bold">Application Type:</td><td className="py-2">{receiptData.applicationType}</td></tr>
                <tr className="border-b"><td className="py-2 pr-4 font-bold">Preliminary Fees:</td><td className="py-2">₱ {receiptData.preliminaryFees.toFixed(2)}</td></tr>
            </tbody>
        </table>

        <p className="mt-4">This application is now <strong className="uppercase">pending review</strong>. The final permit will be issued upon completion of all requirements and payment of assessed fees.</p>
        
        {receiptData.notes && <p><strong>Notes:</strong> {receiptData.notes}</p>}
      </div>

      {/* Footer */}
      <div className="mt-20 text-sm">
        <div className="w-1/2">
            <div className="h-px bg-black"></div>
            <p className="text-center">Received by: {receiptData.receivedBy}</p>
        </div>
        <p className="text-xs text-gray-500 mt-8">THIS IS NOT A PERMIT TO OPERATE. This document only serves as proof of application.</p>
      </div>
    </div>
  );
});

PrintApplicationReceipt.displayName = 'PrintApplicationReceipt';
export default PrintApplicationReceipt;

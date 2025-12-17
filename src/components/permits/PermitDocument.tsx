
"use client";

import React from 'react';
import type { BusinessPermit, Resident } from '@/lib/firebase/schema';
import { format } from 'date-fns';
import { useSettings } from '@/context/SettingsContext';

interface PermitDocumentProps {
  permit: BusinessPermit;
  resident: Resident;
}

const PermitDocument = React.forwardRef<HTMLDivElement, PermitDocumentProps>(({ permit, resident }, ref) => {
  const { settings } = useSettings();

  if (!settings) {
    return <div ref={ref}>Loading settings...</div>;
  }
  
  const { barangayName, municipality, province, punongBarangay, logoUrl } = settings;

  const issuedDate = permit.issuedAt ? new Date(permit.issuedAt as any) : new Date();

  return (
    <div ref={ref} id="print-area" className="bg-white text-black p-8 max-w-4xl mx-auto print-container">
      {/* Header */}
      <div className="text-center text-sm mb-12 flex items-center justify-center gap-8">
        <img src={logoUrl || "https://picsum.photos/seed/seal1/100"} alt="Seal" className="h-24 w-24" data-ai-hint="seal" />
        <div>
            <p>Republic of the Philippines</p>
            <p>Province of {province}</p>
            <p>City of {municipality}</p>
            <p className="font-bold text-lg mt-2">BARANGAY {barangayName?.toUpperCase()}</p>
            <p className="font-bold uppercase mt-1">OFFICE OF THE PUNONG BARANGAY</p>
        </div>
        <img src={logoUrl || "https://picsum.photos/seed/seal2/100"} alt="Seal" className="h-24 w-24" data-ai-hint="logo" />
      </div>

      {/* Body */}
      <div className="text-center mb-12">
        <h1 className="text-2xl font-bold tracking-[0.2em]">CERTIFICATE OF BUSINESS REGISTRATION</h1>
      </div>
      
       <div className="text-justify text-base leading-loose indent-8 mb-8">
          <p>This is to certify that the business detailed herein is a duly registered enterprise within the jurisdiction of Barangay {barangayName}, City of {municipality}, for the year {format(issuedDate, 'yyyy')}.</p>
       </div>
       
        <table className="w-full text-left text-lg border-2 border-black my-8">
            <tbody>
                <tr className="border-b-2 border-black"><td className="p-3 pr-4 font-bold bg-gray-100">Business Name:</td><td className="p-3 font-mono">{permit.businessName}</td></tr>
                <tr className="border-b-2 border-black"><td className="p-3 pr-4 font-bold bg-gray-100">Owner/Proprietor:</td><td className="p-3 font-mono">{permit.owner.fullName}</td></tr>
                <tr className="border-b-2 border-black"><td className="p-3 pr-4 font-bold bg-gray-100">Business Type:</td><td className="p-3 font-mono">{permit.category}</td></tr>
                <tr><td className="p-3 pr-4 font-bold bg-gray-100">Address:</td><td className="p-3 font-mono">{permit.businessAddress.street}</td></tr>
            </tbody>
        </table>

       <div className="text-justify text-base leading-loose indent-8 mb-12">
          <p>This certification is issued upon the request of the owner for whatever legal purpose it may serve.</p>
          <p className="mt-4">Given this <span className="font-bold underline">{format(issuedDate, 'do')}</span> day of <span className="font-bold underline">{format(issuedDate, 'MMMM, yyyy')}</span> at the Office of the Punong Barangay, {barangayName}, {municipality}, Philippines.</p>
       </div>


      {/* Signature & Footer */}
      <div className="mt-24 grid grid-cols-2 gap-24">
        <div className="text-center">
            <div className="border-t-2 border-black pt-2">
                <p className="font-bold text-lg">JANE DOE</p>
                <p className="text-sm">Barangay Secretary</p>
            </div>
        </div>
        <div className="text-center">
            <div className="border-t-2 border-black pt-2">
                <p className="font-bold text-lg">{punongBarangay?.toUpperCase()}</p>
                <p className="text-sm">Punong Barangay</p>
            </div>
        </div>
      </div>
      
      <div className="mt-20 text-xs text-gray-500 text-left">
        <p>OR No: {permit.feesCollected > 0 ? '_______' : 'N/A'}</p>
        <p>Amount Paid: {permit.feesCollected > 0 ? `₱${permit.feesCollected.toFixed(2)}` : 'Gratis'}</p>
        <p className="font-mono mt-4">Permit ID: {permit.id}</p>
      </div>

       <p className="text-center text-xs mt-8 border-t-2 border-dashed border-black pt-2">NOT A PERMIT TO OPERATE. VALID ONLY WITH OFFICIAL BARANGAY DRY SEAL.</p>

    </div>
  );
});

PermitDocument.displayName = 'PermitDocument';
export default PermitDocument;

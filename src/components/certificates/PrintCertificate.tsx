
"use client";

import React from 'react';
import type { Transaction } from '@/types/transactions';
import type { Resident } from '@/lib/firebase/schema';
import { format } from 'date-fns';

interface PrintCertificateProps {
  transaction: Transaction;
  resident: Resident;
}

const getAge = (dateOfBirth?: { seconds: number }) => {
    if (!dateOfBirth) return 'N/A';
    return Math.floor(
      (new Date() - new Date(dateOfBirth.seconds * 1000)) /
      (1000 * 60 * 60 * 24 * 365.25)
    );
};

const getBoilerplateText = (type: Transaction['type'], residentName: string, age: number | 'N/A', civilStatus: string | undefined, address: string) => {
    const commonIntro = `This is to certify that ${residentName.toUpperCase()}, ${age} years old, ${civilStatus}, is a bonafide resident of ${address}.`;

    switch (type) {
        case 'Barangay Clearance':
            return `${commonIntro}\n\nThis certifies further that he/she has no derogatory record on file in this office.`;
        case 'Certificate of Indigency':
            return `${commonIntro}\n\nThis certification is issued upon the request of the above-named person for whatever legal purpose it may serve him/her best, and to attest that he/she is one of the indigents in this barangay.`;
        case 'Certificate of Residency':
            return `${commonIntro}\n\nThis certification is issued upon the request of the above-named person as a requirement for his/her application for ${"Local Employment"}.`;
        default:
            return commonIntro;
    }
}


const PrintCertificate = React.forwardRef<HTMLDivElement, PrintCertificateProps>(({ transaction, resident }, ref) => {
  // Mock data, in a real app this would come from config or a parent `Barangay` document
  const provinceName = "Pampanga";
  const cityName = "Mabalacat";
  const barangayName = "Dau";
  const barangaySealUrl = "https://via.placeholder.com/100"; // Placeholder
  
  const transactionDate = transaction.transactionDate.toDate();
  const age = getAge(resident.dateOfBirth);
  const fullAddress = `Purok ${resident.addressSnapshot.purok}, Barangay ${barangayName}, ${cityName}, ${provinceName}`;
  const boilerplate = getBoilerplateText(transaction.type, resident.displayName, age, resident.civilStatus, fullAddress);

  return (
    <div ref={ref} id="print-area" className="bg-white text-black p-8 max-w-4xl mx-auto print-container">
      {/* Header */}
      <div className="text-center text-sm mb-12 flex items-center justify-center gap-8">
        <img src={barangaySealUrl} alt="Seal" className="h-24 w-24" />
        <div>
            <p>Republic of the Philippines</p>
            <p>Province of {provinceName}</p>
            <p>City of {cityName}</p>
            <p className="font-bold text-lg mt-2">BARANGAY {barangayName.toUpperCase()}</p>
            <p className="font-bold uppercase mt-1">OFFICE OF THE PUNONG BARANGAY</p>
        </div>
        <img src={barangaySealUrl} alt="Seal" className="h-24 w-24" />
      </div>

      {/* Body */}
      <div className="text-center mb-12">
        <h1 className="text-2xl font-bold tracking-[0.2em]">{transaction.type.toUpperCase()}</h1>
      </div>
      
      <div className="text-justify text-base leading-loose indent-8 mb-12">
          <p className="whitespace-pre-wrap">{boilerplate}</p>
      </div>
      
       <div className="text-justify text-base leading-loose indent-8 mb-12">
          <p>This certification is issued upon his/her request for <span className="font-bold underline">{transaction.purpose}</span>.</p>
       </div>

       <div className="text-justify text-base leading-loose indent-8 mb-12">
          <p>Given this <span className="font-bold underline">{format(transactionDate, 'do')}</span> day of <span className="font-bold underline">{format(transactionDate, 'MMMM, yyyy')}</span> at the Office of the Punong Barangay, {barangayName}, {cityName}, Philippines.</p>
       </div>


      {/* Signature & Footer */}
      <div className="mt-24 flex justify-between">
        <div className="w-1/3 text-center">
            <div className="border-t-2 border-black pt-2">
                <p className="font-bold text-lg">{resident.displayName.toUpperCase()}</p>
                <p className="text-sm">Requestor's Signature</p>
            </div>
        </div>
        <div className="w-1/3 text-center">
            <div className="border-t-2 border-black pt-2">
                <p className="font-bold text-lg">{transaction.officialSignee.toUpperCase()}</p>
                <p className="text-sm">Punong Barangay</p>
            </div>
        </div>
      </div>
      
      <div className="mt-20 text-xs text-gray-500 text-left">
        <p>OR No: {transaction.feesCollected > 0 ? '_______' : 'N/A'}</p>
        <p>Fees: {transaction.feesCollected > 0 ? `₱${transaction.feesCollected.toFixed(2)}` : 'Gratis'}</p>
        <p className="font-mono mt-4">TXN ID: {transaction.id}</p>
      </div>

       <p className="text-center text-xs mt-8 border-t-2 border-dashed border-black pt-2">NOT VALID WITHOUT OFFICIAL BARANGAY SEAL</p>

    </div>
  );
});

PrintCertificate.displayName = 'PrintCertificate';
export default PrintCertificate;


"use client";

import React from 'react';
import type { BlotterCase } from '@/types/blotter';

interface KPForm7PrintProps {
  caseData: BlotterCase;
}

const KPForm7Print = React.forwardRef<HTMLDivElement, KPForm7PrintProps>(({ caseData }, ref) => {
  const provinceName = "Pampanga"; // Placeholder
  const cityName = "Mabalacat"; // Placeholder
  const barangayName = "Dau"; // Placeholder
  const reportDate = new Date(caseData.date);

  return (
    <div ref={ref} id="print-area" className="bg-white text-black p-8 max-w-4xl mx-auto print-container">
      {/* Header */}
      <div className="text-center text-sm mb-12">
        <p>Republic of the Philippines</p>
        <p>Province of {provinceName}</p>
        <p>City/Municipality of {cityName}</p>
        <p>Barangay {barangayName}</p>
        <p className="font-bold uppercase mt-4">OFFICE OF THE LUPONG TAGAPAMAYAPA</p>
      </div>

      {/* Case Header */}
      <div className="flex justify-between mb-8 text-sm">
        <div className="w-1/2 pr-4">
          <p>Barangay Case No. <span className="font-bold underline">{caseData.caseId}</span></p>
          <p>For: <span className="font-bold underline">{caseData.nature}</span></p>
        </div>
        <div className="w-1/2 pl-4">
          <p><span className="font-bold underline">{caseData.complainant}</span>, Complainant</p>
          <p className="ml-4">- against -</p>
          <p><span className="font-bold underline">{caseData.respondent || '_______________________'}</span>, Respondent</p>
        </div>
      </div>

      {/* Body */}
      <div className="text-center mb-8">
        <h1 className="text-lg font-bold tracking-[0.2em]">C O M P L A I N T</h1>
      </div>
      <div className="text-base leading-relaxed">
        <p className="mb-4">I hereby complain against the above named respondent for violating my rights and interests in the following manner:</p>
        <div className="p-4 border-2 border-black min-h-[200px]">
          <p className="underline">{caseData.narrative}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 text-base">
        <p className="mb-8">THEREFORE, I pray that the following relief be granted to me in accordance with law and/or equity.</p>
        <p>Made this <span className="font-bold underline">{reportDate.getDate()}</span> day of <span className="font-bold underline">{reportDate.toLocaleString('default', { month: 'long' })}</span>, <span className="font-bold underline">{reportDate.getFullYear()}</span>.</p>
        
        <div className="mt-20">
          <div className="w-1/2">
            <div className="h-px bg-black"></div>
            <p className="text-center">Complainant</p>
          </div>
        </div>
        
        <div className="mt-8">
          <p>Received by:</p>
          <div className="mt-12 w-1/2">
            <div className="h-px bg-black"></div>
            <p className="text-center">Barangay Secretary</p>
          </div>
        </div>
      </div>
    </div>
  );
});

KPForm7Print.displayName = 'KPForm7Print';
export default KPForm7Print;

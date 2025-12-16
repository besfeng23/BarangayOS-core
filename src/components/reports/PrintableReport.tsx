
"use client";

import React from 'react';
import { format } from 'date-fns';
import type { ReportData } from '@/types/reports';
import { useSettings } from '@/context/SettingsContext';

interface PrintableReportProps {
  reportData: ReportData;
}

const MetricRow = ({ label, value }: { label: string; value: string | number }) => (
    <tr className="border-b border-gray-400">
        <td className="py-3 pr-4 font-bold">{label}</td>
        <td className="py-3 text-right font-mono text-lg">{value}</td>
    </tr>
);

const PrintableReport = React.forwardRef<HTMLDivElement, PrintableReportProps>(({ reportData }, ref) => {
  const { settings } = useSettings();

  if (!settings) {
    return <div ref={ref}>Loading settings...</div>;
  }
  
  const { barangayName, municipality, province, punongBarangay } = settings;


  return (
    <div ref={ref} id="print-area" className="bg-white text-black p-8 max-w-4xl mx-auto print-container">
      {/* Header */}
      <div className="text-center mb-12">
        <p className="text-sm">Republic of the Philippines</p>
        <p className="text-sm">Province of {province}</p>
        <p className="text-sm">City of {municipality}</p>
        <p className="font-bold text-lg mt-2">BARANGAY {barangayName?.toUpperCase()}</p>
        <p className="font-bold uppercase mt-1">OFFICE OF THE PUNONG BARANGAY</p>
      </div>

      {/* Report Title */}
      <div className="text-center mb-8">
        <h1 className="text-xl font-bold tracking-wider">BARANGAY ACTIVITY SUMMARY</h1>
        <p className="text-base mt-1">
            For the period of {format(reportData.period.start, 'MMMM d, yyyy')} to {format(reportData.period.end, 'MMMM d, yyyy')}
        </p>
      </div>

      {/* Data Table */}
      <div className="mb-12">
        <table className="w-full text-base">
            <thead>
                <tr className="border-b-2 border-black">
                    <th className="py-2 text-left">Metric</th>
                    <th className="py-2 text-right">Count</th>
                </tr>
            </thead>
            <tbody>
                <MetricRow label="Certificates & Clearances Issued" value={reportData.metrics.certificatesIssued.value} />
                <MetricRow label="New Residents Encoded" value={reportData.metrics.newResidents.value} />
                <MetricRow label="Blotter Cases Filed" value={reportData.metrics.blotterCasesFiled.value} />
                <MetricRow label="Blotter Cases Settled" value={reportData.metrics.blotterCasesSettled.value} />
                <MetricRow label="New Business Permits" value={reportData.metrics.permitsNew.value} />
                <MetricRow label="Business Permit Renewals" value={reportData.metrics.permitsRenewed.value} />
            </tbody>
        </table>
      </div>

      {/* Signature & Footer */}
      <div className="mt-24 grid grid-cols-2 gap-24">
        <div className="text-center">
             <div className="border-t-2 border-black pt-2 mt-20">
                <p className="font-bold text-lg">{punongBarangay?.toUpperCase()}</p>
                <p>Punong Barangay</p>
            </div>
        </div>
         <div className="text-center">
            <div className="border-t-2 border-black pt-2 mt-20">
                <p>Attested By (Secretary)</p>
            </div>
        </div>
      </div>
      
      <div className="mt-20 text-xs text-gray-500 text-left">
        <p>Report Generated On: {format(reportData.generatedAt, 'yyyy-MM-dd hh:mm a')}</p>
        <p className="font-mono mt-1">Ref: {reportData.id}</p>
      </div>
    </div>
  );
});

PrintableReport.displayName = 'PrintableReport';
export default PrintableReport;

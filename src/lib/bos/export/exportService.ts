
'use client';

import { db } from '@/lib/bosDb';
import JSZip from 'jszip';

function convertToCSV<T extends object>(data: T[]): string {
  if (data.length === 0) return '';
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];
  for (const row of data) {
    const values = headers.map(header => {
      const value = (row as any)[header];
      if (typeof value === 'string') {
        return `"${value.replace(/"/g, '""')}"`;
      }
      if (typeof value === 'object' && value !== null) {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`
      }
      return value;
    });
    csvRows.push(values.join(','));
  }
  return csvRows.join('\n');
}

function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export async function exportAllData() {
    const zip = new JSZip();

    // 1. Export Residents
    const residents = await db.residents.toArray();
    if(residents.length > 0) zip.file('residents.csv', convertToCSV(residents));

    // 2. Export Blotter Cases
    const blotters = await db.blotters.toArray();
    if(blotters.length > 0) zip.file('blotter_cases.csv', convertToCSV(blotters));

    // 3. Export Businesses
    const businesses = await db.businesses.toArray();
    if(businesses.length > 0) zip.file('businesses.csv', convertToCSV(businesses));
    
    // 4. Export Permit Issuances
    const issuances = await db.permit_issuances.toArray();
    if(issuances.length > 0) zip.file('business_permit_issuances.csv', convertToCSV(issuances));
    
    // 5. Export Certificate Issuances
    const certificates = await db.certificate_issuances.toArray();
    if(certificates.length > 0) zip.file('certificate_issuances.csv', convertToCSV(certificates));

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(zipBlob, `BarangayOS_Export_${new Date().toISOString().slice(0,10)}.zip`);
}

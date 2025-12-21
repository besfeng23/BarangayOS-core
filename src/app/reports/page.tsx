
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Printer, Loader2 } from 'lucide-react';
import PrintPreviewModal from '@/components/reports/PrintPreviewModal';
import type { ReportData } from '@/types/reports';
import { db } from '@/lib/bosDb';
import { useToast } from '@/components/ui/toast';

export default function ReportsPage() {
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const { toast } = useToast();

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const now = new Date();
            const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

            // Query all relevant tables for records created in the last 7 days
            const certs = await db.certificate_issuances.where('issuedAtISO').above(sevenDaysAgo).count();
            const newResidents = await db.residents.where('createdAtISO').above(sevenDaysAgo).count();
            const blotterCases = await db.blotters.where('createdAtISO').above(sevenDaysAgo).toArray();
            const newBusinesses = await db.businesses.where('createdAtISO').above(sevenDaysAgo).count();
            const renewedPermits = await db.permit_issuances.where('issuedAtISO').above(sevenDaysAgo).count();

            const blotterFiled = blotterCases.length;
            const blotterSettled = blotterCases.filter(b => b.status === 'Resolved').length;

            const reportData: ReportData = {
                id: `summary-weekly-${now.toISOString().slice(0, 10)}`,
                period: {
                    type: 'weekly',
                    start: new Date(sevenDaysAgo),
                    end: now
                },
                metrics: {
                    certificatesIssued: { value: certs, trend: 0 },
                    newResidents: { value: newResidents, trend: 0 },
                    blotterCasesFiled: { value: blotterFiled, trend: 0 },
                    blotterCasesSettled: { value: blotterSettled, trend: 0 },
                    permitsNew: { value: newBusinesses, trend: 0 },
                    permitsRenewed: { value: renewedPermits, trend: 0 }
                },
                generatedAt: now
            };

            setSelectedReport(reportData);
            setIsPrintModalOpen(true);

        } catch (error) {
            console.error("Failed to generate report:", error);
            toast({
                variant: 'destructive',
                title: 'Report Generation Failed',
                description: 'Could not fetch data from the local database. Please try again.',
            });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
          <div className="space-y-8 p-4 md:p-8">
              <Card className="bg-zinc-900/40 border border-zinc-800 rounded-2xl">
                  <CardHeader>
                      <CardTitle>Generate Report</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col sm:flex-row gap-4 items-end">
                      <div className="w-full sm:w-1/2">
                          <label className="text-lg font-medium mb-2 block">Report Type</label>
                          <Select defaultValue="activity-summary">
                              <SelectTrigger className="h-12 text-lg bg-zinc-950 border-zinc-700">
                                  <SelectValue placeholder="Select a report..." />
                              </SelectTrigger>
                              <SelectContent className="bg-zinc-800 text-white border-zinc-700">
                                  <SelectItem value="activity-summary">Barangay Activity Summary</SelectItem>
                                  <SelectItem value="financial-summary" disabled>Financial Summary (Soon)</SelectItem>
                                  <SelectItem value="demographics" disabled>Demographics (Soon)</SelectItem>
                              </SelectContent>
                          </Select>
                      </div>
                      <div className="w-full sm:w-1/4">
                          <label className="text-lg font-medium mb-2 block">Time Period</label>
                          <Select defaultValue="weekly">
                              <SelectTrigger className="h-12 text-lg bg-zinc-950 border-zinc-700">
                                  <SelectValue placeholder="Select a period..." />
                              </SelectTrigger>
                              <SelectContent className="bg-zinc-800 text-white border-zinc-700">
                                  <SelectItem value="weekly">Last 7 Days</SelectItem>
                                  <SelectItem value="monthly" disabled>Last 30 Days (Soon)</SelectItem>
                                  <SelectItem value="quarterly" disabled>Last Quarter (Soon)</SelectItem>
                              </SelectContent>
                          </Select>
                      </div>
                      <Button 
                          className="bg-blue-600 hover:bg-blue-700 h-12 text-lg w-full sm:w-auto"
                          onClick={handleGenerate}
                          disabled={isGenerating}
                      >
                          {isGenerating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Printer className="mr-2 h-5 w-5" />}
                          {isGenerating ? 'Generating...' : 'Generate & Print'}
                      </Button>
                  </CardContent>
              </Card>
              
              {selectedReport && (
                  <PrintPreviewModal 
                      isOpen={isPrintModalOpen}
                      onClose={() => setIsPrintModalOpen(false)}
                      reportData={selectedReport}
                  />
              )}
          </div>
    );
}

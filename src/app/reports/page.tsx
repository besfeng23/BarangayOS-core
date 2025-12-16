
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Printer } from 'lucide-react';
import PrintPreviewModal from '@/components/reports/PrintPreviewModal';
import type { ReportData } from '@/types/reports';

// Mock data that would come from a pre-calculated `reports_summary` collection
const mockReportData: ReportData = {
    id: 'summary-weekly-2024-07-22',
    period: {
        type: 'weekly',
        start: new Date('2024-07-22T00:00:00Z'),
        end: new Date('2024-07-28T23:59:59Z')
    },
    metrics: {
        certificatesIssued: { value: 42, trend: 0.1 }, // 10% up from last week
        newResidents: { value: 5, trend: -0.2 }, // 20% down
        blotterCasesFiled: { value: 3, trend: 0 },
        blotterCasesSettled: { value: 2, trend: 1 }, // 100% up
        permitsNew: { value: 1, trend: 0 },
        permitsRenewed: { value: 7, trend: 0.15 }
    },
    generatedAt: new Date()
};


export default function ReportsPage() {
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);

    const handleGenerate = () => {
        // In a real app, this would query Firestore for the selected period.
        // For this v1 implementation, we'll use the mock data directly.
        setSelectedReport(mockReportData);
        setIsPrintModalOpen(true);
    };

    return (
        <div className="space-y-8">
            <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                    <CardTitle>Generate Report</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="w-full sm:w-1/2">
                        <label className="text-lg font-medium mb-2 block">Report Type</label>
                         <Select defaultValue="activity-summary">
                            <SelectTrigger className="h-12 text-lg bg-slate-900 border-slate-600">
                                <SelectValue placeholder="Select a report..." />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 text-white border-slate-700">
                                <SelectItem value="activity-summary">Barangay Activity Summary</SelectItem>
                                <SelectItem value="financial-summary" disabled>Financial Summary (Soon)</SelectItem>
                                <SelectItem value="demographics" disabled>Demographics (Soon)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="w-full sm:w-1/4">
                        <label className="text-lg font-medium mb-2 block">Time Period</label>
                         <Select defaultValue="weekly">
                            <SelectTrigger className="h-12 text-lg bg-slate-900 border-slate-600">
                                <SelectValue placeholder="Select a period..." />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 text-white border-slate-700">
                                <SelectItem value="weekly">Last 7 Days</SelectItem>
                                <SelectItem value="monthly" disabled>Last 30 Days (Soon)</SelectItem>
                                <SelectItem value="quarterly" disabled>Last Quarter (Soon)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button 
                        className="bg-blue-600 hover:bg-blue-700 h-12 text-lg w-full sm:w-auto"
                        onClick={handleGenerate}
                    >
                        <Printer className="mr-2 h-5 w-5" />
                        Generate & Print
                    </Button>
                </CardContent>
            </Card>
            
            {/* The live view of the selected report would be displayed here */}
            {/* For v1, we go straight to the print preview. */}

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

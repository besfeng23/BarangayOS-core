
export interface ReportData {
    id: string;
    period: {
        type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
        start: Date;
        end: Date;
    };
    metrics: {
        certificatesIssued: { value: number; trend: number; };
        newResidents: { value: number; trend: number; };
        blotterCasesFiled: { value: number; trend: number; };
        blotterCasesSettled: { value: number; trend: number; };
        permitsNew: { value: number; trend: number; };
        permitsRenewed: { value: number; trend: number; };
    };
    generatedAt: Date;
}

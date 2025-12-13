
export type CaseStatus = 'ACTIVE' | 'SETTLED' | 'FOR_HEARING';

export interface BlotterCase {
  id: string;
  caseId: string;
  date: string;
  complainant: string;
  respondent?: string;
  narrative: string;
  nature: string;
  status: CaseStatus;
}

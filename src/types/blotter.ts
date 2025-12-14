import { Timestamp } from 'firebase/firestore';

export type CaseStatus = 'ACTIVE' | 'SETTLED' | 'FOR_HEARING';

export interface BlotterCase {
  id: string;
  caseId: string;
  date: string; // Keep as string for initial input
  complainant: string;
  respondent?: string;
  narrative: string;
  nature: string;
  status: CaseStatus;
  incidentAt: Timestamp;
}

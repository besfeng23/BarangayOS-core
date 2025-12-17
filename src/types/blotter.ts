
import { Timestamp } from 'firebase/firestore';

export type CaseStatus = 'ACTIVE' | 'SETTLED' | 'FOR_HEARING';

export interface BlotterUpdate {
  timestamp: Timestamp;
  authorUid: string;
  text: string;
}

export interface BlotterCase {
  id: string;
  caseId: string;
  date: string; // Keep as string for initial input
  complainant: string;
  respondent?: string;
  narrative: string; // This can be a concatenated version for display
  blotterUpdates?: BlotterUpdate[]; // Append-only array for edits
  nature: string;
  status: CaseStatus;
  incidentAt: Timestamp;
  barangayId: string;
  createdBy: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

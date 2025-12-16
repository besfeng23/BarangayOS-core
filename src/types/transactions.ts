
import { Timestamp } from 'firebase/firestore';

export type CertificateType = 'Barangay Clearance' | 'Certificate of Indigency' | 'Certificate of Residency';
export type TransactionStatus = 'COMPLETED' | 'CANCELLED' | 'PENDING';

export interface Transaction {
  id: string;
  barangayId: string;
  residentRef: string; // Firestore document ID of the resident
  residentNameSnapshot: string; // Denormalized for quick display
  type: CertificateType;
  purpose: string;
  feesCollected: number;
  officialSignee: string; // Name of the Punong Barangay
  transactionDate: Timestamp;
  status: TransactionStatus;
  createdBy: string; // UID of the secretary/encoder
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

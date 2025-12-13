import { Timestamp } from 'firebase/firestore';

export type EmangoUserRole = 'TREASURER' | 'CASHIER' | 'SECRETARY' | 'APPROVER' | 'AUDITOR';

export interface EmangoUser {
  uid: string;
  name: string;
  role: EmangoUserRole;
  barangayId: string;
  isActive: boolean;
}

export interface Wallet {
  barangayId: string;
  availableBalance: number;
  pendingBalance: number;

  lastReconciledAt?: Timestamp;
  limits: {
    refundThreshold: number;
    offlineCollectLimit: number;
  };
}

export type InvoiceStatus = 'UNPAID' | 'PAID' | 'CANCELLED' | 'EXPIRED';

export interface Invoice {
  id: string;
  barangayId: string;
  payer: {
    residentId?: string;
    fullName: string;
    contact?: string;
  };
  serviceType: 'Business Permit' | 'Clearance' | 'Rental' | 'Fee' | 'Other';
  amount: number;
  convenienceFee: number;
  total: number;
  status: InvoiceStatus;
  dueDate: Timestamp;
  createdAt: Timestamp;
  createdBy: string; // uid
  linkedEntity?: {
    moduleName?: string;
    recordId?: string;
  };
  qrPayload: string;
}

export type TransactionType = 'COLLECTION' | 'DISBURSEMENT' | 'REFUND' | 'VOID';
export type TransactionStatus = 'PAID' | 'PENDING_SYNC' | 'FAILED' | 'REVERSED' | 'REFUND_REQUESTED' | 'VOID_REQUESTED';
export type TransactionMethod = 'QR' | 'INVOICE_LOOKUP' | 'MANUAL';

export interface Transaction {
  id: string;
  barangayId: string;
  type: TransactionType;
  invoiceId?: string;
  payer?: {
    residentId?: string;
    fullName: string;
  };
  payee?: {
    residentId?: string;
    fullName: string;
  };
  category: string;
  amount: number;
  fee: number;
  total: number;
  status: TransactionStatus;
  method: TransactionMethod;
  collectedBy: {
    uid: string;
    name: string;
  };
  approvedBy?: {
    uid: string;
    name: string;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
  deviceInfo?: {
    deviceId?: string;
    appVersion?: string;
  };
  notes?: string;
}

export type BatchType = 'AID' | 'PAYROLL';
export type BatchStatus = 'DRAFT' | 'FOR_APPROVAL' | 'APPROVED' | 'RELEASED';
export type BatchItemStatus = 'DRAFT' | 'APPROVED' | 'RELEASED';

export interface Batch {
  id: string;
  barangayId: string;
  batchType: BatchType;
  programName: string;
  totalAmount: number;
  items: {
    residentId?: string;
    fullName: string;
    amount: number;
    status: BatchItemStatus;
  }[];
  status: BatchStatus;
  createdBy: string; // uid
  approvedBy?: string; // uid
  createdAt: Timestamp;
  releasedAt?: Timestamp;
}

export type AuditAction = 
  | 'CREATE_INVOICE' 
  | 'COLLECT_PAYMENT' 
  | 'REQUEST_REFUND' 
  | 'APPROVE_REFUND' 
  | 'VOID_TX' 
  | 'RECONCILE_DAY' 
  | 'UPDATE_FEES';

export interface AuditLog {
  id: string;
  barangayId: string;
  actor: {
    uid: string;
    name: string;
    role: EmangoUserRole;
  };
  action: AuditAction;
  entity: {
    type: 'INVOICE' | 'TRANSACTION' | 'BATCH' | 'WALLET';
    id: string;
  };
  before?: object;
  after?: object;
  createdAt: Timestamp;
}

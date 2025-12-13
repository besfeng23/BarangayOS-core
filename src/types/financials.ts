import { Timestamp } from 'firebase/firestore';

export namespace FinancialsTypes {

  export type FinancialUserRole = 'Admin' | 'Treasurer' | 'Captain' | 'Clerk' | 'Auditor';

  export interface User {
    uid: string;
    displayName: string;
    role: FinancialUserRole;
  }

  export interface Org {
    id: string;
    name: string;
  }
  
  export interface FiscalYear {
    id: string; // e.g., '2024'
    year: number;
    startDate: Timestamp;
    endDate: Timestamp;
    status: 'Open' | 'Closed';
  }
  
  export interface Fund {
    id: string;
    name: string; // e.g., 'General Fund', 'SK Fund'
    code: string;
  }

  export interface BankAccount {
    id: string;
    accountName: string;
    accountNumber: string;
    bankName: string;
  }

  export interface Payee {
    id: string;
    name: string;
    address?: string;
    tin?: string;
    type: 'Individual' | 'Business' | 'Agency';
  }

  export type ReceiptStatus = 'Draft' | 'Posted' | 'Voided';
  export type PaymentMethod = 'Cash' | 'Check' | 'eWallet';
  
  export interface Receipt {
    id: string;
    orNo: string;
    date: Timestamp;
    payerName: string;
    purpose: string;
    fundId: string;
    items: {
      category: string;
      description: string;
      amount: number;
    }[];
    total: number;
    paymentMethod: PaymentMethod;
    checkDetails?: {
      bank: string;
      checkNo: string;
      checkDate: Timestamp;
    };
    eWalletDetails?: {
      referenceNo: string;
    };
    status: ReceiptStatus;
    postedAt?: Timestamp;
    voidReason?: string;
    createdBy: string; // UID
    createdAt: Timestamp;
    updatedAt: Timestamp;
  }

  export type VoucherStatus = 'Draft' | 'ForApproval' | 'Approved' | 'Released' | 'Cancelled';
  
  export interface Voucher {
    id: string;
    dvNo: string;
    date: Timestamp;
    payeeId: string;
    payeeSnapshot: {
      name: string;
      address?: string;
      tin?: string;
    };
    purpose: string;
    fundId: string;
    programTag?: string;
    items: {
      qty: number;
      unitCost: number;
      accountCode: string;
      category: string;
      description: string;
    }[];
    total: number;
    status: VoucherStatus;
    attachments: {
      name: string;
      url: string;
      type: string;
      uploadedAt: Timestamp;
    }[];
    approvalTrail: {
      role: string;
      actorId: string;
      action: 'Submit' | 'Approve' | 'Deny' | 'Release' | 'Cancel';
      at: Timestamp;
      note?: string;
    }[];
    submittedAt?: Timestamp;
    approvedAt?: Timestamp;
    releasedAt?: Timestamp;
    version: number;
    createdBy: string; // UID
    createdAt: Timestamp;
    updatedAt: Timestamp;
  }
  
  export interface Deposit {
    id: string;
    depositNo: string;
    date: Timestamp;
    fundId: string;
    receiptIds: string[];
    total: number;
    bankAccountId: string;
    attachmentUrl: string; // Deposit slip image
    status: 'Draft' | 'Deposited';
    createdBy: string; // UID
    createdAt: Timestamp;
    updatedAt: Timestamp;
  }
  
  export interface Budget {
    id: string;
    fiscalYearId: string;
    fundId: string;
    lines: {
      programTag?: string;
      category?: string;
      accountCode?: string;
      appropriatedAmount: number;
    }[];
    warningThreshold: number; // e.g., 0.8 for 80%
    createdBy: string; // UID
    createdAt: Timestamp;
    updatedAt: Timestamp;
  }
  
  export interface AuditLog {
    id: string;
    entityType: 'Receipt' | 'Voucher' | 'Deposit' | 'Budget' | 'Settings';
    entityId: string;
    action: string;
    before?: object;
    after?: object;
    actorId: string;
    timestamp: Timestamp;
    reason?: string;
    deviceId?: string;
  }
}

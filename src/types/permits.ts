
import { Timestamp } from 'firebase/firestore';

export type ApplicationType = "NEW" | "RENEWAL";

export type PermitStatus = 
  | "DRAFT" 
  | "PENDING_REVIEW" 
  | "FOR_PAYMENT" 
  | "FOR_INSPECTION" 
  | "FOR_APPROVAL" 
  | "FOR_RELEASE" 
  | "RELEASED" 
  | "REJECTED" 
  | "CANCELLED";

export type PaymentStatus = "UNPAID" | "PARTIAL" | "PAID" | "WAIVED";

export interface BusinessPermit {
  id: string;
  permitNo: string;
  applicationType: ApplicationType;
  status: PermitStatus;
  businessName: string;
  tradeName?: string;
  category: string;
  subCategory?: string;
  businessDescription?: string;
  businessAddress: {
    purok: string;
    street: string;
    barangay: string;
    city: string;
    province: string;
  };
  owner: {
    fullName: string;
    contactNo: string;
    address: string;
    residentId?: string;
  };
  filedAt: Timestamp;
  reviewedAt?: Timestamp;
  approvedAt?: Timestamp;
  releasedAt?: Timestamp;
  validFrom: Timestamp;
  validUntil: Timestamp;
  requirements: {
    key: string;
    label: string;
    required: boolean;
    attached: boolean;
    verified: boolean;
    verifiedBy?: string; // UID
    verifiedAt?: Timestamp;
    fileUrls: string[];
  }[];
  fees: {
    code: string;
    label: string;
    amount: number;
    editable: boolean;
    notes?: string;
  }[];
  totals: {
    subtotal: number;
    penalties: number;
    discounts: number;
    total: number;
  };
  payment: {
    status: PaymentStatus;
    orNo?: string;
    refNo?: string;
    paidAt?: Timestamp;
    paidBy?: string; // Name of payer
  };
  inspection?: {
    required: boolean;
    inspectorUid?: string;
    scheduledAt?: Timestamp;
    findings?: string;
    recommendation?: "APPROVE" | "REJECT";
    attachments: string[];
  };
  assignedOfficerUid?: string;
  flags: string[]; // e.g., "MISSING_ID", "MISSING_DOCS"
  createdByUid: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ApplicationReceipt {
  applicationId: string;
  businessName: string;
  ownerName: string;
  applicationType: ApplicationType;
  dateApplied: string;
  preliminaryFees: number;
  notes?: string;
  receivedBy: string; // Treasurer's name
}


export interface PermitAuditLog {
  id: string;
  action: string;
  actorUid: string;
  timestamp: Timestamp;
  details: object;
}

    

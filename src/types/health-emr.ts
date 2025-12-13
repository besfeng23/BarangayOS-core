import type { Timestamp } from 'firebase/firestore';

export namespace HealthEMRTypes {

  export type Role = 'ADMIN' | 'DOCTOR' | 'NURSE' | 'MIDWIFE' | 'CLERK' | 'ENCODER' | 'VIEWER' | 'AUDITOR';

  export interface StaffUser {
    uid: string;
    displayName: string;
    email: string;
    role: Role;
    facilityId: string;
    isActive: boolean;
  }
  
  export interface Facility {
    id: string;
    name: string;
    type: 'BHS' | 'RHU' | 'SATELLITE' | 'OUTREACH_SITE';
  }

  export interface Patient {
    id: string;
    facilityId: string;
    fullName: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    suffix?: string;
    birthDate: Timestamp;
    sex: 'M' | 'F';
    address: {
      purok: string;
      street: string;
      barangay: string;
      city: string;
    };
    contact: {
      mobile?: string;
      email?: string;
    };
    consent: {
      status: 'CONSENTED' | 'NEEDS_CONSENT' | 'EMERGENCY_OVERRIDE';
      version?: string;
      signedAt?: Timestamp;
      overrideReason?: string;
    };
    flags: ('ALLERGY' | 'PREGNANCY' | 'HYPERTENSION' | 'DIABETES' | 'TB_WATCHLIST' | 'SENIOR' | 'PWD')[];
    createdAt: Timestamp;
    updatedAt: Timestamp;
  }
  
  export interface QueueTicket {
    id: string;
    facilityId: string;
    patientId: string;
    patientSnapshot: Pick<Patient, 'fullName' | 'sex' | 'birthDate' | 'flags'>;
    ticketNumber: string;
    type: 'WALK_IN' | 'SCHEDULED' | 'OUTREACH';
    status: 'WAITING' | 'TRIAGE' | 'CONSULT' | 'COMPLETED' | 'CANCELLED';
    priority: 'NORMAL' | 'URGENT';
    arrivalAt: Timestamp;
    assignedToUid?: string; // Nurse/Doctor UID
    currentEncounterId?: string;
  }

  export interface Encounter {
    id: string;
    patientId: string;
    facilityId: string;
    type: 'CONSULTATION' | 'TRIAGE' | 'FOLLOW_UP' | 'IMMUNIZATION_VISIT';
    status: 'DRAFT' | 'COMPLETED' | 'LOCKED';
    triage?: {
      bp?: { systolic: number; diastolic: number };
      heartRate?: number;
      respRate?: number;
      tempC?: number;
      o2Sat?: number;
      weightKg?: number;
      heightCm?: number;
      bmi?: number;
      chiefComplaint: string;
      painScale?: number;
      notes?: string;
      triagedByUid: string;
      triagedAt: Timestamp;
    };
    soap?: {
      subjective: string;
      objective: string;
      assessment: string;
      plan: string;
    };
    diagnoses?: {
      code: string; // ICD-10 like
      description: string;
      isSuspected: boolean;
    }[];
    medications?: {
      name: string;
      dose: string;
      frequency: string;
      duration: string;
      isDispensed: boolean;
    }[];
    orders?: {
      type: 'LAB' | 'IMAGING';
      description: string;
      results?: string;
      attachmentUrl?: string;
    }[];
    immunizations?: {
      vaccine: string;
      doseNumber: number;
      batchLot?: string;
      site: string;
      nextDueDate?: Timestamp;
    }[];
    programToggles?: ('PRENATAL' | 'CHILD_GROWTH' | 'TB_DOTS' | 'HTN_DM' | 'FAMILY_PLANNING')[];
    followUp?: {
      returnDate?: Timestamp;
      referralDestination?: string;
      referralNote?: string;
    };
    providerUid: string; // Doctor/Nurse
    completedAt?: Timestamp;
    signedByUid?: string;
    signedAt?: Timestamp;
    createdAt: Timestamp;
  }

  export interface AuditLog {
    id: string;
    facilityId: string;
    actorUid: string;
    action: 'VIEW_PATIENT' | 'EDIT_DEMOGRAPHICS' | 'CREATE_ENCOUNTER' | 'EDIT_ENCOUNTER' | 'SIGN_ENCOUNTER' | 'EXPORT_DATA' | 'PRINT_RECORD';
    targetType: 'PATIENT' | 'ENCOUNTER' | 'REPORT';
    targetId: string;
    reason?: string;
    details?: object; // e.g., diff for edits
    createdAt: Timestamp;
  }
}

import { Timestamp } from 'firebase/firestore';

export namespace ClinicQueueTypes {

  export type UserRole = 'BHW' | 'NURSE' | 'DOCTOR' | 'ADMIN';

  export interface ClinicUser {
    uid: string;
    fullName: string;
    role: UserRole;
  }

  export interface Resident {
    residentId: string;
    fullName: string;
    birthDate: Timestamp;
    sex: 'M' | 'F';
    address: string;
    purok: string;
    contactNo?: string;
    flags: {
      senior: boolean;
      pwd: boolean;
      pregnant: boolean;
      allergies: string[];
    };
  }
  
  export type VisitStatus = 
    | 'WAITING' 
    | 'FOR_TRIAGE' 
    | 'TRIAGED' 
    | 'FOR_CONSULT' 
    | 'IN_CONSULT' 
    | 'DONE' 
    | 'NO_SHOW' 
    | 'CANCELLED' 
    | 'REFERRED_OUT';
  
  export type VisitPriority = 'EMERGENCY' | 'PRIORITY' | 'NORMAL';

  export interface ClinicVisit {
    visitId: string;
    dateKey: string; // YYYY-MM-DD
    residentId?: string;
    walkInProfile?: {
      fullName: string;
      age: number;
      sex: 'M' | 'F';
      address: string;
      purok: string;
      contactNo?: string;
    };
    chiefComplaint: string;
    visitType: string;
    status: VisitStatus;
    priority: VisitPriority;
    assignedStaffId?: string;
    timestamps: {
      arrivalAt: Timestamp;
      triageStartAt?: Timestamp;
      triageEndAt?: Timestamp;
      consultStartAt?: Timestamp;
      consultEndAt?: Timestamp;
      doneAt?: Timestamp;
    };
    triage?: {
      vitals: {
        bp?: string;
        hr?: number;
        rr?: number;
        temp?: number;
        spo2?: number;
        height?: number;
        weight?: number;
      };
      painScale?: number;
      symptoms?: string[];
      notes?: string;
    };
    soap?: {
      subjective?: string;
      objective?: string;
      assessment?: string;
      plan?: string;
    };
    orders?: {
      medsGiven?: {
        name: string;
        dosage: string;
        qty: number;
        notes?: string;
      }[];
      referral?: {
        referredTo: string;
        reason: string;
        notes?: string;
      };
      followUpAt?: Timestamp;
    };
    attachments?: {
      type: string;
      filename: string;
      url: string;
      createdAt: Timestamp;
    }[];
    auditLog?: {
      at: Timestamp;
      actorId: string;
      action: string;
      field?: string;
      from?: any;
      to?: any;
    }[];
    localPending?: boolean;
  }
  
  export interface ClinicSettings {
    clinicHours: object;
    queueRules: object;
    templates: {
        triageQuestions: object[];
        adviceTemplates: object[];
    }
  }

}

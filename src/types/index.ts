
import { Timestamp } from 'firebase/firestore';
import type { CityHealthTypes } from './city-health';
import type { JobsPortalTypes } from './jobs-portal';
import type { HealthEMRTypes } from './health-emr';
import type { EmangoTypes } from './emango';
import type { ClinicQueueTypes } from './clinic-queue';
import type { FinancialsTypes } from './financials';
import type { AnnouncementsTypes } from './announcements';

export type BadgeInfo = {
  visible: boolean;
  count?: number;
  label?: string;
};

export type AppCategory = 'core' | 'optional' | 'partner';

export type AppData = {
  id: string;
  name: string;
  category: AppCategory;
  icon: string;
  isLocked?: boolean;
  requiredRole?: string;
  status?: 'get' | 'open';
  isActivated?: boolean;
  badge: BadgeInfo;
};

// BOS Resident Records Types

export type UserRole =
  | 'SUPER_ADMIN'
  | 'BARANGAY_CAPTAIN'
  | 'SECRETARY'
  | 'HEALTH_WORKER'
  | 'ENCODER'
  | 'VIEWER'
  | 'TREASURER'
  | 'CLERK'
  | 'AUDITOR'
  | 'NURSE'
  | 'DOCTOR'
  | 'ADMIN'
  | 'BHW'
  | 'dispatcher'
  | 'staff'
  | 'tanod';


export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  role: UserRole;
  barangayId: string;
  purokAssignments?: string[];
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Barangay {
  id: string;
  name: string;
  cityMunicipality: string;
  province: string;
  settings: {
    privacyFlags: boolean;
    qrSettings: boolean;
  };
  createdAt: Timestamp;
}

export interface Household {
  id: string;
  barangayId: string;
  addressLine: string;
  purok: string;
  geo?: {
    lat: number;
    lng: number;
  };
  householdHeadResidentId: string;
  householdCode: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Resident {
  id: string;
  barangayId: string;
  rbiId: string;
  householdId?: string;
  fullName: {
    last: string;
    first: string;
    middle?: string;
    suffix?: string;
  };
  displayName: string;
  displayNameLower: string;
  sex: 'M' | 'F';
  dateOfBirth: Timestamp;
  placeOfBirth: string;
  civilStatus: 'single' | 'married' | 'widowed' | 'separated';
  addressSnapshot: {
    purok: string;
    addressLine: string;
  };
  contact: {
    mobile?: string;
    email?: string;
    emergencyContactName?: string;
    emergencyContactMobile?: string;
  };
  govIds?: {
    sss?: string;
    gsis?: string;
    philHealth?: string;
    tin?: string;
  };
  voter?: {
    isVoter: boolean;
    precinctNumber?: string;
  };
  sectorFlags: {
    senior: boolean;
    pwd: boolean;
    soloParent: boolean;
    indigent: boolean;
    fourPs: boolean;
    osy: boolean; // Out-of-school youth
  };
  status: 'active' | 'transferred' | 'deceased' | 'archived';
  consent: {
    signed: boolean;
    signedAt?: Timestamp;
    consentFormFilePath?: string;
  };
  qr: {
    qrValue?: string;
    generatedAt?: Timestamp;
  };
  photoFilePath?: string;
  signatureFilePath?: string;
  thumbmarkFilePath?: string;
  createdBy: string; // UID
  createdAt: Timestamp;
  updatedBy: string; // UID
  updatedAt: Timestamp;
}

export interface DocIssued {
  id: string;
  barangayId: string;
  residentId: string;
  docType: string;
  issuedAt: Timestamp;
  issuedBy: string; // UID
  referenceNo: string;
  printableSnapshot: object;
  createdAt: Timestamp;
}

export interface BlotterCaseSummary {
    caseId: string;
    caseNo: string;
    title: string;
    status: 'pending' | 'settled' | 'archived';
    role: 'complainant' | 'respondent';
}


export interface AuditLog {
  id: string;
  barangayId: string;
  actorUid: string;
  actionType:
    | 'VIEW_RESIDENT'
    | 'CREATE_RESIDENT'
    | 'UPDATE_RESIDENT'
    | 'ARCHIVE_RESIDENT'
    | 'ISSUE_DOC'
    | 'EXPORT'
    | 'IMPORT'
    | 'VIEW_BLOTTER';
  targetType: 'RESIDENT' | 'HOUSEHOLD' | 'DOC' | 'SYSTEM';
  targetId: string;
  reasonCode:
    | 'DOCUMENT_REQUEST'
    | 'DATA_UPDATE'
    | 'VERIFICATION'
    | 'CORRECTION'
    | 'OTHER';
  reasonText?: string;
  metadata?: object;
  createdAt: Timestamp;
}

export type Sector = 'senior' | 'pwd' | 'soloParent' | 'indigent' | 'fourPs' | 'osy';

export type { CityHealthTypes, JobsPortalTypes, HealthEMRTypes, EmangoTypes, ClinicQueueTypes, FinancialsTypes, AnnouncementsTypes };

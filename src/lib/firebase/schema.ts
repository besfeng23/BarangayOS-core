
import {
  Timestamp,
  type FirestoreDataConverter,
  type DocumentData,
  type QueryDocumentSnapshot,
  type SnapshotOptions,
  serverTimestamp,
} from 'firebase/firestore';

// Base interface with mandatory system fields for all Firestore documents
interface BaseDoc {
  id: string; // The document ID
  barangayId: string; // For multi-tenant security
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string; // UID of the user who created the document
}

export interface Resident {
  id: string;
  barangayId: string;
  rbiId: string;
  fullName: {
    first: string;
    last: string;
    middle: string;
  };
  displayName: string;
  displayNameLower: string;
  sex: string;
  dateOfBirth: Timestamp;
  civilStatus: string;
  addressSnapshot: {
    purok: string;
    addressLine: string;
  };
  status: 'active' | 'archived';
  createdBy: string;
  createdAt: Timestamp;
  updatedBy: string;
  updatedAt: Timestamp;
}

export interface BlotterCase {
  id: string;
  caseId: string;
  complainant: string;
  respondent: string;
  nature: string;
  narrative: string;
  status: 'ACTIVE' | 'SETTLED';
  incidentAt: Timestamp;
  barangayId: string;
  createdBy: string;
  createdAt: Timestamp;
}

export interface BusinessPermit {
    id: string;
    permitNo: string;
    businessName: string;
    businessAddress: {
        purok: string;
        street: string;
    };
    owner: {
        fullName: string;
        residentId: string;
    };
    category: string;
    feesCollected: number;
    status: 'Active';
    issuedAt: Timestamp;
    issuedBy: string;
    barangayId: string;
}


// Generic converter fromFirestore function
function fromFirestore<T>(
  snapshot: QueryDocumentSnapshot,
  options: SnapshotOptions
): T {
  const data = snapshot.data(options) as T;
  return {
    id: snapshot.id,
    ...data,
  };
}

// ==================================================================
// RESIDENT CONVERTER
// ==================================================================
export const residentConverter: FirestoreDataConverter<Resident> = {
  toFirestore: (resident: Partial<Resident>): DocumentData => {
    const { id, ...data } = resident;
    return {
      ...data,
      createdAt: data.createdAt || serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
  },
  fromFirestore: (snapshot, options) => fromFirestore<Resident>(snapshot, options),
};

// ==================================================================
// BLOTTER CASE CONVERTER
// ==================================================================
export const blotterCaseConverter: FirestoreDataConverter<BlotterCase> = {
  toFirestore: (blotterCase: Partial<BlotterCase>): DocumentData => {
    const { id, ...data } = blotterCase;
    return {
      ...data,
      createdAt: data.createdAt || serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
  },
  fromFirestore: (snapshot, options) => fromFirestore<BlotterCase>(snapshot, options),
};

// ==================================================================
// BUSINESS PERMIT CONVERTER
// ==================================================================
export const businessPermitConverter: FirestoreDataConverter<BusinessPermit> = {
  toFirestore: (permit: Partial<BusinessPermit>): DocumentData => {
    const { id, ...data } = permit;
    return {
      ...data,
      createdAt: data.createdAt || serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
  },
  fromFirestore: (snapshot, options) => fromFirestore<BusinessPermit>(snapshot, options),
};

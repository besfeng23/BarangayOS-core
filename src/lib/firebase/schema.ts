
import {
  Timestamp,
  type FirestoreDataConverter,
  type DocumentData,
  type QueryDocumentSnapshot,
  type SnapshotOptions,
  FieldValue,
  serverTimestamp,
} from 'firebase/firestore';

import type { Resident as AppResident } from '@/types';
import type { BlotterCase as AppBlotterCase } from '@/types/blotter';
import type { BusinessPermit as AppBusinessPermit } from '@/types/permits';

// Base interface with mandatory system fields for all Firestore documents
interface BaseDoc {
  id: string; // The document ID
  barangayId: string; // For multi-tenant security
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string; // UID of the user who created the document
}

// Extend the application-level types with our base document fields
export interface Resident extends AppResident, BaseDoc {}
export interface BlotterCase extends AppBlotterCase, BaseDoc {}
export interface BusinessPermit extends AppBusinessPermit, BaseDoc {}


// Generic converter fromFirestore function
function fromFirestore<T extends BaseDoc>(
  snapshot: QueryDocumentSnapshot,
  options: SnapshotOptions
): T {
  const data = snapshot.data(options) as Omit<T, 'id'>;
  // Combine the document ID with the data from the snapshot
  return {
    id: snapshot.id,
    ...data,
  } as T;
}

// ==================================================================
// RESIDENT CONVERTER
// ==================================================================
export const residentConverter: FirestoreDataConverter<Resident> = {
  toFirestore: (resident: Resident): DocumentData => {
    const { id, ...data } = resident;
    return {
      ...data,
      // Ensure timestamps are handled correctly on create vs update
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt : serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
  },
  fromFirestore: (snapshot, options) => fromFirestore<Resident>(snapshot, options),
};

// ==================================================================
// BLOTTER CASE CONVERTER
// ==================================================================
export const blotterCaseConverter: FirestoreDataConverter<BlotterCase> = {
  toFirestore: (blotterCase: BlotterCase): DocumentData => {
    const { id, ...data } = blotterCase;
    return {
      ...data,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt : serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
  },
  fromFirestore: (snapshot, options) => fromFirestore<BlotterCase>(snapshot, options),
};

// ==================================================================
// BUSINESS PERMIT CONVERTER
// ==================================================================
export const businessPermitConverter: FirestoreDataConverter<BusinessPermit> = {
  toFirestore: (permit: BusinessPermit): DocumentData => {
    const { id, ...data } = permit;
    return {
      ...data,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt : serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
  },
  fromFirestore: (snapshot, options) => fromFirestore<BusinessPermit>(snapshot, options),
};

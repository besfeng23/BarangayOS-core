
import { collection, CollectionReference, DocumentData } from 'firebase/firestore';
import { db } from './client';
import { residentConverter, blotterCaseConverter, businessPermitConverter, type Resident, type BlotterCase, type BusinessPermit } from './schema';

// This file centralizes all Firestore collection references, ensuring type safety.

// Helper function to create a typed collection reference
function createCollection<T = DocumentData>(collectionName: string) {
  return collection(db, collectionName) as CollectionReference<T>;
}

// Export typed collections
export const residentsCollection = createCollection<Resident>('residents').withConverter(residentConverter);
export const blotterCasesCollection = createCollection<BlotterCase>('blotter_cases').withConverter(blotterCaseConverter);
export const businessPermitsCollection = createCollection<BusinessPermit>('business_permits').withConverter(businessPermitConverter);

// You can also add common queries here in the future
// Example:
// import { query, where } from 'firebase/firestore';
// export const getActiveResidentsQuery = (barangayId: string) => {
//   return query(
//     residentsCollection,
//     where('barangayId', '==', barangayId),
//     where('status', '==', 'active')
//   );
// };

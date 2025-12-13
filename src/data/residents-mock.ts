import { Timestamp } from 'firebase/firestore';
import type { Resident, Sector } from '@/types';

// Helper to create a Firestore-like Timestamp
const createTimestamp = (dateString: string): Timestamp => {
  const date = new Date(dateString);
  return new Timestamp(Math.floor(date.getTime() / 1000), 0);
};

export const mockResidents: Resident[] = [
  {
    id: 'res-001',
    barangayId: 'brgy-01',
    rbiId: 'BRGY-2024-0001',
    householdId: 'hh-001',
    fullName: {
      last: 'Dela Cruz',
      first: 'Juan',
      middle: 'Reyes',
    },
    displayName: 'DELA CRUZ, Juan Reyes',
    displayNameLower: 'dela cruz, juan reyes',
    sex: 'M',
    dateOfBirth: createTimestamp('1955-03-15'),
    placeOfBirth: 'Manila',
    civilStatus: 'married',
    addressSnapshot: {
      purok: 'Purok 1',
      addressLine: '123 Rizal St, Brgy. Dau',
    },
    contact: {
      mobile: '09171234567',
      email: 'juan.delacruz@example.com',
    },
    voter: {
      isVoter: true,
      precinctNumber: '0032A',
    },
    sectorFlags: {
      senior: true,
      pwd: false,
      soloParent: false,
      indigent: false,
      fourPs: false,
      osy: false,
    },
    status: 'active',
    consent: {
      signed: true,
      signedAt: createTimestamp('2023-01-10'),
    },
    qr: {},
    photoFilePath: 'https://i.pravatar.cc/150?u=res-001',
    createdBy: 'user-admin',
    createdAt: createTimestamp('2023-01-10'),
    updatedBy: 'user-admin',
    updatedAt: createTimestamp('2024-05-20'),
  },
  {
    id: 'res-002',
    barangayId: 'brgy-01',
    rbiId: 'BRGY-2024-0002',
    householdId: 'hh-002',
    fullName: {
      last: 'Santos',
      first: 'Maria',
      middle: 'Lim',
    },
    displayName: 'SANTOS, Maria Lim',
    displayNameLower: 'santos, maria lim',
    sex: 'F',
    dateOfBirth: createTimestamp('1988-07-22'),
    placeOfBirth: 'Cebu City',
    civilStatus: 'single',
    addressSnapshot: {
      purok: 'Purok 3',
      addressLine: '456 Bonifacio St, Brgy. Dau',
    },
    contact: {
      mobile: '09189876543',
    },
    voter: {
      isVoter: true,
      precinctNumber: '0034B',
    },
    sectorFlags: {
      senior: false,
      pwd: false,
      soloParent: true,
      indigent: true,
      fourPs: true,
      osy: false,
    },
    status: 'active',
    consent: {
      signed: true,
      signedAt: createTimestamp('2023-02-15'),
    },
    qr: {},
    photoFilePath: 'https://i.pravatar.cc/150?u=res-002',
    createdBy: 'user-admin',
    createdAt: createTimestamp('2023-02-15'),
    updatedBy: 'user-admin',
    updatedAt: createTimestamp('2024-06-01'),
  },
  {
    id: 'res-003',
    barangayId: 'brgy-01',
    rbiId: 'BRGY-2024-0003',
    householdId: 'hh-001',
    fullName: {
      last: 'Dela Cruz',
      first: 'Pedro',
      middle: 'Santos',
    },
    displayName: 'DELA CRUZ, Pedro Santos',
    displayNameLower: 'dela cruz, pedro santos',
    sex: 'M',
    dateOfBirth: createTimestamp('2005-11-30'),
    placeOfBirth: 'Mabalacat, Pampanga',
    civilStatus: 'single',
    addressSnapshot: {
      purok: 'Purok 1',
      addressLine: '123 Rizal St, Brgy. Dau',
    },
    contact: {},
    voter: {
      isVoter: false,
    },
    sectorFlags: {
      senior: false,
      pwd: false,
      soloParent: false,
      indigent: false,
      fourPs: false,
      osy: true,
    },
    status: 'active',
    consent: {
      signed: false,
    },
    qr: {},
    createdBy: 'user-admin',
    createdAt: createTimestamp('2023-03-20'),
    updatedBy: 'user-admin',
    updatedAt: createTimestamp('2023-03-20'),
  },
];


export const mockPuroks = [
    "Purok 1",
    "Purok 2",
    "Purok 3",
    "Purok 4",
    "Purok 5",
    "Purok 6",
    "Purok 7"
];

type SectorInfo = { label: string; count: number };

export const mockSectors: Record<Sector, SectorInfo> = {
    senior: { label: "Senior Citizen", count: 120 },
    pwd: { label: "PWD", count: 45 },
    soloParent: { label: "Solo Parent", count: 88 },
    indigent: { label: "Indigent", count: 250 },
    fourPs: { label: "4Ps Beneficiary", count: 180 },
    osy: { label: "Out-of-School Youth", count: 65 },
};

    
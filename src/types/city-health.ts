import { Timestamp } from 'firebase/firestore';

export namespace CityHealthTypes {

  export type HealthRole = 'BHW' | 'NURSE' | 'MIDWIFE' | 'ADMIN';

  export interface HealthPatient {
    id: string;
    tenantId: string; // barangayId
    fullName: string;
    birthDate: Timestamp;
    sex: 'M' | 'F';
    address: {
        purok: string;
        street: string;
        barangay: string;
    };
    contact: {
        mobile?: string;
        email?: string;
    };
    tags: ('senior' | 'pregnant' | 'child' | 'pwd')[];
    conditions: string[];
    allergies: string[];
    lastVisitAt?: Timestamp;
    createdAt: Timestamp;
    updatedAt: Timestamp;
  }

  export interface QueueItem {
    id: string;
    tenantId: string;
    patientId: string;
    patientSnapshot: Pick<HealthPatient, 'fullName' | 'birthDate' | 'sex' | 'tags'>;
    type: 'walk-in' | 'appointment' | 'emergency';
    status: 'waiting' | 'in-consult' | 'done' | 'cancelled';
    priorityTags: ('senior' | 'pregnant' | 'child' | 'pwd')[];
    arrivalAt: Timestamp;
    consultStartAt?: Timestamp;
    consultEndAt?: Timestamp;
    assignedToUserId?: string;
  }
  
  export interface Consultation {
    id: string;
    tenantId: string;
    patientId: string;
    queueItemId?: string;
    providerUserId: string;
    vitals: {
      tempC?: number;
      bp?: { systolic: number; diastolic: number; };
      heartRate?: number;
      respRate?: number;
      o2Sat?: number;
      weightKg?: number;
      heightCm?: number;
    };
    complaint: string;
    assessment: string;
    plan: string;
    followUpAt?: Timestamp;
    status: 'draft' | 'completed';
    createdAt: Timestamp;
    updatedAt: Timestamp;
  }
  
  export interface ProgramEnrollment {
    id: string;
    tenantId: string;
    patientId: string;
    programId: 'immunization' | 'prenatal' | 'tb-dots' | 'family-planning' | 'senior-care' | 'ncd';
    status: 'active' | 'completed' | 'dropped-out';
    enrolledAt: Timestamp;
    completedAt?: Timestamp;
  }

  export interface ProgramEvent {
    id: string;
    tenantId: string;
    patientId: string;
    programId: string;
    enrollmentId: string;
    eventType: 'dose' | 'checkup' | 'visit';
    details: object; // e.g. { vaccine: 'BCG', dose: 1, lotNo: 'xyz' }
    eventAt: Timestamp;
    createdByUserId: string;
  }

  export interface Medicine {
    id: string;
    tenantId: string;
    name: string;
    genericName?: string;
    stock: number;
    reorderLevel: number;
    expiryBatches: {
      qty: number;
      expiryDate: Timestamp;
      lotNo?: string;
    }[];
    updatedAt: Timestamp;
  }

  export interface Dispense {
    id: string;
    tenantId: string;
    patientId: string;
    consultationId?: string;
    medicineId: string;
    medicineNameSnapshot: string;
    quantity: number;
    instructions: string;
    dispensedByUserId: string;
    dispensedAt: Timestamp;
  }

  export interface HealthAlert {
    id: string;
    tenantId: string;
    type: 'follow-up' | 'overdue-dose' | 'abnormal-vitals' | 'low-stock';
    patientId?: string;
    medicineId?: string;
    severity: 'low' | 'medium' | 'high';
    message: string;
    status: 'open' | 'resolved' | 'snoozed';
    createdAt: Timestamp;
    resolvedAt?: Timestamp;
  }
  
  export interface HealthAuditLog {
    id: string;
    tenantId: string;
    actorUserId: string;
    action: 'view-patient' | 'create-consult' | 'dispense-med' | 'update-inventory';
    entityType: 'patient' | 'consultation' | 'medicine' | 'dispense';
    entityId: string;
    details?: object; // e.g. { before: {..}, after: {..} }
    createdAt: Timestamp;
  }
}

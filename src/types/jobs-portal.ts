import { Timestamp } from 'firebase/firestore';

export namespace JobsPortalTypes {

  export type JobStatus = 'open' | 'closed' | 'expired' | 'filled' | 'pending_approval';
  export type JobType = 'Full-time' | 'Part-time' | 'Contract' | 'Temporary';
  export type WorkMode = 'On-site' | 'Hybrid' | 'Remote';
  
  export interface Job {
    id: string;
    title: string;
    companyId: string;
    companyName: string;
    verifiedEmployer: boolean;
    location: string; // Barangay or City
    category: string;
    type: JobType;
    mode: WorkMode;
    salaryMin?: number;
    salaryMax?: number;
    tags: string[];
    urgent: boolean;
    closingDate?: Timestamp;
    createdAt: Timestamp;
    status: JobStatus;
    description?: string;
    responsibilities?: string[];
    requirements?: string[];
    skills?: string[];
  }

  export type ApplicationStatus = 'draft' | 'submitted' | 'under_review' | 'interview_scheduled' | 'hired' | 'rejected' | 'withdrawn' | 'queued';
  
  export interface Application {
    id: string;
    jobId: string;
    residentId: string;
    status: ApplicationStatus;
    timeline: { status: ApplicationStatus; date: Timestamp; notes?: string }[];
    attachments: string[]; // paths to files in Storage
    submittedAt: Timestamp;
    queuedOffline?: boolean;
  }

  export type VerificationStatus = 'pending' | 'verified' | 'rejected';

  export interface Employer {
    id: string;
    name: string;
    contactPerson: string;
    verificationStatus: VerificationStatus;
    docs: string[]; // paths to verification docs
    createdAt: Timestamp;
  }

  export interface ResidentProfile {
    id: string;
    name: string;
    contact: { phone: string; email?: string };
    skills: string[];
    education: { institution: string; degree: string; year: number }[];
    workHistory: { company: string; position: string; years: number }[];
    privacySettings: {
      hideFullAddress: boolean;
      hidePhone: boolean;
    };
  }

}

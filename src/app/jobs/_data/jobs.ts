
export type JobStatus = 'open' | 'closed' | 'expired' | 'filled' | 'pending_approval';
export type JobType = 'Full-time' | 'Part-time' | 'Contract' | 'Temporary';
export type WorkMode = 'On-site' | 'Hybrid' | 'Remote';

export interface Job {
  id: string;
  title: string;
  companyName: string;
  location: string;
  type: JobType;
  workMode: WorkMode;
  salaryMin?: number;
  salaryMax?: number;
  urgent: boolean;
  postedDate: string;
}

export const featuredJobs: Job[] = [
    {
        id: 'job-001',
        title: 'Barangay Health Worker (BHW)',
        companyName: 'LGU - City Health Office',
        location: 'Mabalacat City, Pampanga',
        type: 'Full-time',
        workMode: 'On-site',
        salaryMin: 15000,
        salaryMax: 18000,
        urgent: true,
        postedDate: '2024-07-28',
    },
    {
        id: 'job-002',
        title: 'Customer Service Representative',
        companyName: 'Stellar Solutions BPO',
        location: 'Clark Freeport Zone',
        type: 'Full-time',
        workMode: 'On-site',
        salaryMin: 22000,
        salaryMax: 28000,
        urgent: true,
        postedDate: '2024-07-27',
    },
    {
        id: 'job-003',
        title: 'Bookkeeper / Accounting Staff',
        companyName: 'Pampanga Premier Finance',
        location: 'Angeles City',
        type: 'Full-time',
        workMode: 'Hybrid',
        salaryMin: 18000,
        salaryMax: 24000,
        urgent: false,
        postedDate: '2024-07-25',
    }
];

export const latestJobs: Job[] = [
    {
        id: 'job-004',
        title: 'Tanod / Security Personnel',
        companyName: 'Barangay Dau Office',
        location: 'Mabalacat City, Pampanga',
        type: 'Contract',
        workMode: 'On-site',
        salaryMin: 12000,
        urgent: false,
        postedDate: '2024-07-29',
    },
    {
        id: 'job-005',
        title: 'Retail Sales Associate',
        companyName: 'SM City Clark',
        location: 'Clark Freeport Zone',
        type: 'Full-time',
        workMode: 'On-site',
        salaryMin: 16000,
        urgent: false,
        postedDate: '2024-07-28',
    },
    {
        id: 'job-006',
        title: 'Cafe Barista',
        companyName: 'The Grind Coffee House',
        location: 'Friendship Highway, Angeles',
        type: 'Part-time',
        workMode: 'On-site',
        urgent: false,
        postedDate: '2024-07-28',
    },
    {
        id: 'job-007',
        title: 'Virtual Assistant (Admin)',
        companyName: 'Global Remote Staff Inc.',
        location: 'Pampanga',
        type: 'Full-time',
        workMode: 'Remote',
        salaryMin: 25000,
        salaryMax: 35000,
        urgent: true,
        postedDate: '2024-07-27',
    }
];

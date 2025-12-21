
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
  description: string;
  responsibilities: string[];
  requirements: string[];
}

export const allJobs: Job[] = [
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
        description: 'Provide basic health education and services to the community. Act as a frontline health worker in the barangay.',
        responsibilities: ['Conduct household visits', 'Assist in implementing health programs', 'Maintain community health records', 'Provide basic first aid'],
        requirements: ['Resident of the barangay', 'At least a high school graduate', 'Good communication skills', 'Willing to undergo training'],
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
        description: 'Handle customer inquiries and complaints via phone, email, and chat for an international account.',
        responsibilities: ['Answer incoming calls and respond to customer emails', 'Manage and resolve customer complaints', 'Identify and escalate issues to supervisors', 'Provide product and service information'],
        requirements: ['Excellent English communication skills', 'At least 2 years of college', 'BPO experience is a plus but not required', 'Willing to work in shifting schedules'],
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
        description: 'Responsible for maintaining financial records, including purchases, sales, receipts, and payments.',
        responsibilities: ['Record day-to-day financial transactions', 'Prepare and process invoices', 'Assist in the preparation of financial statements', 'Reconcile bank statements'],
        requirements: ['Graduate of Accounting or any related course', 'At least 1 year of bookkeeping experience', 'Proficient in MS Excel', 'High attention to detail'],
    },
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
        description: 'Ensure the peace and order within the barangay through patrol and visibility.',
        responsibilities: ['Patrol assigned areas', 'Respond to citizen complaints', 'Assist police in crime prevention', 'Direct traffic during peak hours'],
        requirements: ['Resident of the barangay', 'Physically fit and of good moral character', 'No criminal record', 'Willing to work long hours'],
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
        description: 'Assist customers with their shopping needs and process transactions.',
        responsibilities: ['Greet customers and offer assistance', 'Operate cash registers and process payments', 'Maintain stock and store appearance', 'Achieve sales targets'],
        requirements: ['High school graduate', 'Experience in retail is a plus', 'Friendly and outgoing personality', 'Willing to work on weekends and holidays'],
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
        description: 'Prepare and serve hot and cold beverages, such as coffee, espresso drinks, blended coffees, and teas.',
        responsibilities: ['Prepare beverages to standard recipes', 'Take customer orders and payments', 'Maintain a clean and sanitized work area', 'Describe menu items to customers'],
        requirements: ['Experience as a barista is an advantage', 'Knowledge of brewing methods', 'Excellent communication skills', 'Passion for coffee'],
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
        description: 'Provide administrative support to our clients from a remote location.',
        responsibilities: ['Manage emails and schedules', 'Perform market research', 'Create presentations and reports', 'Handle basic bookkeeping tasks'],
        requirements: ['Proven experience as a Virtual Assistant', 'Excellent written and verbal communication skills', 'Proficient in MS Office and Google Workspace', 'Must have a reliable internet connection and own computer'],
    }
];


export const featuredJobs: Job[] = allJobs.filter(job => job.urgent);
export const latestJobs: Job[] = allJobs.sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime());

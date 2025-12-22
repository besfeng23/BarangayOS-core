import React from 'react';
import {
  Users,
  FileText,
  Scale,
  Shield,
  Briefcase,
  HeartPulse,
  Wallet,
  LucideIcon,
  Building,
  Newspaper,
  LayoutGrid,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type ModuleStatus = 'INSTALLED' | 'AVAILABLE';

interface Module {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  status: ModuleStatus;
  href?: string;
}

const modules: Module[] = [
  {
    id: 'residents',
    name: 'Resident Records',
    description: 'View, add, or manage residents.',
    icon: Users,
    status: 'INSTALLED',
    href: '/residents',
  },
  {
    id: 'certificates',
    name: 'Certificates',
    description: 'Issue official barangay documents.',
    icon: FileText,
    status: 'INSTALLED',
    href: '/certificates',
  },
  {
    id: 'blotter',
    name: 'Digital Blotter',
    description: 'Log and manage community disputes.',
    icon: Scale,
    status: 'INSTALLED',
    href: '/blotter',
  },
   {
    id: 'permits',
    name: 'Business Permits',
    description: 'Register and renew local business permits.',
    icon: Building,
    status: 'INSTALLED',
    href: '/permits',
  },
  {
    id: 'emango',
    name: 'eMango Wallet',
    description: 'Digital collections and disbursements.',
    icon: Wallet,
    status: 'INSTALLED',
    href: '/emango',
  },
  {
    id: 'procurement',
    name: 'Add-ons & Procurement',
    description: 'Browse and request hardware add-ons.',
    icon: Briefcase,
    status: 'INSTALLED',
    href: '/addons',
  },
  {
    id: 'jobs',
    name: 'Jobs Portal',
    description: 'Connect residents with local job opportunities.',
    icon: Briefcase,
    status: 'INSTALLED',
    href: '/jobs',
  },
  {
    id: 'security',
    name: 'Security & Emergency',
    description: 'Manage security devices and incidents.',
    icon: Shield,
    status: 'INSTALLED',
    href: '/security',
  },
  {
    id: 'health',
    name: 'City Health EMR',
    description: 'View patient records and consultations.',
    icon: HeartPulse,
    status: 'INSTALLED',
    href: '/city-health',
  },
  {
    id: 'financials',
    name: 'Financials',
    description: 'Official bookkeeping and accounting system.',
    icon: Wallet,
    status: 'AVAILABLE',
  },
  {
    id: 'announcements',
    name: 'Announcements',
    description: 'Publish announcements to the community.',
    icon: Newspaper,
    status: 'AVAILABLE',
  },
  {
    id: 'more',
    name: 'More Apps',
    description: 'Explore other integrations and modules.',
    icon: LayoutGrid,
    status: 'AVAILABLE',
  },
];

const ModuleCard = ({ module }: { module: Module; }) => {
  const CardContent = (
    <div
      className={`group relative flex flex-col rounded-2xl border bg-slate-800/30 p-4 min-h-[180px] h-full ${
        module.status === 'INSTALLED'
          ? 'border-slate-700/80 hover:bg-slate-800/60 cursor-pointer'
          : 'border-slate-700/50 grayscale opacity-70 hover:opacity-100 hover:grayscale-0 transition-all'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-lg ${module.status === 'INSTALLED' ? 'bg-blue-500/10' : 'bg-slate-700/50'}`}>
            <module.icon className={`w-6 h-6 ${module.status === 'INSTALLED' ? 'text-blue-400' : 'text-slate-400'}`} />
        </div>
        <h3 className="text-lg font-semibold text-slate-100">{module.name}</h3>
      </div>
      <p className="text-sm text-slate-300 mt-2 flex-grow">{module.description}</p>
      <div
        className={`mt-4 w-full rounded-xl border py-2.5 text-center text-sm font-bold tracking-widest ${
          module.status === 'INSTALLED'
            ? 'bg-slate-800/60 border-slate-700/50 text-slate-100'
            : 'bg-blue-600/20 border-blue-500/30 text-blue-300 group-hover:bg-blue-500 group-hover:text-black'
        }`}
      >
        {module.status === 'INSTALLED' ? 'OPEN' : 'INFO'}
      </div>
    </div>
  );

  if (module.status === 'INSTALLED' && module.href) {
    return <Link href={module.href} passHref>{CardContent}</Link>;
  }

  return <div className="text-left h-full w-full cursor-not-allowed">{CardContent}</div>;
};


export default function AppHubPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Applications</h1>
        <p className="text-slate-300">
          Manage installed modules for your barangay.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {modules.map((module) => (
          <ModuleCard key={module.id} module={module} />
        ))}
      </div>
    </div>
  );
}

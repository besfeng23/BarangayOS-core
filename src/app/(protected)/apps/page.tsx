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
import { LolaCard, LolaHeader, LolaPage, LolaRowLink, LolaSection } from '@/components/lola';

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

export default function AppHubPage() {
  const installed = modules.filter((module) => module.status === 'INSTALLED');
  const available = modules.filter((module) => module.status === 'AVAILABLE');

  return (
    <LolaPage>
      <LolaHeader
        title="BarangayOS Applications"
        subtitle="Large, single-column tiles with clear chevrons so Lola knows where to go."
      />

      <div className="space-y-6">
        <LolaSection title="Installed" subtitle="Open the core modules your barangay uses daily.">
          <LolaCard className="space-y-3">
            {installed.map((module) => (
              <LolaRowLink
                key={module.id}
                title={module.name}
                description={module.description}
                href={module.href}
                meta="Open"
                icon={<module.icon className="h-6 w-6" />}
              />
            ))}
          </LolaCard>
        </LolaSection>

        <LolaSection title="Coming Soon" subtitle="Preview modules that will roll out next.">
          <LolaCard className="space-y-3">
            {available.map((module) => (
              <LolaRowLink
                key={module.id}
                title={module.name}
                description={module.description}
                disabled
                meta="Planned"
                icon={<module.icon className="h-6 w-6" />}
              />
            ))}
          </LolaCard>
        </LolaSection>
      </div>
    </LolaPage>
  );
}

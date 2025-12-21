
'use client';

import React, { useState } from 'react';
import {
  Users,
  FileText,
  Scale,
  Shield,
  Briefcase,
  HeartPulse,
  Wallet,
  LucideIcon,
} from 'lucide-react';
import Link from 'next/link';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
    id: 'payments',
    name: 'Digital Payments',
    description: 'eMango Wallet for collections and disbursements.',
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
];

const ModuleCard = ({ module, onInstallClick }: { module: Module; onInstallClick: (module: Module) => void; }) => {
  const content = (
    <div
      className={`group relative flex flex-col rounded-2xl border bg-zinc-900/40 p-4 min-h-[180px] h-full ${
        module.status === 'INSTALLED'
          ? 'border-zinc-800 hover:bg-zinc-900/60 cursor-pointer'
          : 'border-zinc-700/80 grayscale opacity-80 hover:opacity-100 hover:grayscale-0 transition-all'
      }`}
    >
      <div className="flex items-center gap-4">
        <module.icon className="w-8 h-8 text-zinc-400 group-hover:text-amber-400 transition-colors" />
        <h3 className="text-lg font-semibold text-zinc-100">{module.name}</h3>
      </div>
      <p className="text-sm text-zinc-300 mt-2 flex-grow">{module.description}</p>
      <div
        className={`mt-4 w-full rounded-xl border py-3 text-center text-sm font-bold tracking-widest ${
          module.status === 'INSTALLED'
            ? 'bg-zinc-800/60 border-zinc-700/50 text-zinc-100'
            : 'bg-blue-600/20 border-blue-500/30 text-blue-300 group-hover:bg-blue-500 group-hover:text-black'
        }`}
      >
        {module.status === 'INSTALLED' ? 'OPEN' : 'INSTALL'}
      </div>
    </div>
  );

  if (module.status === 'INSTALLED' && module.href) {
    return <Link href={module.href}>{content}</Link>;
  }

  return <button onClick={() => onInstallClick(module)} className="text-left h-full">{content}</button>;
};


const ActivationModal = ({ module, isOpen, onClose }: { module: Module | null, isOpen: boolean, onClose: () => void }) => {
    if (!module) return null;
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                <DialogHeader>
                    <DialogTitle>Activate {module.name}?</DialogTitle>
                    <DialogDescription>
                        This module requires activation. Please contact your system administrator.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} className="h-12">Cancel</Button>
                    <Button onClick={onClose} className="h-12">Understood</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};


export default function AppHubPage() {
    const [modalModule, setModalModule] = useState<Module | null>(null);

    const handleCardClick = (module: Module) => {
        if(module.status === 'AVAILABLE') {
            setModalModule(module);
        }
    };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Applications</h1>
        <p className="text-slate-200">
          Manage installed modules for your barangay.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {modules.map((module) => (
          <ModuleCard key={module.id} module={module} onInstallClick={handleCardClick} />
        ))}
      </div>

      <ActivationModal module={modalModule} isOpen={!!modalModule} onClose={() => setModalModule(null)} />
    </div>
  );
}

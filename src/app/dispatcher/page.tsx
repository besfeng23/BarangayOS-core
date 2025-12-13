'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Search,
  Radio,
  Download,
  AlertTriangle,
  Info,
  ChevronRight,
  Lock,
  Camera,
  Bell,
  HardDrive,
  BarChart,
  ShieldCheck,
  FileText,
  Star,
  X,
  Smartphone,
  Router,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";


// --- Mock Data & Types ---

type ModuleStatus = "not_installed" | "installed" | "update_available" | "restricted" | "installing" | "error";

const mockModuleData = {
  id: "dispatcher",
  name: "Dispatcher",
  tagline: "Receive incidents, assign responders, track ETA.",
  description: "A real-time incident management system designed for barangay-level emergency response. Log events, dispatch tanods or medical teams, and monitor the situation as it unfolds. Built for speed and reliability, even in low-network conditions.",
  icon: "Radio",
  version: "1.2.0",
  newVersion: "1.3.0",
  sizeMb: 18,
  offlineReady: true,
  lastUpdated: new Date('2025-10-01T10:00:00Z').toISOString(),
  allowedRoles: ["admin", "dispatcher", "secretary"],
  permissions: [
    { key: "notifications", required: true, reason: "Alerts for new incidents", icon: Bell },
    { key: "location", required: false, reason: "Pin incident location and compute ETA", icon: Lock },
    { key: "camera", required: false, reason: "Attach photo evidence", icon: Camera },
  ],
  features: [
    { name: "Incident Intake", icon: FileText },
    { name: "Priority Triage", icon: AlertTriangle },
    { name: "Assignment & Dispatch", icon: Smartphone },
    { name: "ETA Tracking", icon: Router },
    { name: "Offline Queue", icon: HardDrive },
    { name: "Audit Trail", icon: ShieldCheck },
    { name: "Auto Reports", icon: BarChart },
    { name: "Team Chat", icon: MessageSquare },
  ],
  screenshots: [
    "https://picsum.photos/seed/disp1/600/400",
    "https://picsum.photos/seed/disp2/600/400",
    "https://picsum.photos/seed/disp3/600/400",
  ],
  whatsNew: [
    "Added team chat feature for coordinated response.",
    "Improved offline sync stability.",
    "New report template for monthly summaries.",
  ],
  requirements: {
    android: "10+",
    storageMb: 100,
    network: "Optional (syncs when available)",
  },
};

const mockUserData = {
  uid: 'user123',
  role: 'dispatcher', // "staff"
  deviceId: 'BRGY-TAB-03',
};

const mockInstallData = {
  status: 'not_installed' // "installed", "update_available"
};


// --- Main Component ---
export default function DispatcherModulePage() {
  const [userRole, setUserRole] = useState(mockUserData.role);
  const [installStatus, setInstallStatus] = useState(mockInstallData.status);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installProgress, setInstallProgress] = useState(0);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);


  const moduleState: ModuleStatus = useMemo(() => {
    if (!mockModuleData.allowedRoles.includes(userRole)) return 'restricted';
    if (isInstalling) return 'installing';
    return installStatus as ModuleStatus;
  }, [userRole, installStatus, isInstalling]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isInstalling) {
      setInstallProgress(0);
      timer = setInterval(() => {
        setInstallProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            setIsInstalling(false);
            setInstallStatus('installed');
            return 100;
          }
          return prev + 10;
        });
      }, 300);
    }
    return () => clearInterval(timer);
  }, [isInstalling]);


  const handlePrimaryAction = () => {
    switch(moduleState) {
        case 'not_installed':
        case 'update_available':
            setIsInstallModalOpen(true);
            break;
        case 'restricted':
            setIsRequestModalOpen(true);
            break;
        case 'installed':
            // In a real app, this would navigate to the module's main page
            alert('Opening Dispatcher Module...');
            break;
        case 'error':
             handleInstall();
            break;
    }
  };
  
  const handleInstall = () => {
      setIsInstallModalOpen(false);
      setIsInstalling(true);
  }

  const getButtonProps = (): { text: string; disabled: boolean; variant: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | null | undefined } => {
    switch (moduleState) {
      case 'not_installed': return { text: 'GET', disabled: false, variant: 'default' };
      case 'installing': return { text: `${installProgress}%`, disabled: true, variant: 'outline' };
      case 'installed': return { text: 'OPEN', disabled: false, variant: 'secondary' };
      case 'update_available': return { text: 'UPDATE', disabled: false, variant: 'default' };
      case 'restricted': return { text: 'REQUEST ACCESS', disabled: false, variant: 'outline' };
      case 'error': return { text: 'RETRY', disabled: false, variant: 'destructive' };
      default: return { text: '...', disabled: true, variant: 'outline' };
    }
  };
  const buttonProps = getButtonProps();

  const getStatusChipProps = (): { text: string, variant: "default" | "destructive" | "outline" | "secondary" } => {
     switch (moduleState) {
      case 'not_installed': return { text: 'Not Installed', variant: 'secondary' };
      case 'installing': return { text: 'Installing', variant: 'secondary' };
      case 'installed': return { text: 'Installed', variant: 'default' };
      case 'update_available': return { text: 'Update Available', variant: 'default' };
      case 'restricted': return { text: 'Restricted', variant: 'destructive' };
      case 'error': return { text: 'Install Failed', variant: 'destructive' };
      default: return { text: '...', variant: 'secondary' };
    }
  }
  const statusChipProps = getStatusChipProps();


  return (
    <div className="bg-slate-900 min-h-screen text-white font-sans">
      {/* Sticky Top Bar */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-slate-700">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" passHref>
             <Button variant="ghost" size="icon">
                <ArrowLeft />
             </Button>
          </Link>
          <h1 className="text-xl font-bold">App Hub</h1>
          <Button variant="ghost" size="icon">
            <Search />
          </Button>
        </div>
      </header>

      <main className="container mx-auto p-4 space-y-8 pb-24">
        {/* Greeting Header */}
        <div className="flex justify-between items-center">
            <div>
                <h2 className="text-3xl font-bold">Good Afternoon</h2>
                <p className="text-slate-400">Welcome to the BarangayOS App Hub</p>
            </div>
            <Badge variant="outline">{mockUserData.deviceId}</Badge>
        </div>

        {/* Module Hero Card */}
        <Card className="bg-slate-800/50 border-slate-700 overflow-hidden text-center">
          <CardContent className="p-8 space-y-6">
            <div className="absolute top-4 right-4">
                 <Badge variant={statusChipProps.variant}>{statusChipProps.text}</Badge>
            </div>
            <Radio className="w-20 h-20 mx-auto text-blue-400" strokeWidth={1} />
            <div className="space-y-1">
              <h3 className="text-3xl font-bold">{mockModuleData.name}</h3>
              <p className="text-slate-400">{mockModuleData.tagline}</p>
            </div>
            
            <div className="w-full max-w-xs mx-auto">
              <Button 
                size="lg" 
                className="w-full text-lg h-14" 
                onClick={handlePrimaryAction}
                disabled={buttonProps.disabled}
                variant={buttonProps.variant}
              >
                {buttonProps.text}
              </Button>
              {moduleState === 'installing' && <Progress value={installProgress} className="w-full mt-2 h-2" />}
            </div>

            <div className="text-xs text-slate-500 flex justify-center items-center gap-x-3">
              <span>{mockModuleData.sizeMb} MB</span>
              <span className="text-slate-600">&bull;</span>
              <span>{mockModuleData.offlineReady ? 'Offline Ready' : 'Online Only'}</span>
               <span className="text-slate-600">&bull;</span>
              <span>Updated {new Date(mockModuleData.lastUpdated).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
            </div>
          </CardContent>
        </Card>
        
        {/* Overview Section */}
        <InfoCard title="Overview">
            <p className="text-slate-300 leading-relaxed">{mockModuleData.description}</p>
        </InfoCard>

        {/* Features Section */}
        <InfoCard title="Features">
            <div className="grid grid-cols-2 gap-4">
                {mockModuleData.features.map(feature => {
                    const Icon = feature.icon;
                    return (
                        <div key={feature.name} className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-lg">
                            <Icon className="w-6 h-6 text-blue-400"/>
                            <span className="font-medium">{feature.name}</span>
                        </div>
                    );
                })}
            </div>
        </InfoCard>

        {/* Screenshots Section */}
        <InfoCard title="Screenshots">
           <Carousel className="w-full">
              <CarouselContent>
                {mockModuleData.screenshots.map((src, index) => (
                  <CarouselItem key={index}>
                    <Image src={src} alt={`Screenshot ${index + 1}`} width={600} height={400} className="rounded-lg w-full aspect-video object-cover"/>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2"/>
              <CarouselNext className="right-2"/>
            </Carousel>
        </InfoCard>

        {/* What's New Section */}
        <InfoCard title={`What's New in v${mockModuleData.newVersion}`}>
            <ul className="space-y-2 list-disc list-inside text-slate-300">
                {mockModuleData.whatsNew.map(item => <li key={item}>{item}</li>)}
            </ul>
        </InfoCard>

        {/* Permissions Section */}
        <InfoCard title="App Permissions">
            <ul className="space-y-4">
                {mockModuleData.permissions.map(p => {
                    const Icon = p.icon;
                    return (
                        <li key={p.key} className="flex items-start gap-4">
                            <Icon className="w-6 h-6 text-blue-400 mt-1"/>
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="font-semibold capitalize">{p.key}</p>
                                    <Badge variant={p.required ? 'destructive' : 'secondary'}>{p.required ? 'Required' : 'Optional'}</Badge>
                                </div>
                                <p className="text-sm text-slate-400">{p.reason}</p>
                            </div>
                        </li>
                    )
                })}
            </ul>
        </InfoCard>
        
        {/* Requirements Section */}
        <InfoCard title="Requirements">
            <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-slate-800/50 p-3 rounded-lg">
                    <p className="text-sm text-slate-400">Android Version</p>
                    <p className="font-bold text-lg">{mockModuleData.requirements.android}</p>
                </div>
                 <div className="bg-slate-800/50 p-3 rounded-lg">
                    <p className="text-sm text-slate-400">Min. Storage</p>
                    <p className="font-bold text-lg">{mockModuleData.requirements.storageMb} MB</p>
                </div>
                 <div className="bg-slate-800/50 p-3 rounded-lg col-span-2">
                    <p className="text-sm text-slate-400">Network</p>
                    <p className="font-bold text-lg">{mockModuleData.requirements.network}</p>
                </div>
            </div>
        </InfoCard>


      </main>

      {/* --- Modals & Sheets --- */}
      <RequestAccessModal isOpen={isRequestModalOpen} onClose={() => setIsRequestModalOpen(false)} />
      <InstallConfirmationSheet isOpen={isInstallModalOpen} onClose={() => setIsInstallModalOpen(false)} onConfirm={handleInstall} />

    </div>
  );
}

// --- Sub Components ---

const InfoCard = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
            <CardTitle className="text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            {children}
        </CardContent>
    </Card>
);


const RequestAccessModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-slate-800 border-slate-700 text-white">
                <DialogHeader>
                    <DialogTitle>Request Access</DialogTitle>
                    <DialogDescription>
                        This module is restricted. Please provide a reason for requesting access. Your request will be sent to the administrator.
                    </DialogDescription>
                </DialogHeader>
                <Textarea placeholder="Type your reason here..." className="bg-slate-900 border-slate-600 min-h-[100px]"/>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={() => { alert('Request submitted!'); onClose(); }}>Submit Request</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const InstallConfirmationSheet = ({ isOpen, onClose, onConfirm }: { isOpen: boolean, onClose: () => void, onConfirm: () => void }) => {
    const isAdmin = mockUserData.role === 'admin';
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-slate-800 border-slate-700 text-white sm:max-w-[425px] md:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-center text-2xl">Install Module</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-6">
                    <div className="text-center">
                        <Radio className="w-16 h-16 mx-auto text-blue-400" strokeWidth={1} />
                        <h3 className="text-xl font-bold mt-2">{mockModuleData.name}</h3>
                        <p className="text-sm text-slate-400">Version {mockModuleData.newVersion} &bull; {mockModuleData.sizeMb} MB</p>
                    </div>
                    
                    <div>
                        <h4 className="font-semibold mb-2">This app will be able to:</h4>
                        <ul className="space-y-3">
                           {mockModuleData.permissions.map(p => {
                                const Icon = p.icon;
                                return (
                                    <li key={p.key} className="flex items-center gap-3">
                                        <Icon className="w-5 h-5 text-slate-400"/>
                                        <span className="text-slate-300">{p.reason}</span>
                                    </li>
                                );
                           })}
                        </ul>
                    </div>

                    {isAdmin && (
                        <div className="flex items-start space-x-3 bg-slate-900/50 p-4 rounded-lg">
                            <Checkbox id="enable-for-barangay" className="mt-1" />
                            <div className="grid gap-1.5 leading-none">
                                <label htmlFor="enable-for-barangay" className="font-medium">
                                    Enable for this Barangay
                                </label>
                                <p className="text-xs text-slate-400">
                                    As an admin, you can make this module available to all users with allowed roles in your barangay.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="lg" onClick={onClose}>Cancel</Button>
                    <Button size="lg" onClick={onConfirm}>Install</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

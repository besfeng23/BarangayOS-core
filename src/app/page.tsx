
'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/dashboard/StatCard';
import { Users, FileClock, Scale, Plus, Edit, FileText, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { residentConverter, blotterCaseConverter } from '@/lib/firebase/schema';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

const QuickActionCard = ({ title, description, icon: Icon, actionText, href }: { title: string, description: string, icon: React.ElementType, actionText: string, href: string }) => {
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  // This is a mock. In a real app, this would come from an auth context.
  const isRestricted = title === 'Certificates'; 

  const handleClick = (e: React.MouseEvent) => {
    if (isRestricted) {
      e.preventDefault();
      setIsPinModalOpen(true);
    }
  };

  return (
    <>
      <Link href={href} onClick={handleClick} passHref>
        <Card className="group flex flex-col h-full bg-slate-800/50 border-slate-700 hover:border-blue-500 hover:bg-slate-800 transition-all cursor-pointer">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Icon className="w-10 h-10 text-slate-400 group-hover:text-blue-400 transition-colors" />
              <div>
                <CardTitle className="text-2xl">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-grow"></CardContent>
          <CardFooter className="bg-slate-800/70 p-4 mt-auto">
            <p className="font-bold text-lg text-blue-400 group-hover:underline">{actionText}</p>
          </CardFooter>
        </Card>
      </Link>
      <PinModal isOpen={isPinModalOpen} onClose={() => setIsPinModalOpen(false)} />
    </>
  );
};

const PinModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">PIN Required</DialogTitle>
          <DialogDescription className="text-center">
            Enter your PIN to access this module.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center gap-2 py-4">
          <Input type="password" maxLength={1} className="w-12 h-14 text-center text-2xl" />
          <Input type="password" maxLength={1} className="w-12 h-14 text-center text-2xl" />
          <Input type="password" maxLength={1} className="w-12 h-14 text-center text-2xl" />
          <Input type="password" maxLength={1} className="w-12 h-14 text-center text-2xl" />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onClose}>Unlock</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


export default function Home() {
  const [residentCount, setResidentCount] = useState(0);
  const [activeCasesCount, setActiveCasesCount] = useState(0);
  const [pendingClearancesCount, setPendingClearancesCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    // Listener for total residents
    const residentsQuery = query(collection(db, 'residents').withConverter(residentConverter), where('status', '==', 'active'));
    const unsubscribeResidents = onSnapshot(residentsQuery, (snapshot) => {
      setResidentCount(snapshot.size);
    }, (error) => {
      console.error("Error fetching resident count:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not load resident count.' });
    });

    // Listener for active blotter cases
    const blotterQuery = query(collection(db, 'blotter_cases').withConverter(blotterCaseConverter), where('status', '==', 'ACTIVE'));
    const unsubscribeBlotter = onSnapshot(blotterQuery, (snapshot) => {
      setActiveCasesCount(snapshot.size);
    }, (error) => {
      console.error("Error fetching active cases count:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not load active cases count.' });
    });
    
    // Listener for pending certificates/transactions
    const certificatesQuery = query(collection(db, 'transactions'), where('status', '==', 'PENDING'));
    const unsubscribeCertificates = onSnapshot(certificatesQuery, (snapshot) => {
        setPendingClearancesCount(snapshot.size);
    }, (error) => {
        console.error("Error fetching pending clearances:", error);
    });


    return () => {
      unsubscribeResidents();
      unsubscribeBlotter();
      unsubscribeCertificates();
    };
  }, [toast]);

  return (
    <div className="space-y-8 pb-24">
        <section>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard 
                    title="Total Population"
                    value={residentCount.toString()}
                    label="Registered Residents"
                    icon={Users}
                />
                 <StatCard 
                    title="Pending Clearances"
                    value={pendingClearancesCount.toString()}
                    label="Action Required"
                    icon={FileClock}
                    variant="warning"
                />
                 <StatCard 
                    title="Active Cases"
                    value={activeCasesCount.toString()}
                    label="Blotter Log"
                    icon={Scale}
                />
            </div>
        </section>

        <section>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <QuickActionCard 
                  title="Blotter"
                  description="Manage community disputes"
                  icon={Scale}
                  href="/blotter?action=new"
                  actionText="+ FILE BLOTTER"
                />
                <QuickActionCard 
                  title="Certificates"
                  description="Issue official documents"
                  icon={FileText}
                  href="/certificates?action=focus"
                  actionText="+ ISSUE CLEARANCE"
                />
                <QuickActionCard 
                  title="Residents"
                  description="View & manage resident data"
                  icon={Users}
                  href="/residents"
                  actionText="MANAGE RECORDS"
                />
            </div>
        </section>

        <section>
            <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl mb-6">
                Official Integrations
            </h2>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <QuickActionCard 
                  title="Digital Payments"
                  description="eMango Wallet Integration"
                  icon={Briefcase}
                  href="/emango"
                  actionText="OPEN"
                />
                 <QuickActionCard 
                  title="Health Request"
                  description="City Health Integration"
                  icon={FileText}
                  href="/city-health"
                  actionText="OPEN"
                />
            </div>
        </section>
    </div>
  );
}


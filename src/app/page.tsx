
'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/dashboard/StatCard';
import { Users, FileClock, Scale, Plus } from 'lucide-react';
import Link from 'next/link';
import { residentConverter, blotterCaseConverter } from '@/lib/firebase/schema';
import { useToast } from '@/hooks/use-toast';

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
    // Assuming 'transactions' collection is used for certificates
    const certificatesQuery = query(collection(db, 'transactions'), where('status', '==', 'PENDING'));
    const unsubscribeCertificates = onSnapshot(certificatesQuery, (snapshot) => {
        setPendingClearancesCount(snapshot.size);
    }, (error) => {
        console.error("Error fetching pending clearances:", error);
        // Silently fail for now as this feature is upcoming
    });


    return () => {
      unsubscribeResidents();
      unsubscribeBlotter();
      unsubscribeCertificates();
    };
  }, [toast]);

  return (
    <div className="space-y-12">
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
            <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl mb-6">
                Quick Actions
            </h2>
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <Link href="/residents?action=new" passHref>
                    <Button variant="outline" className="h-24 text-xl w-full">
                        <Plus className="mr-2 h-6 w-6"/>
                        New Resident
                    </Button>
                </Link>
                <Link href="/blotter?action=new" passHref>
                    <Button variant="outline" className="h-24 text-xl w-full">
                        <Plus className="mr-2 h-6 w-6"/>
                        File Blotter
                    </Button>
                </Link>
                <Link href="/certificates?action=focus" passHref>
                    <Button variant="outline" className="h-24 text-xl w-full">
                        <Plus className="mr-2 h-6 w-6"/>
                        Issue Clearance
                    </Button>
                </Link>
            </div>
        </section>
    </div>
  );
}

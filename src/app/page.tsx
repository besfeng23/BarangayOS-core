
'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/dashboard/StatCard';
import { Users, FileClock, Scale, Plus, Edit, FileText, Briefcase, Building } from 'lucide-react';
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
  return (
    <>
      <Link href={href} passHref>
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
    </>
  );
};


export default function Home() {
  const [residentCount, setResidentCount] = useState(15);
  const [activeCasesCount, setActiveCasesCount] = useState(3);
  const [pendingClearancesCount, setPendingClearancesCount] = useState(0);
  const [pendingPermitsCount, setPendingPermitsCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    // Listener for pending certificates/transactions
    const certificatesQuery = query(collection(db, 'transactions'), where('status', '==', 'PENDING'));
    const unsubscribeCertificates = onSnapshot(certificatesQuery, (snapshot) => {
        setPendingClearancesCount(snapshot.size);
    }, (error) => {
        console.error("Error fetching pending clearances:", error);
    });

    // Listener for pending business permits
    const permitsQuery = query(collection(db, 'business_permits'), where('status', '==', 'Pending Renewal'));
     const unsubscribePermits = onSnapshot(permitsQuery, (snapshot) => {
        setPendingPermitsCount(snapshot.size);
    }, (error) => {
        console.error("Error fetching pending permits:", error);
    });


    return () => {
      unsubscribeCertificates();
      unsubscribePermits();
    };
  }, [toast]);

  return (
    <div className="space-y-8 pb-24">
        <section>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard 
                    title="Total Population"
                    value={"15"}
                    label="Registered Residents"
                    icon={Users}
                />
                 <StatCard 
                    title="Pending Clearances"
                    value={"3"}
                    label="Action Required"
                    icon={FileClock}
                    variant="warning"
                />
                 <StatCard 
                    title="Active Cases"
                    value={"3"}
                    label="Blotter Log"
                    icon={Scale}
                />
            </div>
        </section>

        <section>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <QuickActionCard 
                  title="Business Permits"
                  description={`Renewals Pending: ${pendingPermitsCount}`}
                  icon={Building}
                  href="/permits?action=new"
                  actionText="+ NEW PERMIT"
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

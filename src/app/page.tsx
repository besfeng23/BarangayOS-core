
'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import {
  Users,
  FileClock,
  Scale,
  Plus,
  Edit,
  FileText,
  Briefcase,
  Building,
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useQueueCount } from '@/hooks/useQueueCount';
import DraftBanner from '@/components/app-hub/DraftBanner';
import ModuleCard from '@/components/app-hub/ModuleCard';
import { PartnerTileGuard } from "@/components/dashboard/PartnerTileGuard";
import { TrialBanner } from "@/components/system/TrialBanner";

export default function Home() {
  const [activeBlotterCount, setActiveBlotterCount] = useState(0);
  const [pendingPermitsCount, setPendingPermitsCount] = useState(0);
  const { toast } = useToast();
  const pendingBlotterWrites = useQueueCount('blotter_cases');
  const pendingPermitWrites = useQueueCount('business_permits');
  const trialVisible = true; // Replace with real flag

  useEffect(() => {
    // Listener for active blotter cases
    const blotterQuery = query(
      collection(db, 'blotter_cases'),
      where('status', '==', 'ACTIVE')
    );
    const unsubscribeBlotter = onSnapshot(
      blotterQuery,
      (snapshot) => {
        setActiveBlotterCount(snapshot.size);
      },
      (error) => {
        console.error('Error fetching active blotter cases:', error);
      }
    );

    // Listener for pending business permits
    const permitsQuery = query(
      collection(db, 'business_permits'),
      where('status', '==', 'Pending Renewal')
    );
    const unsubscribePermits = onSnapshot(
      permitsQuery,
      (snapshot) => {
        setPendingPermitsCount(snapshot.size);
      },
      (error) => {
        console.error('Error fetching pending permits:', error);
      }
    );

    return () => {
      unsubscribeBlotter();
      unsubscribePermits();
    };
  }, [toast]);

  const totalBlotterBadge = activeBlotterCount + pendingBlotterWrites;
  const totalPermitBadge = pendingPermitsCount + pendingPermitWrites;

  return (
    <div className="space-y-4 pb-24">
      <DraftBanner />

      <main className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 px-3 py-4">
        <ModuleCard
          title="Residents"
          description="View, add, or manage resident records"
          icon={Users}
          href="/residents"
        />
        <ModuleCard
          title="Certificates"
          description="Issue official barangay documents"
          icon={FileText}
          href="/certificates?action=focus"
        />
        <ModuleCard
          title="Blotter"
          description="Log and manage community disputes"
          icon={Scale}
          href="/blotter"
          badgeCount={totalBlotterBadge}
          badgeLabel="Active"
          badgeColor="amber"
        />
        <ModuleCard
          title="Business Permits"
          description="Register or renew business permits"
          icon={Building}
          href="/permits?action=new"
          badgeCount={totalPermitBadge}
          badgeLabel="Renewals"
          badgeColor="red"
        />

        <PartnerTileGuard
          label="Request Activation"
          onBlocked={() => toast({title: "This module requires activation."})}
        >
          <ModuleCard
            title="Digital Payments"
            description="eMango Wallet Integration"
            icon={Briefcase}
            href="/emango"
          />
        </PartnerTileGuard>
        
        <PartnerTileGuard
          label="Request Activation"
          onBlocked={() => toast({title: "This module requires activation."})}
        >
          <ModuleCard
            title="Health"
            description="City Health EMR Integration"
            icon={FileText}
            href="/city-health"
          />
        </PartnerTileGuard>
      </main>

      <TrialBanner visible={trialVisible} message="Activation required to unlock partner integrations" />
    </div>
  );
}

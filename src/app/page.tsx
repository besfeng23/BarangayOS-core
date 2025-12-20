
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
  Shield,
  HeartPulse,
  Wallet,
  AppWindow,
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useQueueCount } from '@/hooks/useQueueCount';
import DraftBanner from '@/components/app-hub/DraftBanner';
import ModuleCard from '@/components/app-hub/ModuleCard';
import { PartnerTileGuard } from "@/components/dashboard/PartnerTileGuard";
import { TrialBanner } from "@/components/system/TrialBanner";
import { useSettings } from '@/lib/bos/settings/useSettings';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [activeBlotterCount, setActiveBlotterCount] = useState(0);
  const [pendingPermitsCount, setPendingPermitsCount] = useState(0);
  const { toast } = useToast();
  const { settings, loading: settingsLoading } = useSettings();
  const pendingBlotterWrites = useQueueCount('blotter_cases');
  const pendingPermitWrites = useQueueCount('business_permits');
  
  const trialBannerVisible = !settings.trialEnabled;

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
  
  if (settingsLoading) {
      return <div>Loading...</div>
  }

  return (
    <div className="space-y-4 p-4">
      <DraftBanner />
      
       <header className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-slate-200">
          At-a-glance overview of barangay operations.
        </p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <ModuleCard
          title="Blotter"
          description="Active Cases"
          icon={Scale}
          href="/blotter"
          badgeCount={totalBlotterBadge}
          badgeColor="amber"
        />
         <ModuleCard
          title="Business Permits"
          description="For Renewal"
          icon={Building}
          href="/permits"
          badgeCount={totalPermitBadge}
          badgeColor="red"
        />
        <ModuleCard
            title="All Apps"
            description="View all installed & available modules"
            icon={AppWindow}
            href="/apps"
        />
      </div>

      <TrialBanner visible={trialBannerVisible} message="Activation required to unlock partner integrations" />
    </div>
  );
}


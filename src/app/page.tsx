
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
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useQueueCount } from '@/hooks/useQueueCount';
import DraftBanner from '@/components/app-hub/DraftBanner';
import ModuleCard from '@/components/app-hub/ModuleCard';
import { PartnerTileGuard } from "@/components/dashboard/PartnerTileGuard";
import { TrialBanner } from "@/components/system/TrialBanner";
import { useSettings } from '@/lib/bos/settings/useSettings';

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
         <ModuleCard
          title="Security"
          description="Manage security devices and incidents"
          icon={Shield}
          href="/security"
        />
         <ModuleCard
          title="Health"
          description="City Health EMR Integration"
          icon={HeartPulse}
          href="/city-health"
        />
        <ModuleCard
          title="Add-ons & Procurement"
          description="View and request hardware add-ons"
          icon={Briefcase}
          href="/addons"
        />

        <PartnerTileGuard
          label="Request Activation"
          onBlocked={() => toast({title: "This module requires activation."})}
        >
          <ModuleCard
            title="Digital Payments"
            description="eMango Wallet Integration"
            icon={Wallet}
            href="/emango"
          />
        </PartnerTileGuard>
        
      </main>

      <TrialBanner visible={trialBannerVisible} message="Activation required to unlock partner integrations" />
    </div>
  );
}

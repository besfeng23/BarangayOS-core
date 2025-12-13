"use client";

import { useState } from 'react';
import type { AppData, UserRole } from '@/types';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/icons';
import { Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface AppCardProps {
  app: AppData;
}

// This would typically come from an auth context
const MOCK_CURRENT_USER_ROLE: UserRole = 'staff'; 

const getAppUrl = (appName: string): string => {
    switch (appName) {
      case 'Blotter Log':
        return '/blotter';
      case 'Resident Records':
        return '/residents';
      case 'Certificates':
        return '/certificates';
      case 'Business Permits':
        return '/permits';
      case 'Announcements':
        return '/announcements';
      case "Captain's Dashboard":
        return '/dashboard';
      case 'eMango Wallet':
        return '/emango';
      case 'City Health':
        return '/city-health';
      case 'Health EMR':
        return '/health-emr';
      case 'Jobs Portal':
        return '/jobs';
      case 'Dispatcher':
        return '/dispatcher';
      case 'Clinic Queue':
        return '/clinic-queue';
      case 'Financials':
        return '/financials';
      default:
        return '#'; // Return a non-navigable link for unhandled cases
    }
  };

export default function AppCard({ app }: AppCardProps) {
  const { toast } = useToast();
  const [currentStatus, setCurrentStatus] = useState(app.status);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isActivated, setIsActivated] = useState(app.isActivated);


  const isRoleAllowed = !app.requiredRole || app.requiredRole.toLowerCase() === MOCK_CURRENT_USER_ROLE.toLowerCase();


  const handleGetClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation
    if (currentStatus === 'get') {
      setIsInstalling(true);
      setTimeout(() => {
        setCurrentStatus('open');
        setIsInstalling(false);
      }, 2000);
    }
  };
  
  const handleActivateClick = (e: React.MouseEvent) => {
    e.preventDefault();
    toast({ title: "Activating...", description: `${app.name} is being set up.` });
    setTimeout(() => {
        setIsActivated(true);
        toast({ title: "Activation Complete", description: `${app.name} is now ready to use.` });
    }, 2000);
  };


  const renderAction = () => {
    if (!isRoleAllowed && app.requiredRole) {
       return <Badge variant="destructive" className="font-normal">{app.requiredRole} Only</Badge>
    }

    if (isInstalling) {
      return (
        <Button size="sm" className="font-semibold" disabled>
          Installing...
        </Button>
      );
    }
    
    if (app.name === 'eMango Wallet') {
        if (!isActivated) {
            return (
                <Button size="sm" className="font-semibold" onClick={handleActivateClick}>
                  ACTIVATE
                </Button>
            );
        }
        return (
            <Link href={getAppUrl(app.name)} passHref>
                <Button asChild size="sm" variant="outline" className="font-semibold">
                   <a>OPEN</a>
                </Button>
            </Link>
        )
    }

    if (currentStatus === 'get') {
      return (
        <Button size="sm" className="font-semibold" onClick={handleGetClick}>
          GET
        </Button>
      );
    }
    if (currentStatus === 'open') {
        const href = getAppUrl(app.name);
        if (href !== '#') {
            return (
                <Link href={href} passHref>
                    <Button asChild size="sm" variant="outline" className="font-semibold">
                       <a>OPEN</a>
                    </Button>
                </Link>
            );
        }
      return (
        <Button size="sm" variant="outline" className="font-semibold">
          OPEN
        </Button>
      );
    }
    return null;
  };

  const CardWrapper = ({ children }: { children: React.ReactNode }) => {
    if (!isRoleAllowed) {
        return <div className="h-full w-full opacity-50 cursor-not-allowed">{children}</div>;
    }

    const href = getAppUrl(app.name);
    
    // Allow navigation if role is allowed and it's either a core app or an "open" status app with a valid URL
    if (app.category === 'core' || (currentStatus === 'open' && href !== '#')) {
      // Special case for unactivated partner apps
      if(app.category === 'partner' && !isActivated) {
          return <div className="h-full w-full">{children}</div>
      }
      return <Link href={href} passHref><div className="h-full w-full">{children}</div></Link>;
    }
    return <>{children}</>;
  }

  return (
    <Card
      className={cn(
        'group relative w-full h-full text-center transition-all duration-300 ease-in-out',
        isRoleAllowed ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1' : 'cursor-not-allowed'
      )}
    >
      <CardWrapper>
        <CardContent className="flex flex-col items-center justify-between p-4 aspect-square">
          {app.badge.visible && (
            <Badge
              variant={app.badge.count && app.badge.count > 0 ? 'destructive' : 'secondary'}
              className="absolute top-2 right-2 tabular-nums"
            >
              {app.badge.count !== undefined && app.badge.count > 0 ? app.badge.count : app.badge.label}
            </Badge>
          )}
          <div className="flex-grow flex flex-col items-center justify-center">
            <Icon name={app.icon} className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
          </div>
          <div className="w-full">
            <p className="font-semibold text-sm truncate text-foreground">{app.name}</p>
            <div className="h-9 mt-2 flex items-center justify-center">
              {renderAction()}
            </div>
          </div>
        </CardContent>
      </CardWrapper>
    </Card>
  );
}

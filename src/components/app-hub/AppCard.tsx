
"use client";

import { useState } from 'react';
import type { AppData, UserRole } from '@/types';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface AppCardProps {
  app: AppData;
}

// This would typically come from an auth context
const MOCK_CURRENT_USER_ROLE: UserRole = 'SUPER_ADMIN'; 

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


  const isRoleAllowed = () => {
    if (MOCK_CURRENT_USER_ROLE === 'SUPER_ADMIN') return true;
    if (!app.requiredRole) return true;
    
    const userRoleLower = MOCK_CURRENT_USER_ROLE.toLowerCase();

    if (Array.isArray(app.requiredRole)) {
      return app.requiredRole.some(role => role.toLowerCase() === userRoleLower);
    }
    return app.requiredRole.toLowerCase() === userRoleLower;
  };

  const hasAccess = isRoleAllowed();

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
    if (MOCK_CURRENT_USER_ROLE !== 'Captain' && MOCK_CURRENT_USER_ROLE !== 'Secretary' && MOCK_CURRENT_USER_ROLE !== 'SUPER_ADMIN') {
         toast({
            variant: 'destructive',
            title: 'Permission Denied',
            description: `Only a Captain or Secretary can activate partner services.`
        })
        return;
    }
    toast({ title: "Activating...", description: `${app.name} is being set up.` });
    setTimeout(() => {
        setIsActivated(true);
        toast({ title: "Activation Complete", description: `${app.name} is now ready to use.` });
    }, 2000);
  };


  const renderAction = () => {
    if (!hasAccess) {
       const roleText = Array.isArray(app.requiredRole) ? app.requiredRole.join('/') : app.requiredRole;
       return <Badge variant="outline" className="border-red-500/50 bg-transparent font-normal text-red-500">{roleText} Only</Badge>
    }

    if (isInstalling) {
      return (
        <Button size="sm" className="font-semibold" disabled>
          Installing...
        </Button>
      );
    }
    
    if (app.category === 'partner') {
        if (!isActivated) {
             const canActivate = MOCK_CURRENT_USER_ROLE === 'Captain' || MOCK_CURRENT_USER_ROLE === 'Secretary' || MOCK_CURRENT_USER_ROLE === 'SUPER_ADMIN';
            if (canActivate) {
                return (
                    <Button size="sm" className="font-semibold" onClick={handleActivateClick}>
                      ACTIVATE
                    </Button>
                );
            }
            return <Badge variant="secondary" className="font-normal">Inactive</Badge>;
        }
    }

    if (currentStatus === 'get') {
      return (
        <Button size="sm" className="font-semibold" onClick={handleGetClick}>
          GET
        </Button>
      );
    }
    
    const href = getAppUrl(app.name);
    if (currentStatus === 'open' && href !== '#') {
        return (
            <Button asChild size="sm" variant="outline" className="font-semibold">
               <Link href={href}>OPEN</Link>
            </Button>
        );
    }
    
    return null;
  };
  
  const CardWrapper = ({children}: {children: React.ReactNode}) => {
    const href = getAppUrl(app.name);
    if (hasAccess && currentStatus === 'open' && href !== '#') {
        return <Link href={href} passHref><div className="h-full w-full">{children}</div></Link>;
    }
    return <>{children}</>;
  }


  return (
    <Card
      className={cn(
        'group relative w-full h-full text-center transition-all duration-300 ease-in-out',
        hasAccess ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1' : 'cursor-not-allowed opacity-60'
      )}
      onClick={(e) => {
        if (!hasAccess) {
            e.preventDefault();
            toast({
                variant: 'destructive',
                title: 'Access Denied',
                description: `You need the '${Array.isArray(app.requiredRole) ? app.requiredRole.join('/') : app.requiredRole}' role to use this module.`
            })
        }
      }}
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

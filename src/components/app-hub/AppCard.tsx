"use client";

import { useState } from 'react';
import type { AppData } from '@/types';
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
      default:
        return '#'; // Return a non-navigable link for unhandled cases
    }
  };

export default function AppCard({ app }: AppCardProps) {
  const { toast } = useToast();
  const [currentStatus, setCurrentStatus] = useState(app.status);
  const [isInstalling, setIsInstalling] = useState(false);

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

  const renderAction = () => {
    if (app.isLocked) {
      return <Lock className="w-4 h-4 text-muted-foreground" />;
    }

    if (isInstalling) {
      return (
        <Button size="sm" className="font-semibold" disabled>
          Installing...
        </Button>
      );
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
    const href = getAppUrl(app.name);
    if (app.category === 'core') {
      return <Link href={href} passHref><div className="h-full w-full">{children}</div></Link>;
    }
    return <>{children}</>;
  }

  return (
    <Card
      className={cn(
        'group relative w-full h-full cursor-pointer overflow-hidden text-center transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1',
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

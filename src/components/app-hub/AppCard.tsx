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

interface AppCardProps {
  app: AppData;
}

export default function AppCard({ app }: AppCardProps) {
  const [isShaking, setIsShaking] = useState(false);
  const { toast } = useToast();

  const handleLockedClick = () => {
    if (app.isLocked) {
      setIsShaking(true);
      toast({
        title: 'Service Locked',
        description: `${app.name} is a core service and cannot be modified.`,
      });
      setTimeout(() => setIsShaking(false), 820);
    }
  };

  const renderAction = () => {
    if (app.isLocked) {
      return <Lock className="w-4 h-4 text-muted-foreground" />;
    }
    if (app.status === 'get') {
      return (
        <Button size="sm" className="font-semibold">
          GET
        </Button>
      );
    }
    if (app.status === 'open') {
      return (
        <Button size="sm" variant="outline" className="font-semibold">
          OPEN
        </Button>
      );
    }
    return null;
  };

  return (
    <Card
      className={cn(
        'group relative w-full h-full cursor-pointer overflow-hidden text-center transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1',
        isShaking && 'animate-shake'
      )}
      onClick={handleLockedClick}
    >
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
    </Card>
  );
}

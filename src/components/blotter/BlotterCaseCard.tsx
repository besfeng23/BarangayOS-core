
'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type BlotterStatus = 'Pending' | 'Resolved' | 'Escalated';

interface BlotterCaseCardProps {
  caseNumber: string;
  complainant: string;
  respondent: string;
  type: string;
  status: BlotterStatus;
  date: string;
  isOffline?: boolean;
  onSelect: () => void;
}

const statusStyles = {
  container: {
    Pending: 'border-yellow-500',
    Resolved: 'border-green-500',
    Escalated: 'border-red-500',
  },
  badge: {
    Pending: 'bg-yellow-900/30 text-yellow-500 hover:bg-yellow-900/50',
    Resolved: 'bg-green-900/30 text-green-500 hover:bg-green-900/50',
    Escalated: 'bg-red-900/30 text-red-500 hover:bg-red-900/50',
  },
};

const BlotterCaseCard: React.FC<BlotterCaseCardProps> = ({
  caseNumber,
  complainant,
  respondent,
  type,
  status,
  date,
  isOffline,
  onSelect,
}) => {
  return (
    <div
      onClick={onSelect}
      className={cn(
        'w-full bg-slate-800 rounded-r-lg border-l-4 cursor-pointer transition-all hover:bg-slate-700/50 shadow-md',
        statusStyles.container[status]
      )}
    >
      {/* Header */}
      <div className="flex justify-between items-center px-4 pt-3 pb-1">
        <span className="text-xs font-mono text-slate-400">{caseNumber}</span>
        <span className="text-xs text-slate-500">{date}</span>
      </div>

      {/* Content */}
      <div className="px-4 pb-4">
        <h3 className="text-sm font-medium uppercase tracking-wide text-blue-400">
          {type}
        </h3>
        <p className="text-white font-bold text-lg truncate flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-400 flex-shrink-0" />
            {complainant} vs {respondent}
        </p>

        {/* Footer */}
        <div className="flex items-center gap-3 mt-3">
          <Badge className={cn('text-xs font-bold', statusStyles.badge[status])}>
            {status}
          </Badge>
          {isOffline && (
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500"></span>
              <span className="text-xs text-amber-500">Unsynced</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlotterCaseCard;

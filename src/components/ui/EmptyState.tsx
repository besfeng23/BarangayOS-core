
'use client';

import React from 'react';
import { FolderOpen, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  type: 'no-data' | 'no-results';
  query?: string;
  onAction: () => void;
}

const config = {
  'no-data': {
    Icon: () => <FolderOpen className="h-10 w-10 text-blue-500" />,
    title: 'No Resident Records',
    body: 'The resident database is currently empty. Add a profile to get started.',
    buttonText: '+ Add New Resident',
    buttonVariant: 'default' as const,
  },
  'no-results': {
    Icon: () => <SearchX className="h-10 w-10 text-slate-400" />,
    title: 'No Match Found',
    body: (query?: string) => `We couldn't find any resident matching "${query || ''}". Check the spelling.`,
    buttonText: 'Clear Search',
    buttonVariant: 'secondary' as const,
  },
};

export const EmptyState: React.FC<EmptyStateProps> = ({ type, query, onAction }) => {
  const { Icon, title, body, buttonText, buttonVariant } = config[type];

  const bodyText = typeof body === 'function' ? body(query) : body;

  return (
    <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-700 bg-slate-900/50 rounded-xl">
      <div className="flex items-center justify-center bg-slate-800 p-4 rounded-full ring-1 ring-slate-700 mb-6">
        <Icon />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-center max-w-sm mb-6">{bodyText}</p>
      <Button onClick={onAction} variant={buttonVariant}>
        {buttonText}
      </Button>
    </div>
  );
};

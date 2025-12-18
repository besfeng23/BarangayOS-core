
'use client';

import React from 'react';
import { FolderOpen, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  type: 'no-data' | 'no-results';
  query?: string;
  onAction?: () => void;
  actionText?: string;
  title?: string;
  body?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ type, query, onAction, actionText, title, body }) => {
  const config = {
    'no-data': {
      Icon: () => <FolderOpen className="h-10 w-10 text-blue-500" />,
      title: title || 'Walang records pa.',
      body: body || 'Create your first entry — saved even offline.',
      buttonText: actionText || '+ Add New Record',
      buttonVariant: 'default' as const,
    },
    'no-results': {
      Icon: () => <SearchX className="h-10 w-10 text-slate-400" />,
      title: title || 'No Match Found',
      body: (q?: string) => body || `We couldn't find any record matching "${q || ''}". Check the spelling.`,
      buttonText: actionText || 'Clear Search',
      buttonVariant: 'secondary' as const,
    },
  };

  const { Icon, title: defaultTitle, body: defaultBody, buttonText, buttonVariant } = config[type];
  const bodyContent = typeof defaultBody === 'function' ? defaultBody(query) : defaultBody;

  return (
    <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-zinc-800 bg-zinc-900/40 rounded-2xl">
      <div className="flex items-center justify-center bg-zinc-800 p-4 rounded-full ring-1 ring-zinc-700 mb-6">
        <Icon />
      </div>
      <h3 className="text-xl font-bold text-zinc-100 mb-2">{defaultTitle}</h3>
      <p className="text-zinc-400 text-center max-w-sm mb-6">{bodyContent}</p>
      {onAction && <Button onClick={onAction} variant={buttonVariant}>
        {buttonText}
      </Button>}
    </div>
  );
};

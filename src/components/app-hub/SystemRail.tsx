'use client';

import { useAuth } from '@/hooks/use-auth';
import { Search } from 'lucide-react';
import GlobalSearch from './search/GlobalSearch';
import SyncStatusIndicator from './SyncStatusIndicator';

function getRolePill(role: string | null | undefined): string {
  if (!role) return 'Staff Mode';
  // Simple mapping for demo purposes
  switch (role.toLowerCase()) {
    case 'super_admin':
    case 'barangay_captain':
    case 'admin':
      return 'Admin Mode';
    case 'secretary':
      return 'Secretary Mode';
    default:
      return 'Staff Mode';
  }
}

export default function SystemRail() {
  const { user } = useAuth();
  // In a real app, user.customClaims.role would be ideal
  const userRole = getRolePill(user?.email); 

  return (
    <header className="fixed top-0 left-0 right-0 h-14 z-30 backdrop-blur border-b border-zinc-700/60 bg-zinc-950/70">
      <div className="px-3 h-full flex items-center gap-4">
        {/* Left: Branding & Role */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-sm font-semibold text-zinc-100">
            BarangayOS
          </span>
          <span className="text-xs bg-zinc-800 text-zinc-200 px-2 py-1 rounded-full border border-zinc-700">
            {userRole}
          </span>
        </div>

        {/* Center: Global Search */}
        <div className="flex-1 flex justify-center">
          <GlobalSearch />
        </div>

        {/* Right: Sync Status */}
        <div className="flex items-center justify-end flex-shrink-0">
          <SyncStatusIndicator />
        </div>
      </div>
    </header>
  );
}

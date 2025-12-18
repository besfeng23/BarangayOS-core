
import React from "react";
import { StatusIndicator } from "@/components/shell/StatusIndicator";
import { SettingsDropdown } from "@/components/shell/SettingsDropdown";
import { useAuth } from "@/hooks/use-auth";
import GlobalSearch from "../app-hub/search/GlobalSearch";

function getRolePill(role: string | null | undefined): string {
  if (!role) return "Staff Mode";
  switch (role.toLowerCase()) {
    case "super_admin":
    case "barangay_captain":
    case "admin":
      return "Admin Mode";
    case "secretary":
      return "Secretary Mode";
    default:
      return "Staff Mode";
  }
}

export default function SystemRail() {
  const { user } = useAuth();
  const userRole = getRolePill(user?.email); // Placeholder until roles are in claims

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-zinc-900/80 backdrop-blur-lg border-b border-zinc-800">
      <div className="h-full max-w-7xl mx-auto px-4 flex items-center gap-3">
        <span className="font-bold text-zinc-100 text-lg">BarangayOS</span>
        <span className="text-xs bg-zinc-800 text-zinc-200 px-2 py-1 rounded-full border border-zinc-700">
          {userRole}
        </span>
        
        <div className="flex-1 flex justify-center px-4">
            <GlobalSearch />
        </div>

        <StatusIndicator />
        <SettingsDropdown />
      </div>
    </header>
  );
}

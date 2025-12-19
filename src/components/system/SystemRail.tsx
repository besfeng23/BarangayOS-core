
import React from "react";
import { useAuth } from "@/hooks/use-auth";
import GlobalSearch from "../app-hub/search/GlobalSearch";
import { StatusIndicator } from "../shell/StatusIndicator";
import { useSettings } from "@/lib/bos/settings/useSettings";


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
  const { settings } = useSettings();
  const userRole = getRolePill(user?.email); // Placeholder until roles are in claims

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-zinc-900/80 backdrop-blur-lg border-b border-zinc-800">
      <div className="h-full max-w-7xl mx-auto px-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 rounded-xl border border-zinc-800 bg-zinc-900/40 flex items-center justify-center">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-zinc-100"
              aria-hidden="true"
            >
              {/* shield */}
              <path
                d="M12 2.5L20 5.5V12.2C20 17.1 16.8 20.7 12 22C7.2 20.7 4 17.1 4 12.2V5.5L12 2.5Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              {/* sun core */}
              <circle
                cx="12"
                cy="12"
                r="3"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              {/* rays (simple, symmetric) */}
              <path d="M12 6.8V8.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              <path d="M12 15.7V17.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              <path d="M6.8 12H8.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              <path d="M15.7 12H17.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />

              <path d="M8.3 8.3L9.4 9.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              <path d="M14.6 14.6L15.7 15.7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              <path d="M15.7 8.3L14.6 9.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              <path d="M9.4 14.6L8.3 15.7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </div>

          <div className="hidden sm:block leading-none min-w-0">
            <div className="text-zinc-100 font-semibold truncate">BarangayOS</div>
            <div className="text-[10px] tracking-widest uppercase text-zinc-400 truncate">
              BARANGAY • TERMINAL
            </div>
          </div>
        </div>

        <div className="flex-1 flex justify-center px-4">
          <GlobalSearch />
        </div>

        <div className="flex items-center gap-2">
            {settings.trialEnabled && (
                <div className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full px-2 py-1">
                    Trial • {settings.trialDaysRemaining} days
                </div>
            )}
            <StatusIndicator />
        </div>

      </div>
    </header>
  );
}

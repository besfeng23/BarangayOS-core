
import React from "react";
import { useAuth } from "@/hooks/use-auth";
import GlobalSearch from "../app-hub/search/GlobalSearch";
import { StatusIndicator } from "../shell/StatusIndicator";

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
      <div className="h-full max-w-7xl mx-auto px-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-auto rounded-xl border border-zinc-800 bg-zinc-900/40 px-2 flex items-center">
            <img
              src="/boss.png"
              alt="BarangayOS"
              className="h-6 md:h-7 w-auto object-contain select-none"
              draggable={false}
            />
          </div>

          <div className="hidden sm:block leading-none min-w-0">
            <div className="text-zinc-100 font-semibold truncate">BarangayOS</div>
            <div className="text-[10px] tracking-widest uppercase text-zinc-400 truncate">
              GovTech Terminal
            </div>
          </div>
        </div>

        <div className="flex-1 flex justify-center px-4">
          <GlobalSearch />
        </div>

        <StatusIndicator />
      </div>
    </header>
  );
}

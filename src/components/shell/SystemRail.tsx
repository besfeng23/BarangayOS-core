import React, { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

function titleFromPath(pathname: string) {
  if (pathname.startsWith("/residents/new")) return "Register Resident";
  if (pathname.startsWith("/residents/")) return "Resident Profile";
  if (pathname.startsWith("/residents")) return "Residents";
  if (pathname.startsWith("/blotter")) return "Blotter";
  if (pathname.startsWith("/certificates")) return "Certificates";
  if (pathname.startsWith("/permits")) return "Business Permits";
  return "Dashboard";
}

export default function SystemRail() {
  const router = useRouter();
  const pathname = usePathname();
  const isOnline = useOnlineStatus();

  const title = useMemo(() => titleFromPath(pathname), [pathname]);

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-zinc-950/95 backdrop-blur border-b border-zinc-800">
      <div className="max-w-6xl mx-auto px-3 h-16 flex items-center gap-3">
        {/* Home */}
        <button
          onClick={() => router.push("/")}
          className="min-h-[48px] min-w-[48px] rounded-2xl bg-zinc-900 border border-zinc-800
            text-zinc-100 font-black flex items-center justify-center
            focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
          aria-label="Back to Home"
        >
          B
        </button>

        {/* Title */}
        <div className="min-w-0">
          <div className="text-zinc-100 font-semibold leading-tight truncate">{title}</div>
          <div className="text-zinc-500 text-xs leading-tight truncate">BarangayOS</div>
        </div>

        <div className="flex-1" />

        {/* Status Badge */}
        {isOnline ? (
          <div
            className="px-3 py-2 rounded-full text-xs font-semibold text-emerald-400"
            aria-label="Synced"
          >
            🟢 Synced
          </div>
        ) : (
          <div
            className="px-3 py-2 rounded-full text-xs font-semibold bg-zinc-900 border border-zinc-800 text-amber-300"
            aria-label="Offline"
          >
            🟡 Offline
          </div>
        )}

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((s) => !s)}
            className="min-h-[48px] min-w-[48px] rounded-2xl bg-zinc-900 border border-zinc-800
              text-zinc-300 font-semibold flex items-center justify-center
              focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
            aria-label="Profile menu"
          >
            JS
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl shadow-black overflow-hidden z-50"
              role="menu"
            >
              <div className="px-4 py-3 text-xs text-zinc-500 uppercase">Account</div>
              <button
                className="w-full text-left px-4 py-3 text-zinc-100 hover:bg-zinc-800/50
                  focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
                onClick={() => {
                  setMenuOpen(false);
                  router.push("/settings");
                }}
                role="menuitem"
              >
                Settings
              </button>
              <button
                className="w-full text-left px-4 py-3 text-zinc-100 hover:bg-zinc-800/50
                  focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
                onClick={() => {
                  setMenuOpen(false);
                  alert("Logout (wire later)");
                }}
                role="menuitem"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

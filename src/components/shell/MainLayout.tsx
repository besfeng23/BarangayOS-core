import React, { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useFirebaseConnected } from "@/hooks/useFirebaseConnected";
import { StatusIndicator } from "@/components/shell/StatusIndicator";
import { SettingsDropdown } from "@/components/shell/SettingsDropdown";
import { TrialBanner } from "@/components/shell/TrialBanner";

function getContext(pathname: string): { title: string; showTitle: boolean; backTo?: string } {
  if (pathname === "/" || pathname.startsWith("/dashboard")) return { title: "", showTitle: false };
  if (pathname.startsWith("/residents/new")) return { title: "Register Resident", showTitle: true, backTo: "/residents" };
  if (pathname.startsWith("/residents/")) return { title: "Resident Profile", showTitle: true, backTo: "/residents" };
  if (pathname.startsWith("/residents")) return { title: "Residents", showTitle: true, backTo: "/" };

  if (pathname.startsWith("/blotter")) return { title: "Blotter", showTitle: true, backTo: "/" };
  if (pathname.startsWith("/certificates")) return { title: "Certificates", showTitle: true, backTo: "/" };
  if (pathname.startsWith("/permits")) return { title: "Business Permits", showTitle: true, backTo: "/" };

  return { title: "Module", showTitle: true, backTo: "/" };
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isOnline = useOnlineStatus();
  const firebaseConnected = useFirebaseConnected();

  // v1 placeholder: set true only if sync queue reports failed
  const [syncFailed, setSyncFailed] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);
  const [staffMode, setStaffMode] = useState(false);

  const ctx = useMemo(() => getContext(pathname), [pathname]);

  function retrySync() {
    // v1 placeholder: wire to real syncQueue retry
    setSyncFailed(false);
    alert("Retry sync (wire to syncQueue)");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Fixed Header */}
      <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-3 h-16 flex items-center gap-3">
          {/* Home */}
          <button
            onClick={() => router.push("/")}
            className="min-h-[48px] min-w-[48px] rounded-2xl bg-slate-950 border border-slate-800
              text-slate-100 font-black flex items-center justify-center
              focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-900"
            aria-label="Home"
          >
            B
          </button>

          {/* Context Title + explicit back arrow */}
          {ctx.showTitle && (
            <div className="min-w-0 flex items-center gap-2">
              {ctx.backTo && (
                <button
                  onClick={() => router.push(ctx.backTo!)}
                  className="min-h-[40px] px-3 rounded-2xl text-slate-300 hover:bg-slate-800/50
                    focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-900"
                  aria-label="Back to parent view"
                >
                  ← Back
                </button>
              )}
              <div className="text-slate-100 font-semibold truncate">{ctx.title}</div>
            </div>
          )}

          <div className="flex-1" />

          <StatusIndicator
            isOnline={isOnline}
            firebaseConnected={firebaseConnected}
            syncFailed={syncFailed}
            onRetrySync={retrySync}
          />

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen((s) => !s)}
              className="min-h-[48px] min-w-[48px] rounded-full bg-slate-950 border border-slate-800
                text-slate-200 font-bold flex items-center justify-center
                focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-900"
              aria-label="Open settings"
            >
              JS
            </button>

            <SettingsDropdown
              open={menuOpen}
              onClose={() => setMenuOpen(false)}
              staffMode={staffMode}
              setStaffMode={setStaffMode}
            />
          </div>
        </div>
      </header>

      {/* Scrollable content area */}
      <div className="relative z-0">
        {children}
      </div>

      {/* Fixed Trial Footer */}
      <TrialBanner />
    </div>
  );
}

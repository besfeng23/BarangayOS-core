import React from "react";
import { useLocation, useNavigate } from "next/navigation";
import { StatusIndicator } from "@/components/shell/StatusIndicator";
import { TrialBanner } from "@/components/shell/TrialBanner";
import { SettingsDropdown } from "@/components/shell/SettingsDropdown";
import { usePathname } from "next/navigation";

function titleFromPath(pathname: string): string | null {
  if (pathname === "/" || pathname.startsWith("/dashboard")) return null;
  if (pathname.startsWith("/residents")) return "Residents";
  if (pathname.startsWith("/blotter")) return "Blotter";
  if (pathname.startsWith("/certificates")) return "Certificates";
  if (pathname.startsWith("/settings")) return "Settings";
  return "BarangayOS";
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const title = titleFromPath(pathname);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Unified Header (single row only) */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-zinc-900 border-b border-zinc-800">
        <div className="h-full max-w-6xl mx-auto px-4 flex items-center gap-3">
          {/* Home / Brand */}
          <button
            onClick={() => router.push("/")}
            className="h-12 w-12 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center font-black text-zinc-100
              focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
            aria-label="Back to Dashboard"
            title="Dashboard"
          >
            B
          </button>

          {/* Context Title */}
          {title ? (
            <div className="min-w-0">
              <div className="text-zinc-100 font-semibold truncate">{title}</div>
              <div className="text-zinc-400 text-xs truncate">Offline-first workstation</div>
            </div>
          ) : (
            <div className="min-w-0">
              <div className="text-zinc-100 font-semibold truncate">BarangayOS</div>
              <div className="text-zinc-400 text-xs truncate">Dashboard</div>
            </div>
          )}

          <div className="flex-1" />

          {/* Status */}
          <StatusIndicator />

          {/* Profile */}
          <SettingsDropdown />
        </div>
      </header>

      {/* Content */}
      <main className="pt-16 pb-10">
        {children}
      </main>

      {/* Trial Footer */}
      <TrialBanner />
    </div>
  );
}

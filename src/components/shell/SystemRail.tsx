import * as React from "react";
import { useBlotterData } from "../../useBlotterData";
import { useTerminalUI } from "../../contexts/TerminalUIContext";

export default function SystemRail() {
  const { queueCount } = useBlotterData();
  const { globalSearch, setGlobalSearch } = useTerminalUI();
  const [mobileSearchOpen, setMobileSearchOpen] = React.useState(false);

  return (
    <>
      <header className="shrink-0 h-16 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-4 z-40">
        {/* Left */}
        <div className="flex items-center gap-3 min-w-[160px]">
          <div className="h-8 w-8 bg-zinc-100 rounded-lg flex items-center justify-center text-zinc-950 font-black">
            B
          </div>
          <div className="hidden md:block font-bold text-zinc-100">BarangayOS</div>
          <span className="px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-300">
            STAFF MODE
          </span>
        </div>

        {/* Center: Global Search (desktop/tablet) */}
        <div className="hidden md:flex flex-1 max-w-lg mx-4">
          <div className="relative w-full">
            <input
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              type="text"
              placeholder="Search Resident, ID, or Case #"
              className="w-full h-10 bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-3 text-sm text-zinc-100 focus:border-zinc-600 outline-none placeholder:text-zinc-600"
            />
            <span className="absolute left-3 top-2.5 text-zinc-600">🔍</span>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3 min-w-[160px] justify-end">
          {/* Mobile search button */}
          <button
            type="button"
            onClick={() => setMobileSearchOpen(true)}
            className="md:hidden h-10 w-10 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 active:scale-95 transition-transform"
            aria-label="Open search"
          >
            🔍
          </button>

          <div className="flex items-center gap-2">
            <span
              className={[
                "h-2.5 w-2.5 rounded-full",
                queueCount > 0 ? "bg-amber-400 animate-pulse" : "bg-emerald-500",
              ].join(" ")}
            />
            <span className="text-xs font-bold text-zinc-400">
              {queueCount > 0 ? `${queueCount} queued` : "Synced"}
            </span>
          </div>
          <div className="relative">
            <button
              className="min-h-[48px] min-w-[48px] rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center"
              aria-label="Open profile and settings"
            >
              <div className="h-9 w-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold">
                JS
              </div>
            </button>

            {/* Notification badge positioned OUTSIDE the button’s tap area */}
            <div
              className="absolute -top-2 -right-2"
              aria-hidden="true"
            >
              <div className="h-7 min-w-[28px] px-2 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center border border-red-400 shadow-lg shadow-black">
                3
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Search Overlay */}
      {mobileSearchOpen && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex flex-col">
          <div className="bg-zinc-950 border-b border-zinc-800 p-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileSearchOpen(false)}
              className="h-10 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 font-bold active:scale-95 transition-transform"
            >
              Close
            </button>
            <div className="relative flex-1">
              <input
                autoFocus
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                type="text"
                placeholder="Search Resident, ID, or Case #"
                className="w-full h-10 bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-3 text-sm text-zinc-100 focus:border-zinc-600 outline-none placeholder:text-zinc-600"
              />
              <span className="absolute left-3 top-2.5 text-zinc-600">🔍</span>
            </div>
          </div>

          <div className="flex-1" onClick={() => setMobileSearchOpen(false)} />
        </div>
      )}
    </>
  );
}

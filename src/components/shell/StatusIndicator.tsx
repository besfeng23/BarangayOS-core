import React from "react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useSyncHealth } from "@/hooks/useSyncHealth";

export function StatusIndicator() {
  const online = useOnlineStatus();
  const { state } = useSyncHealth(); // "synced" | "failed" | "syncing"

  // Offline dominates everything
  if (!online) {
    return (
      <div className="h-10 px-3 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
        <span className="text-xs font-semibold text-zinc-100">Offline Mode</span>
      </div>
    );
  }

  if (state === "failed") {
    return (
      <div className="h-10 px-3 rounded-2xl bg-zinc-900 border border-zinc-700 flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <span className="text-xs font-semibold text-zinc-100">Sync Failed</span>
      </div>
    );
  }

  if (state === "syncing") {
    return (
      <div className="h-10 px-3 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-zinc-400" />
        <span className="text-xs font-semibold text-zinc-200">Syncing…</span>
      </div>
    );
  }

  return (
    <div className="h-10 px-3 rounded-2xl bg-transparent border border-zinc-800 flex items-center gap-2">
      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
      <span className="text-xs font-semibold text-zinc-100">Synced</span>
    </div>
  );
}

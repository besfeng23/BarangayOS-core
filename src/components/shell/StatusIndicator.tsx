import React from "react";

type Props = {
  isOnline: boolean;
  firebaseConnected: boolean;
  syncFailed: boolean;
  onRetrySync: () => void;
};

export function StatusIndicator({ isOnline, firebaseConnected, syncFailed, onRetrySync }: Props) {
  // Offline always wins
  if (!isOnline) {
    return (
      <div
        className="px-3 py-2 rounded-full text-xs font-semibold bg-slate-800 border border-slate-700 text-yellow-300"
        aria-label="Offline Mode"
      >
        🟡 Offline Mode
      </div>
    );
  }

  if (isOnline && firebaseConnected && syncFailed) {
    return (
      <button
        onClick={onRetrySync}
        className="px-3 py-2 rounded-full text-xs font-semibold bg-slate-800 border border-slate-700 text-red-300
          focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-900"
        aria-label="Sync Failed. Tap to retry."
      >
        🔴 Sync Failed
      </button>
    );
  }

  // Default "Synced" if online + firebaseConnected and not failed
  return (
    <div className="px-3 py-2 rounded-full text-xs font-semibold text-emerald-300" aria-label="Synced">
      🟢 Synced
    </div>
  );
}

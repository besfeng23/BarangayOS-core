import React from "react";

export function TrialBanner({
  visible,
  message = "TRIAL MODE • Limited access until activation",
}: {
  visible: boolean;
  message?: string;
}) {
  if (!visible) return null;

  return (
    <div
      className="fixed left-0 right-0 z-40 px-4"
      style={{ bottom: 88 }} // sits ABOVE BottomNav (leave BottomNav untouched)
      role="status"
      aria-live="polite"
    >
      <div className="max-w-6xl mx-auto">
        <div className="bg-amber-500/15 border border-amber-500/30 text-amber-200 rounded-2xl px-4 py-3 flex items-center justify-between gap-3 shadow-2xl shadow-black">
          <div className="text-sm font-semibold">Trial Mode</div>
          <div className="text-xs text-amber-200/80">{message}</div>
        </div>
      </div>
    </div>
  );
}

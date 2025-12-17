import React from "react";
import { systemFlags } from "@/lib/systemFlags";

export function TrialBanner() {
  const { isTrialAccount, trialDaysRemaining, supportText } = systemFlags;
  if (!isTrialAccount) return null;

  return (
    <div
      className="fixed left-0 right-0 bottom-0 h-8 z-50 bg-yellow-500 text-black text-xs font-bold
        flex items-center justify-center border-t border-yellow-400"
      role="status"
      aria-live="polite"
    >
      TRIAL MODE: {trialDaysRemaining} Days Remaining. {supportText}
    </div>
  );
}

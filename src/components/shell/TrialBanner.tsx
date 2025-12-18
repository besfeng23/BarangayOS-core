
import React from "react";
import { useSettings } from "@/hooks/useSettings";

export function TrialBanner() {
  const { settings } = useSettings();
  const isTrial = !!settings?.trial?.isTrialAccount;

  if (!isTrial) return null;

  const days = settings?.trial?.daysRemaining ?? 5;

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 h-8 bg-yellow-500 text-black">
      <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-center text-xs font-extrabold">
        TRIAL MODE: {days} Days Remaining. Contact support to activate.
      </div>
    </footer>
  );
}

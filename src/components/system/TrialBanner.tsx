
import React from "react";
import { Button } from "../ui/button";

export function TrialBanner({
  visible,
  message = "TRIAL MODE • Limited access until activation",
  ctaText,
  onCtaClick
}: {
  visible: boolean;
  message?: string;
  ctaText?: string;
  onCtaClick?: () => void;
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
          <div className="text-xs text-amber-200/80 flex-1 text-center">{message}</div>
          {ctaText && onCtaClick && (
            <Button size="sm" className="bg-amber-400 text-black hover:bg-amber-300 font-bold" onClick={onCtaClick}>
              {ctaText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

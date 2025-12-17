import React from "react";

export function PrintFrame({ children }: { children: React.ReactNode }) {
  // Always mounted but invisible on screen; print.css will reveal it.
  return (
    <div aria-hidden="true">
      <div
        id="print-container"
        className="hidden print:block"
      >
        {children}
      </div>
    </div>
  );
}

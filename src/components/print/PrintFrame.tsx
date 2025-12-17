import React from "react";

export function PrintFrame({ children }: { children: React.ReactNode }) {
  return (
    <div id="print-container" className="hidden print:block">
      {children}
    </div>
  );
}

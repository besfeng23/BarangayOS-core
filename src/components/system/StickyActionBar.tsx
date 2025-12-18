"use client";

import React from 'react';

export default function StickyActionBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="sticky bottom-0 bg-zinc-900/80 backdrop-blur-sm border-t border-zinc-800 p-4">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        {children}
      </div>
    </div>
  );
}

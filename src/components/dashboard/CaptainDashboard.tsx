
"use client";

import React from 'react';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';

// Since this component is being replaced by the main page layout,
// we'll leave a placeholder here to avoid breaking any imports that might still exist.
// The actual dashboard logic is now in src/app/page.tsx.

const CaptainDashboard = () => {
    const { toast } = useToast();

    return (
    <div className="bg-slate-950 min-h-screen text-white p-4 sm:p-6 lg:p-8">
        <header className="mb-8">
            <div className="flex justify-between items-start flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-bold">Old Dashboard</h1>
                    <p className="text-slate-400 mt-1">This component is being replaced.</p>
                </div>
                 <Link href="/" passHref>
                    Return to Main Dashboard
                </Link>
            </div>
        </header>
    </div>
  );
};

export default CaptainDashboard;

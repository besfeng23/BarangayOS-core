
'use client';

import React, { useState } from "react";
import { usePrintCenter } from "@/hooks/usePrintCenter";
import { performPrintJob } from "@/lib/bos/print/performPrintJob";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";

const Chip = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`px-4 py-3 text-sm font-semibold rounded-full border transition-colors ${
      active ? "bg-zinc-800 border-zinc-700 text-zinc-100" : "border-transparent text-zinc-400 hover:text-zinc-100"
    }`}
  >
    {label}
  </button>
);

const JobCard = ({ job, onPrint, isPrinting }: { job: any; onPrint: (id: string) => void, isPrinting: boolean }) => {
  const isFailed = job.status === "failed";
  return (
    <div className={`p-4 rounded-2xl border bg-zinc-900/40 ${isFailed ? "border-red-900/50" : "border-zinc-800"}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold text-zinc-100">{job.title}</div>
          <div className="text-sm text-zinc-400 mt-1">{job.subtitle}</div>
          <div className="text-xs text-zinc-500 mt-2">
            {new Date(job.createdAtISO).toLocaleString()} • {job.docType}
          </div>
          {isFailed && <div className="text-xs text-red-400 mt-1">Error: {job.lastError}</div>}
        </div>
        <div className="flex-shrink-0">
          <Button
            onClick={() => onPrint(job.id)}
            variant={isFailed ? "destructive" : "secondary"}
            className="h-12"
            disabled={isPrinting}
          >
            {job.status === "printed" ? "Reprint" : isFailed ? "Try Again" : "Print"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function PrintCenterPage() {
  const { query, setQuery, items, tab, setTab, loading, reload } = usePrintCenter();
  const { toast } = useToast();
  const [printingId, setPrintingId] = useState<string | null>(null);

  const handlePrint = async (id: string) => {
    setPrintingId(id);
    try {
      await performPrintJob(id);
      toast({ title: "Print Success", description: "Document sent to printer." });
      reload(); // Refresh the list to update status
    } catch (e: any) {
      toast({ variant: "destructive", title: "Print Failed", description: e?.message ?? "An error occurred." });
      reload();
    } finally {
      setPrintingId(null);
    }
  };

  const printNext = async () => {
    const nextJob = items.find(job => job.status === 'queued');
    if (nextJob) {
        await handlePrint(nextJob.id);
    } else {
        toast({ title: "No Queued Jobs", description: "There are no new documents waiting to be printed." });
    }
  }

  const hasQueuedJobs = items.some(job => job.status === 'queued');

  return (
    <div className="mx-auto w-full max-w-3xl p-4 md:p-6 space-y-4">
      <div className="mb-4">
        <h1 className="text-zinc-100 text-xl font-semibold">Print Center</h1>
        <p className="text-zinc-400 text-sm mt-1">Queued prints and reprints (offline-safe).</p>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
        <div className="flex items-center border border-zinc-800 bg-zinc-950/50 rounded-full p-1">
          <Chip label="Queued" active={tab === "queued"} onClick={() => setTab("queued")} />
          <Chip label="Recent" active={tab === "recent"} onClick={() => setTab("recent")} />
        </div>

        <input
          className="h-12 w-full rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 px-3"
          placeholder="Search title, subtitle, ID…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        
        {tab === 'queued' && (
            <Button 
                className="h-12 w-full font-semibold" 
                onClick={printNext} 
                disabled={printingId !== null || !hasQueuedJobs}
            >
                {printingId ? 'Printing...' : 'Print Next in Queue'}
            </Button>
        )}
      </div>

      <div className="space-y-2">
        {loading ? (
          <div className="text-zinc-400 text-sm p-4 text-center">Loading print jobs...</div>
        ) : items.length === 0 ? (
          <div className="text-center text-zinc-500 p-8 border-2 border-dashed border-zinc-800 rounded-2xl">
            {tab === 'queued' ? 'No print jobs waiting. Print a certificate or record to add one.' : 'No recent print history.'}
          </div>
        ) : (
          items.map((job) => <JobCard key={job.id} job={job} onPrint={handlePrint} isPrinting={printingId === job.id} />)
        )}
      </div>
    </div>
  );
}

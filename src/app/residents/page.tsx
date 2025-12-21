"use client";

import React, { useEffect } from "react";
import { useResidents } from "@/hooks/useResidents";
import { FolderOpen } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ResidentsPage() {
  const router = useRouter();
  const { query, setQuery, items, loading } = useResidents();


  return (
      <div className="mx-auto w-full max-w-3xl p-4 md:p-6">
        {/* LIST VIEW */}
        
          <>
            <div className="mb-4">
              <h1 className="text-2xl font-bold">Resident Records</h1>
              <p className="text-muted-foreground text-sm mt-1">Directory of all constituents (works offline).</p>
            </div>

            <div className="rounded-xl border bg-card p-4">
              <input
                className="h-12 w-full rounded-lg bg-background border px-3"
                placeholder="Search by name, household no, or ID..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button
                className="mt-3 h-12 w-full rounded-lg bg-primary text-primary-foreground font-semibold"
                onClick={() => router.push('/residents/new')}
              >
                + Add New Resident
              </button>
              <div className="mt-3 text-xs text-muted-foreground">
                {loading ? "Loading..." : `${items.length} result(s)`}
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {items.length === 0 && !loading ? (
                 <div className="text-center p-12 border-2 border-dashed rounded-xl">
                    <FolderOpen className="mx-auto h-12 w-12 text-primary" />
                    <p className="mt-4 text-muted-foreground">No records found. Click 'Add New Resident' to start.</p>
                </div>
              ) : (
                items.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => router.push(`/residents/${r.id}`)}
                    className="w-full rounded-xl border bg-card p-4 text-left hover:bg-accent h-auto"
                  >
                    <div className="font-semibold">{r.fullName}</div>
                    <div className="text-muted-foreground text-xs mt-1">
                      {r.householdNo ? `Household: ${r.householdNo}` : "Household: —"} • ID: {r.id.slice(0, 8)}...
                    </div>
                  </button>
                ))
              )}
            </div>
          </>
      </div>
  );
}

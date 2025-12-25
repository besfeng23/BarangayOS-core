"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { collection, doc, getDoc, onSnapshot, orderBy, query } from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import { firestore } from "@/firebase";
import { Button } from "@/components/ui/button";

type ResidentListItem = {
  id: string;
  displayName?: string;
  addressSnapshot?: { purok?: string | null } | null;
};

function getErrorMessage(err: unknown) {
  if (!err) return "Unknown error.";
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message || "Unknown error.";
  return "Unknown error.";
}

export default function ResidentsIndex() {
  const { user, loading, customClaims } = useAuth();

  const [barangayId, setBarangayId] = useState<string | null>(null);
  const [residents, setResidents] = useState<ResidentListItem[]>([]);
  const [dataLoading, setDataLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const resolvedBarangayId = useMemo(() => {
    const claimId = (customClaims as { barangayId?: string } | null)?.barangayId;
    return claimId || barangayId || null;
  }, [customClaims, barangayId]);

  // Resolve barangayId (claims first; fallback to userProfiles/{uid}).
  useEffect(() => {
    let cancelled = false;

    async function resolve() {
      if (loading) return;
      if (!user?.uid) return;
      const claimId = (customClaims as { barangayId?: string } | null)?.barangayId;
      if (claimId) {
        if (!cancelled) setBarangayId(claimId);
        return;
      }

      try {
        const snap = await getDoc(doc(firestore, "userProfiles", user.uid));
        const next = (snap.data() as { barangayId?: string } | undefined)?.barangayId ?? null;
        if (!cancelled) setBarangayId(next);
      } catch (e) {
        if (!cancelled) setBarangayId(null);
      }
    }

    resolve();
    return () => {
      cancelled = true;
    };
  }, [loading, user?.uid, customClaims]);

  // Subscribe to residents for this barangay.
  useEffect(() => {
    if (loading) return;
    if (!user?.uid) return;

    setError(null);
    setDataLoading(true);

    if (!resolvedBarangayId) {
      setResidents([]);
      setDataLoading(false);
      return;
    }

    const q = query(
      collection(firestore, "barangays", resolvedBarangayId, "residents"),
      orderBy("displayNameLower", "asc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const next = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as ResidentListItem[];
        setResidents(next);
        setDataLoading(false);
      },
      (err) => {
        setResidents([]);
        setDataLoading(false);
        // Keep it simple and inline (no new UI patterns).
        setError(getErrorMessage(err));
      }
    );

    return () => unsub();
  }, [loading, user?.uid, resolvedBarangayId]);

  // While auth is initializing, ProtectedLayout/AuthProvider handles the skeleton.
  if (loading) return null;

  return (
    <div className="mx-auto w-full max-w-3xl p-4 md:p-6">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Resident Records</h1>
          <p className="text-muted-foreground text-sm mt-1">Directory of all constituents.</p>
        </div>
        <Link href="/residents/new" passHref>
          <Button>+ Add New Resident</Button>
        </Link>
      </div>

      {!user && (
        <div className="mb-4 rounded-xl border border-destructive/50 bg-destructive/10 p-4">
          <div className="font-semibold">You are not signed in.</div>
          <div className="text-sm mt-1 text-muted-foreground">Please sign in again.</div>
        </div>
      )}

      {user && !resolvedBarangayId && (
        <div className="mb-4 rounded-xl border bg-card p-4">
          <div className="font-semibold">Barangay not configured</div>
          <div className="text-sm mt-1 text-muted-foreground">
            This account does not have an assigned barangay. Please contact an admin.
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl border border-destructive/50 bg-destructive/10 p-4">
          <div className="font-semibold">Error loading residents</div>
          <div className="text-sm mt-1">{error}</div>
        </div>
      )}

      <div className="rounded-xl border bg-card p-4">
        <div className="mt-1 text-xs text-muted-foreground">
          {dataLoading ? "Loading…" : `${residents.length} result(s)`}
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {!dataLoading && residents.length === 0 ? (
          <div className="text-center p-12 border-2 border-dashed rounded-xl">
            <p className="font-semibold text-lg">No Residents Found</p>
            <p className="mt-4 text-muted-foreground">Click "+ Add New Resident" to get started.</p>
          </div>
        ) : (
          residents.map((r) => (
            <Link key={r.id} href={`/residents/${r.id}/edit`} className="block">
              <div className="w-full rounded-xl border bg-card p-4 text-left hover:bg-accent">
                <div className="font-semibold">{r.displayName || "Unnamed resident"}</div>
                <div className="text-muted-foreground text-xs mt-1">
                  {(r.addressSnapshot?.purok ?? "N/A") as any} • ID: {r.id ? `${r.id.slice(0, 8)}…` : "N/A"}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}


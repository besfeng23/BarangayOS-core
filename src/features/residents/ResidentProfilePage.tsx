
"use client";
import React, { useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/bosDb";
import { useResidentsData, calcAge } from "@/hooks/useResidentsData";
import { SyncStatusBadge } from "@/features/residents/components/SyncStatusBadge";
import { useToast } from "@/components/ui/toast";
import { norm } from "@/lib/uuid";

const btnPrimary =
  "px-5 py-4 rounded-2xl bg-zinc-800 border border-zinc-700 text-zinc-100 font-semibold " +
  "focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 ring-offset-zinc-950";
const btnSecondary =
  "px-5 py-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-100 " +
  "focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950";

export default function ResidentProfilePage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const { logActivity } = useResidentsData();
  const { toast } = useToast();
  const toastShownRef = useRef(false);

  const resident = useLiveQuery(() => db.residents.get(id as string), [id], undefined);

  // Log View
  useEffect(() => {
    if (!id) return;
    logActivity({ type: "RESIDENT_VIEW", entityType: "resident", entityId: id } as any);
  }, [id, logActivity]);
  
  // This effect can be used to show a toast passed via query param or other means
  useEffect(() => {
    const toastMessage = searchParams.get('toast');
    if (!toastShownRef.current && toastMessage && resident) {
      toastShownRef.current = true;
      toast({title: decodeURIComponent(toastMessage)});
      // Clear the toast message from the URL without reloading
      router.replace(`/residents/${id}`, { scroll: false });
    }
  }, [searchParams, toast, router, id, resident]);

  if (!resident) {
    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-24">
          <div className="max-w-3xl mx-auto px-4 pt-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <div className="text-zinc-100 font-semibold">Resident not found or still loading...</div>
              <button
                onClick={() => router.push("/residents")}
                className="mt-4 px-5 py-3 rounded-2xl bg-zinc-800 border border-zinc-700 text-zinc-100 font-semibold
                  focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
              >
                Back to Residents
              </button>
            </div>
          </div>
        </div>
    );
  }

  // Safe way to get initials, provides fallback
  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.[0] || '';
    const last = lastName?.[0] || '';
    return `${first}${last}`.toUpperCase() || 'N/A';
  }

  const residentData = resident as any;

  return (
      <>
        <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-24">
          <div className="max-w-4xl mx-auto px-4 pt-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <button
                onClick={() => router.push("/residents")}
                className="text-sm text-zinc-400 mb-4
                  focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950 rounded-2xl px-2 py-1"
              >
                ← Back to Residents
              </button>

              <div className="flex flex-col sm:flex-row gap-5 items-start">
                <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 font-bold text-xl">
                  {getInitials(residentData.firstName, residentData.lastName)}
                </div>

                <div className="flex-1 min-w-0">
                  <h1 className="text-3xl font-bold text-zinc-100 truncate">
                    {(residentData.lastName || '').toUpperCase()}, {residentData.firstName || ''}
                  </h1>
                  <SyncStatusBadge residentId={residentData.id} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 text-zinc-400">
                    <p><span className="text-zinc-100">ID:</span> <span className="font-mono text-zinc-400">{residentData.id}</span></p>
                    <p><span className="text-zinc-100">Status:</span> {residentData.status}</p>
                    <p><span className="text-zinc-100">Address:</span> {residentData.purok}, {residentData.addressLine1}</p>
                    <p><span className="text-zinc-100">Demographics:</span> {calcAge(residentData.birthdate)} y/o • {residentData.sex} • {residentData.civilStatus}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
                    <button className={btnPrimary} onClick={() => router.push(`/certificates?residentId=${resident.id}`)}>Issue Document</button>
                    
                    <button
                      className={btnPrimary}
                      onClick={() => {
                        // Route to Blotter Create with a prefill (complainant = this resident).
                        // BlotterCreatePage will autosave it as a draft.
                        router.push("/blotter/new");
                      }}
                    >
                      Create Blotter Case
                    </button>
                    
                    <button className={btnSecondary}>Edit Record</button>
                    <button className={btnSecondary}>Print Record</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
      </>
  );
}

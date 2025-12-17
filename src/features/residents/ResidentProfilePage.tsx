"use client";
import React, { useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { bosDb } from "@/lib/bosDb";
import { useResidentsData, calcAge } from "@/hooks/useResidentsData";
import { SyncStatusBadge } from "@/features/residents/components/SyncStatusBadge";
import { useToast } from "@/components/ui/Toast";
import { norm } from "@/lib/uuid";

export default function ResidentProfilePage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const { logActivity } = useResidentsData();
  const { showToast, ToastComponent } = useToast();
  const toastShownRef = useRef(false);

  const resident = useLiveQuery(() => bosDb.residents.get(id), [id], undefined);

  // Log View
  useEffect(() => {
    if (!id) return;
    logActivity({ type: "RESIDENT_VIEW", entityType: "resident", entityId: id });
  }, [id, logActivity]);
  
  // This effect can be used to show a toast passed via query param or other means
  useEffect(() => {
    const toastMessage = searchParams.get('toast');
    if (!toastShownRef.current && toastMessage) {
      toastShownRef.current = true;
      showToast(decodeURIComponent(toastMessage));
      // Clear the toast message from the URL without reloading
      router.replace(`/residents/${id}`, { scroll: false });
    }
  }, [searchParams, showToast, router, id]);

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
                  {resident.lastName[0]}{resident.firstName[0]}
                </div>

                <div className="flex-1 min-w-0">
                  <h1 className="text-3xl font-bold text-zinc-100 truncate">
                    {resident.lastName.toUpperCase()}, {resident.firstName}
                  </h1>
                  <SyncStatusBadge residentId={resident.id} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 text-zinc-400">
                    <p><span className="text-zinc-100">ID:</span> <span className="font-mono text-zinc-400">{resident.id}</span></p>
                    <p><span className="text-zinc-100">Status:</span> {resident.status}</p>
                    <p><span className="text-zinc-100">Address:</span> {resident.purok}, {resident.addressLine1}</p>
                    <p><span className="text-zinc-100">Demographics:</span> {calcAge(resident.birthdate)} y/o • {resident.sex} • {resident.civilStatus}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
                    <button className={btnPrimary} onClick={() => router.push(`/certificates/${resident.id}`)}>Issue Clearance</button>
                    <button className={btnPrimary}>Issue Certificate</button>
                    
                    <button
                      className={btnPrimary}
                      onClick={() => {
                        // Route to Blotter Create with a prefill (complainant = this resident).
                        // BlotterCreatePage will autosave it as a draft.
                        router.push("/blotter/new", {
                          state: {
                            prefill: {
                              complainants: [
                                {
                                  residentId: resident.id,
                                  name: `${resident.lastName.toUpperCase()}, ${resident.firstName}`,
                                  nameNorm: norm(`${resident.lastName} ${resident.firstName}`),
                                },
                              ],
                            },
                          },
                        } as any);
                      }}
                    >
                      Create Blotter Case
                    </button>

                    <button className={btnSecondary}>Print Record</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <ToastComponent />
      </>
  );
}

const btnPrimary =
  "px-5 py-4 rounded-2xl bg-zinc-800 border border-zinc-700 text-zinc-100 font-semibold " +
  "focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950";
const btnSecondary =
  "px-5 py-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-100 " +
  "focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950";

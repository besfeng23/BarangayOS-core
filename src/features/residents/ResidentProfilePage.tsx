import React, { useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { bosDb } from "@/lib/bosDb";
import { useResidentsData, calcAge } from "@/hooks/useResidentsData";
import { SyncStatusBadge } from "@/features/residents/components/SyncStatusBadge";
import { TerminalShell } from "@/components/shell/TerminalShell";
import { SystemRail } from "@/components/shell/SystemRail";
import { BottomNav } from "@/components/shell/BottomNav";
import { useToast } from "@/components/ui/Toast";

export default function ResidentProfilePage() {
  const { id = "" } = useParams();
  const nav = useNavigate();
  const location = useLocation() as any;
  const { logActivity } = useResidentsData();
  const { showToast, ToastComponent } = useToast();
  const toastShownRef = useRef(false);

  const resident = useLiveQuery(() => bosDb.residents.get(id), [id], undefined);

  // Log View
  useEffect(() => {
    if (!id) return;
    logActivity({ type: "RESIDENT_VIEW", entityType: "resident", entityId: id });
  }, [id, logActivity]);

  // Persisted toast from Create page (router-safe replace)
  useEffect(() => {
    const msg = location?.state?.toast;
    if (!toastShownRef.current && msg) {
      toastShownRef.current = true;
      showToast(msg);
      nav(".", { replace: true, state: {} });
    }
  }, [location, showToast, nav]);

  if (!resident) {
    return (
      <TerminalShell>
        <SystemRail />
        <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-24">
          <div className="max-w-3xl mx-auto px-4 pt-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <div className="text-zinc-100 font-semibold">Resident not found.</div>
              <button
                onClick={() => nav("/residents")}
                className="mt-4 px-5 py-3 rounded-2xl bg-zinc-800 border border-zinc-700 text-zinc-100 font-semibold
                  focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
              >
                Back to Residents
              </button>
            </div>
          </div>
          <BottomNav />
        </div>
      </TerminalShell>
    );
  }

  return (
    <TerminalShell>
      <SystemRail />
      <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-24">
        <div className="max-w-4xl mx-auto px-4 pt-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <button
              onClick={() => nav("/residents")}
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
                  <button className={btnPrimary}>Issue Clearance</button>
                  <button className={btnPrimary}>Issue Certificate</button>
                  <button className={btnSecondary}>Edit Profile</button>
                  <button className={btnSecondary}>Print Record</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <BottomNav />
      </div>
      <ToastComponent />
    </TerminalShell>
  );
}

const btnPrimary =
  "px-5 py-4 rounded-2xl bg-zinc-800 border border-zinc-700 text-zinc-100 font-semibold " +
  "focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950";
const btnSecondary =
  "px-5 py-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-100 " +
  "focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950";

import React, { useEffect, useState } from "react";
import { useResidentsData } from "@/hooks/useResidentsData";

export function SyncStatusBadge({ residentId }: { residentId: string }) {
  const { isResidentQueued } = useResidentsData();
  const [queued, setQueued] = useState(false);

  useEffect(() => {
    let mounted = true;
    isResidentQueued(residentId).then((q) => mounted && setQueued(q));
    return () => {
      mounted = false;
    };
  }, [residentId, isResidentQueued]);

  if (!queued) return null;

  return (
    <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700">
      <span className="text-zinc-100 text-xs font-medium">Queued for Sync</span>
    </div>
  );
}

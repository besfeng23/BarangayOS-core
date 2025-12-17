import React from "react";
import { useConnectivity } from "@/hooks/useConnectivity";

export function PartnerTileGuard({
  label = "Online Required",
  children,
  onBlocked,
}: {
  label?: string;
  children: React.ReactNode;
  onBlocked?: () => void;
}) {
  const { state } = useConnectivity();
  const offline = state === "OFFLINE";

  return (
    <div className={offline ? "opacity-60 grayscale" : ""}>
      <div
        onClick={(e) => {
          if (!offline) return;
          e.preventDefault();
          e.stopPropagation();
          onBlocked?.();
        }}
        className={offline ? "cursor-not-allowed" : ""}
      >
        {children}
      </div>

      {offline && (
        <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800">
          <span className="text-zinc-300 text-xs font-medium">{label}</span>
        </div>
      )}
    </div>
  );
}

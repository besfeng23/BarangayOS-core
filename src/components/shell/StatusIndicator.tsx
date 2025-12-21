
import React from "react";
import { useSyncHealth } from "@/hooks/useSyncHealth";
import { useSyncStatus } from "@/hooks/useSyncStatus";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export function StatusIndicator() {
  const { state, pendingCount, errorCount, lastSync } = useSyncHealth();
  const { label, state: badgeState } = useSyncStatus();

  const stateConfig = {
    synced: {
      color: "bg-emerald-400",
      textColor: "text-zinc-100",
    },
    syncing: {
      color: "bg-amber-400 animate-pulse",
      textColor: "text-zinc-100",
    },
    offline: {
      color: "bg-amber-400",
      textColor: "text-zinc-100",
    },
    failed: {
      color: "bg-red-500",
      textColor: "text-zinc-100",
    },
  } as const;

  const config = stateConfig[state];
  const count = badgeState === "error" ? errorCount : pendingCount;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "h-10 px-3 rounded-2xl bg-zinc-800/50 border border-zinc-700 flex items-center gap-2 transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
          )}
        >
          <span className={cn("h-2.5 w-2.5 rounded-full", config.color)} />
          <span className={cn("text-xs font-semibold", config.textColor)}>
            {label}
            {count > 0 && badgeState !== "synced" && ` (${count})`}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 bg-zinc-900 border-zinc-800 text-zinc-100 p-4" align="end">
        <div className="space-y-4">
          <div className="font-bold text-lg capitalize">{state}</div>
          <div className="text-sm">
            <p><span className="font-semibold">{pendingCount}</span> items pending sync.</p>
            <p><span className="font-semibold">{errorCount}</span> sync errors.</p>
          </div>
          <div className="text-xs text-zinc-400">
            Last sync: {lastSync ? formatDistanceToNow(lastSync, { addSuffix: true }) : "Never"}
          </div>
          <div className="flex flex-col gap-2">
            <Button disabled={state === 'offline'}>Sync Now</Button>
            <Button variant="outline">View Log</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

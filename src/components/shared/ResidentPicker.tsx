"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useResidentSearch } from "@/hooks/useResidentSearch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, User, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ResidentPickerValue = {
  mode: "resident" | "manual";
  residentId?: string | null;
  residentNameSnapshot?: string;
  manualName?: string;
};

interface ResidentPickerProps {
  label: string;
  value: ResidentPickerValue;
  onChange: (next: ResidentPickerValue) => void;
  placeholder?: string;
  allowManual?: boolean;
}

export function ResidentPicker({
  label,
  value,
  onChange,
  placeholder = "Search resident name, household no...",
  allowManual = true,
}: ResidentPickerProps) {
  const [isEditing, setIsEditing] = useState(!value?.residentId && !value?.manualName);
  const [searchQuery, setSearchQuery] = useState("");
  const { results, loading } = useResidentSearch(searchQuery);

  const handleSelectResident = (resident: { id: string; fullName: string }) => {
    onChange({
      mode: "resident",
      residentId: resident.id,
      residentNameSnapshot: resident.fullName,
      manualName: "",
    });
    setSearchQuery("");
    setIsEditing(false);
  };

  const handleSetManual = () => {
    onChange({
      mode: "manual",
      residentId: null,
      residentNameSnapshot: "",
      manualName: "",
    });
    setIsEditing(true);
  };

  const handleClear = () => {
    onChange({
      mode: "resident",
      residentId: null,
      residentNameSnapshot: "",
      manualName: "",
    });
    setIsEditing(true);
  };

  if (!isEditing) {
    const displayName = value.mode === 'resident' ? value.residentNameSnapshot : value.manualName;
    return (
      <div className="space-y-1">
        <label className="text-xs text-zinc-500 uppercase font-medium ml-1">{label}</label>
        <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-950 border border-zinc-800 min-h-[56px]">
          <User className="h-5 w-5 text-blue-400 flex-shrink-0" />
          <span className="font-semibold flex-1">{displayName}</span>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleClear}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <label className="text-xs text-zinc-500 uppercase font-medium ml-1">{label}</label>
      {value.mode === "manual" ? (
        <div className="flex items-center gap-2">
          <Input
            placeholder="Enter full name for non-resident"
            value={value.manualName || ""}
            onChange={(e) => onChange({ ...value, manualName: e.target.value })}
            className="h-14 text-lg bg-zinc-950 border-zinc-700"
          />
          <Button variant="ghost" onClick={() => onChange({ ...value, mode: "resident", manualName: "" })}>
            Cancel
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="relative">
            <Input
              placeholder={placeholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-14 text-lg bg-zinc-950 border-zinc-700 pl-4 pr-10"
            />
            {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 animate-spin" />}
          </div>
          
          <div className="max-h-48 overflow-y-auto space-y-1">
            {results.map((res) => (
              <button
                key={res.id}
                type="button"
                onClick={() => handleSelectResident(res)}
                className="w-full text-left p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-800/70 transition-colors"
              >
                <p className="font-semibold">{res.fullName}</p>
                <p className="text-sm text-zinc-400">{res.householdNo ? `HH: ${res.householdNo}` : "No household"} • {res.addressText}</p>
              </button>
            ))}
          </div>

          {allowManual && (
             <Button variant="link" onClick={handleSetManual}>
                Or, enter name manually for non-resident
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

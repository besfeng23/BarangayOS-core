
"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  value?: ResidentPickerValue;
  onChange: (next: ResidentPickerValue) => void;
  placeholder?: string;
  allowManual?: boolean;
  errorMessage?: string;
}

export function ResidentPicker({
  label,
  value,
  onChange,
  placeholder = "Search for a resident...",
  allowManual = true,
  errorMessage,
}: ResidentPickerProps) {
  const safeValue = value ?? { mode: "resident", residentId: null, residentNameSnapshot: "", manualName: "" };
  
  const [isEditing, setIsEditing] = useState(!safeValue?.residentId && !safeValue?.manualName);
  const [searchQuery, setSearchQuery] = useState("");
  const { results, loading } = useResidentSearch(searchQuery);
  const [showResults, setShowResults] = useState(false);

  const handleSelectResident = (resident: { id: string; fullName: string }) => {
    onChange({
      mode: "resident",
      residentId: resident.id,
      residentNameSnapshot: resident.fullName,
      manualName: "",
    });
    setSearchQuery("");
    setIsEditing(false);
    setShowResults(false);
  };

  const handleSetManual = () => {
    onChange({
      mode: "manual",
      residentId: null,
      residentNameSnapshot: "",
      manualName: "",
    });
    setIsEditing(true);
    setShowResults(false);
  };

  const handleClear = () => {
    onChange({
      mode: "resident",
      residentId: null,
      residentNameSnapshot: "",
      manualName: "",
    });
    setSearchQuery("");
    setIsEditing(true);
    setShowResults(false);
  };

  const handleManualBlur = () => {
    if(safeValue.mode === 'manual' && safeValue.manualName?.trim()) {
      setIsEditing(false);
    }
  }


  const isInvalid = !allowManual && safeValue.mode !== 'resident';
  const displayName = safeValue.mode === 'resident' ? safeValue.residentNameSnapshot : safeValue.manualName;

  if (!isEditing) {
    return (
      <div className="space-y-1">
        <label className="text-xs text-zinc-400 uppercase font-medium ml-1">{label}</label>
        <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-950 border border-zinc-800 min-h-[56px] h-14">
          <User className="h-5 w-5 text-blue-400 flex-shrink-0" />
          <span className="font-semibold flex-1 text-slate-200">{displayName}</span>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleClear}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <label className="text-xs text-zinc-400 uppercase font-medium ml-1">{label}</label>
      {safeValue.mode === "manual" ? (
        <div className="flex items-center gap-2">
          <Input
            placeholder="Enter full name for non-resident"
            value={safeValue.manualName || ""}
            onChange={(e) => onChange({ ...safeValue, manualName: e.target.value })}
            onBlur={handleManualBlur}
            className={`h-14 text-lg bg-zinc-950 border-zinc-700 ${isInvalid ? 'border-red-500' : ''}`}
          />
           <Button variant="ghost" onClick={() => onChange({ ...safeValue, mode: "resident", manualName: "" })}>
                Cancel
            </Button>
        </div>
      ) : (
        <div className="relative">
          <Input
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowResults(e.target.value.length > 1);
            }}
            onBlur={() => setTimeout(() => setShowResults(false), 150)} // Delay to allow click
            onFocus={() => { if(searchQuery) setShowResults(true); }}
            className="h-14 text-lg bg-zinc-950 border-zinc-700 pl-4 pr-10"
          />
          {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 animate-spin" />}
          
          {showResults && (
            <div className="absolute z-10 w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-xl shadow-lg max-h-60 overflow-y-auto">
              {results.map((res) => (
                <button
                  key={res.id}
                  type="button"
                  onMouseDown={() => handleSelectResident(res)} // Use onMouseDown to beat onBlur
                  className="w-full text-left p-3 hover:bg-zinc-800 transition-colors"
                >
                  <p className="font-semibold text-slate-200">{res.fullName}</p>
                  <p className="text-sm text-zinc-400">{res.householdNo ? `HH: ${res.householdNo}` : "No household"} • {res.addressText}</p>
                </button>
              ))}
              {allowManual && (
                <button
                  type="button"
                  onMouseDown={handleSetManual}
                  className="w-full text-left p-3 text-blue-400 hover:bg-zinc-800"
                >
                  Or, enter name manually
                </button>
              )}
            </div>
          )}
        </div>
      )}
       {isInvalid && errorMessage && (
            <p className="text-sm text-red-400 mt-1">{errorMessage}</p>
        )}
    </div>
  );
}

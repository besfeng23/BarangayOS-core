"use client";
import { useMemo } from "react";

export function useSettings() {
  // Replace later with real Settings module; keep safe defaults now.
  return useMemo(() => ({
    barangayName: "Barangay Dau",
    municipalityCity: "Mabalacat City",
    province: "Pampanga",
    issuedByName: "Barangay Staff",
  }), []);
}

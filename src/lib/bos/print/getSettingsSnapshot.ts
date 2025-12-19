import { db } from "@/lib/bosDb";
import type { BarangaySettings } from "@/lib/bos/settings/useSettings";

const KEY = "barangaySettings";

const DEFAULTS: BarangaySettings = {
  barangayName: "Barangay [Not Set]",
  barangayAddress: "[Not Set]",
  punongBarangay: "[Not Set]",
  secretaryName: "[Not Set]",
  trialEnabled: true,
  trialDaysRemaining: 0,
  updatedAtISO: new Date().toISOString(),
  controlPrefix: "BRGY",
  readOnlyMode: false,
};

export type BarangaySettingsSnapshot = BarangaySettings;

export async function getSettingsSnapshot(): Promise<BarangaySettings> {
  try {
    const row = await db.settings.get(KEY);
    return row?.value as BarangaySettings ?? DEFAULTS;
  } catch (error) {
    console.warn("Could not load settings from Dexie, using defaults.", error);
    return DEFAULTS;
  }
}

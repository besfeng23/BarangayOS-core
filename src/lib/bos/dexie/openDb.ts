"use client";
import { db } from "@/lib/bosDb";

let dbState: "initial" | "opening" | "open" | "error" = "initial";

export async function ensureDbOpen() {
  if (dbState === "open") return { success: true };
  if (dbState === "opening") {
    // Wait for the ongoing open operation to complete
    await new Promise(resolve => setTimeout(resolve, 100));
    return ensureDbOpen();
  }

  dbState = "opening";
  try {
    await db.open();
    dbState = "open";
    return { success: true };
  } catch (error: any) {
    dbState = "error";
    console.error("Failed to open Dexie database:", error);
    // Propagate a specific, identifiable error for the UI to handle
    if (error.name === 'UpgradeError') {
       throw new Error(`DBUpgradeError: ${error.message}`);
    }
    throw error;
  }
}

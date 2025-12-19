"use client";
import { db } from "@/lib/bosDb";

let opened = false;
export async function ensureDbOpen() {
  if (opened) return;
  opened = true;
  await db.open();
}

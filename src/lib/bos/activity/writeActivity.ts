import { db, ActivityLogLocal } from "@/lib/bosDb";
import { toTokens } from "@/lib/bos/searchTokens";
import { ensureDbOpen } from "../dexie/openDb";

function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function writeActivity(args: Omit<ActivityLogLocal, "id" | "occurredAtISO" | "searchTokens" | "synced"> & {
  occurredAtISO?: string;
}) {
  await ensureDbOpen();
  const occurredAtISO = args.occurredAtISO ?? new Date().toISOString();
  const row: ActivityLogLocal = {
    id: uuid(),
    occurredAtISO,
    type: args.type,
    entityType: args.entityType,
    entityId: args.entityId,
    status: args.status,
    title: args.title,
    subtitle: args.subtitle,
    details: args.details,
    searchTokens: toTokens([args.title, args.subtitle, args.type, args.entityType, args.entityId, occurredAtISO].join(" ")),
    synced: 0,
  };

  await db.activity_log.put(row);

  try {
    // enqueue for cloud sync (do not block)
    await db.sync_queue.add({
      jobType: "ACTIVITY_UPSERT",
      payload: row,
      occurredAtISO,
      synced: 0,
      status: 'pending',
    } as any);
  } catch (e) {
    console.warn("Failed to enqueue activity sync job", e);
    // Swallow error to keep the app usable
  }


  return row.id;
}

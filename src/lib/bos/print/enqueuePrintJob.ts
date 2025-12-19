import { db, PrintJobLocal } from "@/lib/bosDb";
import { toTokens } from "@/lib/bos/searchTokens";
import { writeActivity } from "@/lib/bos/activity/writeActivity";

function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function enqueuePrintJob(args: {
  entityType: PrintJobLocal["entityType"];
  entityId: string;
  docType: string;
  title: string;
  subtitle: string;
  html: string;
}) {
  const createdAtISO = new Date().toISOString();
  const job: PrintJobLocal = {
    id: uuid(),
    createdAtISO,
    entityType: args.entityType,
    entityId: args.entityId,
    docType: args.docType,
    title: args.title,
    subtitle: args.subtitle,
    html: args.html,
    status: "queued",
    attempts: 0,
    searchTokens: toTokens([args.title, args.subtitle, args.docType, args.entityType, args.entityId].join(" ")),
    synced: 0,
  };

  await db.print_jobs.put(job);

  // sync to cloud later (non-blocking)
  await db.syncQueue.add({
    jobType: "PRINTJOB_UPSERT",
    payload: job,
    occurredAtISO: createdAtISO,
    synced: 0,
    status: "pending",
  } as any);

  await writeActivity({
    type: "CERT_PRINTED", // Keep activity types consistent for now
    entityType: "system",
    entityId: job.id,
    status: "ok",
    title: "Print queued",
    subtitle: `${job.title} • ${job.subtitle}`,
    details: { printJobId: job.id, docType: job.docType, entityType: job.entityType, entityId: job.entityId },
  }).catch(() => {});

  return job.id;
}

import { db } from "@/lib/bosDb";
import { writeActivity } from "@/lib/bos/activity/writeActivity";

function openPrintWindow(html: string) {
  const w = window.open("", "_blank", "noopener,noreferrer,width=900,height=700");
  if (!w) throw new Error("Popup blocked. Allow popups to print.");
  w.document.open();
  w.document.write(html);
  w.document.close();
  w.focus();
  w.print();
  // w.close(); // browsers often block this; let user close it
}

export async function performPrintJob(id: string) {
  const job = await db.print_jobs.get(id);
  if (!job) throw new Error("Print job not found.");

  try {
    openPrintWindow(job.html);

    const printedAtISO = new Date().toISOString();
    await db.print_jobs.update(id, { status: "printed", printedAtISO, attempts: (job.attempts ?? 0) + 1, lastError: "" });

    // enqueue print log sync (separate from printjob snapshot)
    await db.syncQueue.add({
      jobType: "PRINTLOG_ADD",
      payload: { printJobId: id, printedAtISO },
      occurredAtISO: printedAtISO,
      synced: 0,
      status: "pending",
    } as any);

    await writeActivity({
      type: "CERT_PRINTED",
      entityType: "system",
      entityId: id,
      status: "ok",
      title: "Printed",
      subtitle: `${job.title} • ${job.subtitle}`,
      details: { printJobId: id },
    }).catch(() => {});
  } catch (e: any) {
    const msg = e?.message ?? String(e);
    await db.print_jobs.update(id, { status: "failed", attempts: (job.attempts ?? 0) + 1, lastError: msg });

    await writeActivity({
      type: "ERROR",
      entityType: "system",
      entityId: id,
      status: "error",
      title: "Print failed",
      subtitle: msg,
      details: { printJobId: id },
    }).catch(() => {});

    throw e;
  }
}

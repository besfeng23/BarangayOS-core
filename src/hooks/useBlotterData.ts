import { db } from "@/lib/bosDb";
import { writeActivity } from "@/lib/bos/activity/writeActivity";

export async function updateBlotterStatus(blotterId: string, status: "SETTLED" | "DISMISSED" | "FILED_TO_COURT", summary?: string) {
    const blotter = await db.blotters.get(blotterId);
    if (!blotter) throw new Error("Blotter case not found.");
  
    const nowISO = new Date().toISOString();
    const updatedRecord = { 
        ...blotter, 
        status, 
        settlement: status === 'SETTLED' ? summary : blotter.settlement,
        updatedAtISO: nowISO, 
    };

    await db.blotters.put(updatedRecord as any);
  
    await writeActivity({
        type: "BLOTTER_UPDATED",
        entityType: "blotter",
        entityId: blotterId,
        status: "ok",
        title: `Blotter Status Changed: ${status}`,
        subtitle: `${blotter.complainantName} vs ${blotter.respondentName}`,
    } as any);
    
    // Enqueue sync
    await db.sync_queue.add({
        jobType: "BLOTTER_UPSERT",
        payload: updatedRecord,
        occurredAtISO: nowISO,
        synced: 0,
        status: "pending",
    } as any);

    return updatedRecord;
}


export function useBlotterData() {
    const logActivity = writeActivity;
    return { logActivity, updateBlotterStatus };
}

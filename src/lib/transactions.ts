
import { db } from "./bosDb";
import { ulid } from "./ulid";
import { uuid } from "./uuid";

// The TransactionRecord type is not defined in the provided context,
// so we'll define a minimal version to satisfy the function signature.
export type TransactionRecord = {
  id: string;
  type: string;
  module: string;
  refId: string;
  partnerId: string;
  amount: number;
  currency: "PHP";
  status: "pending" | "completed" | "failed";
  createdAt: string;
  offline: boolean;
  barangayId: string;
  deviceId: string;
  createdByUid: string;
};


type LogTransactionInput = {
  type: TransactionRecord["type"];
  module: TransactionRecord["module"];
  refId: string;
  amount?: number;
};

export async function logTransaction(input: LogTransactionInput): Promise<void> {
  try {
    const now = Date.now();

    // Fetch settings to get required IDs.
    // In a real app, this should be cached in context/memory.
    const settings = await db.table("settings").where("key").equals("barangay").first();
    const partnerId = settings?.value?.partnerId || "PLDT_ENT_001";
    const barangayId = settings?.value?.barangayName || "UNKNOWN_BRGY";
    const deviceId = settings?.value?.deviceId || "UNKNOWN_DEVICE";

    // TODO: Get real UID from auth context
    const createdByUid = "user-placeholder";

    const transaction: TransactionRecord = {
      id: `tx_${ulid(now)}`,
      type: input.type,
      module: input.module,
      refId: input.refId,
      partnerId,
      amount: input.amount || 0,
      currency: "PHP",
      status: "pending",
      createdAt: new Date(now).toISOString(),
      offline: typeof navigator !== "undefined" ? !navigator.onLine : false,
      barangayId,
      deviceId,
      createdByUid,
    };

    // Write to both transactions table and sync queue atomically
    await db.transaction("rw", db.table("transactions"), db.sync_queue, async () => {
      await db.table("transactions").add(transaction);
      await db.sync_queue.add({
        id: uuid(),
        entityType: "transaction",
        entityId: transaction.id,
        op: "UPSERT",
        payload: transaction,
        occurredAtISO: transaction.createdAt,
        status: "pending",
        tryCount: 0,
      } as any);
    });

  } catch (error) {
    // Non-blocking: log the error but do not throw,
    // so the main UI workflow is never interrupted.
    console.error("Failed to log transaction:", error);
  }
}

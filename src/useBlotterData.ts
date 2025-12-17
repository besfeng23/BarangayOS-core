import * as React from "react";

const DRAFT_KEY = "draft:blotter:new";
const QUEUE_KEY = "queue:blotter:sync";
const EVENT_KEY = "bos:blotterdata";

export type DraftParticipantType = "RESIDENT" | "NON_RESIDENT" | "UNKNOWN";

export interface DraftData {
  narrative: string;

  compType: DraftParticipantType;
  compResId: string;
  compDisplay: string;
  compSnap: { name: string; address: string; contact: string };

  respType: DraftParticipantType;
  respResId: string;
  respDisplay: string;
  respSnap: { name: string; address: string; contact: string };

  timestamp: number;
}

type QueueItem = {
  clientId: string;
  queuedAt: number;
  payload: any;
};

function safeJSONParse<T>(raw: string | null, fallback: T): T {
  try {
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function readDraft(): DraftData | null {
  if (typeof window === "undefined") return null;
  return safeJSONParse<DraftData | null>(window.localStorage.getItem(DRAFT_KEY), null);
}

function readQueue(): QueueItem[] {
  if (typeof window === "undefined") return [];
  return safeJSONParse<QueueItem[]>(window.localStorage.getItem(QUEUE_KEY), []);
}

function writeQueue(next: QueueItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(QUEUE_KEY, JSON.stringify(next));
}

function emitChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(EVENT_KEY));
}

function getSnapshot() {
  const draft = readDraft();
  const queue = readQueue();
  return {
    hasDraft: !!draft,
    draft,
    queueCount: queue.length,
  };
}

export function useBlotterData() {
  const [{ hasDraft, draft, queueCount }, setState] = React.useState(() => getSnapshot());

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const onAny = () => setState(getSnapshot());
    window.addEventListener("storage", onAny);
    window.addEventListener(EVENT_KEY, onAny);
    return () => {
      window.removeEventListener("storage", onAny);
      window.removeEventListener(EVENT_KEY, onAny);
    };
  }, []);

  const saveDraft = (data: Omit<DraftData, "timestamp">) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...data, timestamp: Date.now() }));
    emitChange();
  };

  const loadDraft = () => readDraft();

  const clearDraft = () => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(DRAFT_KEY);
    emitChange();
  };

  const addToQueue = (payload: any) => {
    if (typeof window === "undefined") return "";
    const clientId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? (crypto as any).randomUUID()
        : `q_${Date.now()}_${Math.random().toString(16).slice(2)}`;

    const q = readQueue();
    q.push({ clientId, queuedAt: Date.now(), payload });
    writeQueue(q);
    emitChange();
    return clientId;
  };

  const removeFromQueue = (clientId: string) => {
    if (typeof window === "undefined") return;
    const q = readQueue().filter((x) => x.clientId !== clientId);
    writeQueue(q);
    emitChange();
  };

  // v1: remoteForReview stub (wire later)
  const remoteForReview = 0;
  const computedBadge = remoteForReview + queueCount;

  return {
    hasDraft,
    draft,
    queueCount,
    saveDraft,
    loadDraft,
    clearDraft,
    addToQueue,
    removeFromQueue,
    computedBadge,
  };
}

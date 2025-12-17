'use client';

import { useDrafts } from '@/hooks/useDrafts';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { deleteDraft } from '@/lib/drafts';

export default function DraftBanner() {
  const { drafts, loading } = useDrafts();
  const router = useRouter();

  if (loading || drafts.length === 0) {
    return null;
  }

  const latestDraft = drafts[0];

  const handleResume = () => {
    // This logic assumes the draft payload can be passed via query params
    // A more robust solution might use a global state (e.g., Zustand, Context)
    router.push(
      `${latestDraft.routeToResume}?draft=${encodeURIComponent(
        JSON.stringify(latestDraft)
      )}`
    );
  };

  const handleDiscard = async () => {
    if (
      window.confirm('Discard this draft? This cannot be undone.')
    ) {
      await deleteDraft(latestDraft.id);
    }
  };

  return (
    <div className="mx-3 mt-3 rounded-xl border border-amber-700/40 bg-amber-950/50 text-amber-100 p-3 flex flex-col sm:flex-row items-center justify-between gap-4">
      <p className="font-medium text-sm text-center sm:text-left">
        <span className="font-bold">Unsaved Draft:</span> {latestDraft.residentName} — {latestDraft.type}
      </p>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Button
          onClick={handleResume}
          className="bg-amber-500 text-zinc-950 font-semibold rounded-lg px-3 py-2 hover:bg-amber-400 h-auto"
        >
          Resume
        </Button>
        <Button
          onClick={handleDiscard}
          className="border border-amber-400/60 text-amber-100 rounded-lg px-3 py-2 hover:bg-amber-950/50 h-auto"
          variant="outline"
        >
          Discard
        </Button>
      </div>
    </div>
  );
}

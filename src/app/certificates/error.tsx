'use client';

import { LolaBanner, LolaCard, LolaPage, LolaPrimaryButton, LolaSecondaryButton } from '@/components/lola';

export default function ErrorCertificates({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <LolaPage>
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <LolaBanner
          variant="error"
          title="Certificate module error"
          message="We couldn’t load the certificate tools. Check your connection or try again."
        />
        <LolaCard className="w-full max-w-2xl space-y-3">
          <p className="text-sm text-slate-600">Details</p>
          <div className="rounded-xl bg-slate-900 p-3 text-left text-sm text-red-100">
            {error.message || 'Unexpected error.'}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <LolaSecondaryButton fullWidth={false} onClick={() => window.history.back()}>
              Go back
            </LolaSecondaryButton>
            <LolaPrimaryButton fullWidth={false} onClick={() => reset()}>
              Try again
            </LolaPrimaryButton>
          </div>
        </LolaCard>
      </div>
    </LolaPage>
  );
}

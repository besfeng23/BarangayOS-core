'use client' 

import { useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { LolaBanner, LolaCard, LolaPage, LolaPrimaryButton, LolaSecondaryButton } from '@/components/lola';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { user } = useAuth();
  useEffect(() => {
    console.error(`[Residents Module Error] User: ${user?.uid || 'anonymous'}`, error)
  }, [error, user])

  return (
    <LolaPage>
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <LolaBanner
          variant="error"
          title="Error loading residents"
          message="We couldn’t load the resident directory. Check your connection or try again."
        />
        <LolaCard className="w-full max-w-2xl space-y-3">
          <p className="text-sm text-slate-600">Error details</p>
          <div className="rounded-xl bg-slate-900 p-3 text-left text-sm text-red-100">
            {error.message || "An unexpected error occurred."}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <LolaSecondaryButton fullWidth={false} onClick={() => window.history.back()}>
              Go Back
            </LolaSecondaryButton>
            <LolaPrimaryButton fullWidth={false} onClick={() => reset()}>
              Try again
            </LolaPrimaryButton>
          </div>
        </LolaCard>
      </div>
    </LolaPage>
  )
}

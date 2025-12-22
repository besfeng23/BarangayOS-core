
'use client' 

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { user } = useAuth();
  useEffect(() => {
    // You can log the error to an error reporting service
    console.error(`[Residents Module Error] User: ${user?.uid || 'anonymous'}`, error)
  }, [error, user])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
      <h2 className="text-2xl font-bold mb-4 text-destructive">Error Loading Residents</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        There was a problem fetching the resident records. This might be a temporary issue with the server or your connection.
      </p>
      <div className="bg-zinc-800 p-4 rounded-lg font-mono text-xs text-red-300 mb-6 max-w-full overflow-x-auto">
        {error.message || "An unexpected error occurred."}
      </div>
      <div className="flex gap-4">
        <Button
          onClick={
            // Attempt to recover by trying to re-render the segment
            () => reset()
          }
          variant="secondary"
          size="lg"
        >
          Try again
        </Button>
         <Button
            onClick={() => window.history.back()}
            variant="outline"
            size="lg"
        >
          Go Back
        </Button>
      </div>
    </div>
  )
}

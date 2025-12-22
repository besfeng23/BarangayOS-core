
'use client' 

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h2 className="text-2xl font-bold mb-4">Something went wrong in Residents Module</h2>
      <p className="text-muted-foreground mb-6 max-w-md">{error.message || "An unexpected error occurred."}</p>
      <div className="flex gap-4">
        <Button
          onClick={() => reset()}
          variant="secondary"
        >
          Try again
        </Button>
         <Button
            onClick={() => window.history.back()}
            variant="outline"
        >
          Go Back
        </Button>
      </div>
    </div>
  )
}

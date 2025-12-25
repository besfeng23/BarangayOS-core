
'use client' 

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { user } = useAuth();
  
  useEffect(() => {
    // Log the error for debugging
    console.error(`[Residents Module Error] User: ${user?.uid || 'anonymous'}`, error)
  }, [error, user])

  // Check if it's an auth-related error
  const isAuthError = error.message?.toLowerCase().includes('unauthorized') || 
                      error.message?.toLowerCase().includes('session') ||
                      error.message?.toLowerCase().includes('login');

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-red-900/30 flex items-center justify-center mb-4">
            <AlertTriangle className="h-6 w-6 text-red-400" />
          </div>
          
          <h2 className="text-xl font-bold mb-2 text-zinc-100">
            {isAuthError ? 'Session Error' : 'Error Loading Residents'}
          </h2>
          
          <p className="text-zinc-400 mb-4 text-sm">
            {isAuthError 
              ? 'Your session may have expired. Please try logging in again.'
              : 'There was a problem fetching the resident records. This might be a temporary issue.'
            }
          </p>
          
          {error.message && (
            <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-lg font-mono text-xs text-red-300 mb-6 text-left overflow-x-auto">
              {error.message}
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => reset()}
              variant="default"
              className="flex-1 bg-zinc-100 text-zinc-950 hover:bg-zinc-200"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try again
            </Button>
            
            {isAuthError ? (
              <Link href="/login" className="flex-1">
                <Button variant="outline" className="w-full border-zinc-700">
                  Go to Login
                </Button>
              </Link>
            ) : (
              <Link href="/apps" className="flex-1">
                <Button variant="outline" className="w-full border-zinc-700">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Apps
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-3xl p-4 md:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <Skeleton className="h-8 w-64 bg-zinc-800" />
          <Skeleton className="h-4 w-48 mt-2 bg-zinc-800" />
        </div>
        <Skeleton className="h-10 w-40 bg-zinc-800" />
      </div>
      
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
        <Skeleton className="h-5 w-32 bg-zinc-800" />
      </div>

      <div className="mt-4 space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <Skeleton className="h-6 w-3/4 bg-zinc-800" />
            <Skeleton className="h-4 w-1/2 mt-2 bg-zinc-800" />
          </div>
        ))}
      </div>
    </div>
  );
}

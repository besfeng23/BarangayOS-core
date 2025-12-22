
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-3xl p-4 md:p-6 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48 mt-2" />
        </div>
        <Skeleton className="h-10 w-48" />
      </div>
      
      <div className="rounded-xl border bg-card p-4">
        <Skeleton className="h-14 w-full" />
      </div>

      <div className="mt-4 space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-full rounded-xl border bg-card p-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </div>
        ))}
      </div>
    </div>
  );
}

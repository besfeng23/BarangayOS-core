import { LolaCard, LolaPage, LolaSkeleton } from '@/components/lola';

export default function Loading() {
  return (
    <LolaPage>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <LolaSkeleton className="h-8 w-64" />
            <LolaSkeleton className="h-4 w-48" />
          </div>
          <LolaSkeleton className="h-14 w-48" />
        </div>

        <LolaCard className="space-y-3">
          <LolaSkeleton className="h-6 w-32" />
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <LolaSkeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </LolaCard>
      </div>
    </LolaPage>
  );
}

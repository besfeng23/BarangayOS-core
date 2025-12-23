import { LolaCard, LolaPage, LolaSkeleton } from '@/components/lola';

export default function LoadingCertificates() {
  return (
    <LolaPage>
      <div className="space-y-4">
        <div className="space-y-2">
          <LolaSkeleton className="h-8 w-72" />
          <LolaSkeleton className="h-4 w-64" />
        </div>
        <LolaCard className="space-y-4">
          <LolaSkeleton className="h-14 w-full" />
          <LolaSkeleton className="h-14 w-full" />
          <LolaSkeleton className="h-14 w-full" />
          <LolaSkeleton className="h-14 w-full" />
        </LolaCard>
      </div>
    </LolaPage>
  );
}

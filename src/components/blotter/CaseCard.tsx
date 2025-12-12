import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, Camera } from 'lucide-react';

interface CaseItem {
  status: string;
  caseNumber: string;
  title: string;
  parties: string;
  location: string;
  extra?: string;
  attachment?: {
    type: string;
    label: string;
  };
  color: 'yellow' | 'green' | 'red';
}

interface CaseCardProps {
  caseItem: CaseItem;
}

const colorVariants = {
    yellow: 'border-yellow-500/50 bg-yellow-500/10',
    green: 'border-green-500/50 bg-green-500/10',
    red: 'border-red-500/50 bg-red-500/10',
};

const statusBadgeColor = {
    DRAFT: 'secondary',
    FILED: 'default',
    URGENT: 'destructive'
} as const;


export default function CaseCard({ caseItem }: CaseCardProps) {
    const { status, caseNumber, title, parties, location, extra, attachment, color } = caseItem;

    const renderAttachment = () => {
        if (!attachment) return null;
        return (
            <div className="flex items-center text-xs text-muted-foreground mt-1">
                {attachment.type === 'audio' ? <Mic className="w-3 h-3 mr-1" /> : <Camera className="w-3 h-3 mr-1" />}
                {attachment.label}
            </div>
        )
    }

  return (
    <Card className={`cursor-pointer transition-all hover:shadow-md ${colorVariants[color]}`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <Badge variant={statusBadgeColor[status as keyof typeof statusBadgeColor] || 'default'} className="text-xs">{status}</Badge>
          <span className="text-xs text-muted-foreground font-mono">{caseNumber}</span>
        </div>
        <div className="mt-3">
          <p className="font-semibold text-foreground">{title}</p>
          <p className="text-sm text-muted-foreground">{parties}</p>
          <p className="text-sm text-muted-foreground">{location}</p>
          {extra && <p className="text-sm text-muted-foreground">{extra}</p>}
          {renderAttachment()}
        </div>
      </CardContent>
    </Card>
  );
}

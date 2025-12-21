import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const SAMPLE_ALERTS = [
  { title: 'Follow-up: Prenatal', detail: 'Maria Dela Cruz missed prenatal check last week.', severity: 'High' },
  { title: 'BP Monitoring', detail: '3 seniors flagged with high BP yesterday.', severity: 'Medium' },
  { title: 'TB Treatment', detail: 'DOTS patient needs refill by Friday.', severity: 'High' },
];

export default function AlertsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Alerts & Follow-ups</h1>
          <p className="text-muted-foreground">Track urgent cases and reminders.</p>
        </div>
        <Link href="/city-health" passHref><Button variant="outline">Back</Button></Link>
      </div>
      <div className="space-y-3">
        {SAMPLE_ALERTS.map((alert) => (
          <Card key={alert.title} className="bg-slate-900/40 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg">{alert.title}</CardTitle>
              <Badge variant={alert.severity === 'High' ? 'destructive' : 'secondary'}>{alert.severity}</Badge>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-200">{alert.detail}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const SAMPLE_REPORTS = [
  { title: 'Consultations Today', value: '18', detail: '5 waiting • 3 in consult • 10 done' },
  { title: 'Maternal Health', value: '6', detail: 'Prenatal checkups scheduled' },
  { title: 'Medicine Low Stock', value: '2', detail: 'Salbutamol, Amoxicillin' },
];

export default function CityHealthReportsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">Snapshot-style reports you can print later.</p>
        </div>
        <Link href="/city-health" passHref><Button variant="outline">Back</Button></Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {SAMPLE_REPORTS.map((r) => (
          <Card key={r.title} className="bg-slate-900/40 border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg">{r.title}</CardTitle>
              <CardDescription>{r.detail}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{r.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

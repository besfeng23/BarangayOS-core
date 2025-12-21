import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const PROGRAMS = [
  { id: 'immunization', name: 'Immunization', summary: 'Routine vaccines for infants and children', next: 'Next clinic: Friday, 9AM' },
  { id: 'prenatal', name: 'Prenatal Care', summary: 'Checkups for pregnant mothers', next: '4 mothers scheduled today' },
  { id: 'senior', name: 'Senior Wellness', summary: 'BP monitoring and maintenance meds', next: 'BP drive every Monday' },
];

export default function ProgramsDashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Health Programs</h1>
          <p className="text-muted-foreground">Tap a program to view quick stats.</p>
        </div>
        <Link href="/city-health" passHref><Button variant="outline">Back</Button></Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {PROGRAMS.map((program) => (
          <Link key={program.id} href={`/city-health/programs/${program.id}`} passHref>
            <Card className="bg-slate-900/40 border-slate-800 hover:border-blue-500/50 transition-colors h-full">
              <CardHeader>
                <CardTitle>{program.name}</CardTitle>
                <CardDescription>{program.summary}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-200">{program.next}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const PROGRAM_DETAILS: Record<string, { name: string; description: string; highlights: string[] }> = {
  immunization: {
    name: 'Immunization',
    description: 'Schedule and track vaccines for children in the barangay.',
    highlights: ['12 children due this week', 'BCG & Pentavalent stock ready', 'Next barangay day: Friday'],
  },
  prenatal: {
    name: 'Prenatal Care',
    description: 'Monitor expecting mothers and schedule checkups.',
    highlights: ['4 mothers scheduled today', '2 high-risk cases flagged for MD', 'Supplements ready for distribution'],
  },
  senior: {
    name: 'Senior Wellness',
    description: 'BP monitoring, maintenance meds, and wellness checks.',
    highlights: ['8 seniors due for BP check', 'Free maintenance meds available', 'Home visit route mapped'],
  },
};

export default function ProgramDetailPage() {
  const params = useParams();
  const program = PROGRAM_DETAILS[params.programId as string];

  if (!program) {
    return (
      <div className="p-6 space-y-4">
        <p className="text-lg font-semibold">Program not found.</p>
        <Link href="/city-health/programs" passHref><Button>Back to Programs</Button></Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{program.name}</h1>
          <p className="text-muted-foreground">{program.description}</p>
        </div>
        <Link href="/city-health/programs" passHref><Button variant="outline">Back</Button></Link>
      </div>

      <Card className="bg-slate-900/40 border-slate-800">
        <CardHeader>
          <CardTitle>Today&apos;s Notes</CardTitle>
          <CardDescription>Offline-ready checklist</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {program.highlights.map((item) => (
            <div key={item} className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-sm text-slate-100">
              {item}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

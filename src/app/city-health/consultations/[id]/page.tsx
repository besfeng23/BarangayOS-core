'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';

export default function ConsultationPage() {
  const params = useParams();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Consultation</h1>
      <p className="text-muted-foreground">The consultation workflow for consultation <span className="font-mono bg-muted px-2 py-1 rounded">{params.id}</span> will be here.</p>
      <div className="mt-4">
        <Link href="/city-health/patients/patient-123" passHref><Button>Back to Patient Profile</Button></Link>
      </div>
    </div>
  );
}

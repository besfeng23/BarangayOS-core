'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';

export default function PatientProfilePage() {
  const params = useParams();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-100">Patient Profile</h1>
      <p className="text-slate-400">Details for patient <span className="font-mono bg-slate-700 px-2 py-1 rounded">{params.id}</span> will be here.</p>
      <div className="mt-4 flex gap-4">
        <Link href="/city-health/patients" passHref><Button>Back to Patients List</Button></Link>
        <Link href={`/city-health/consultations/consult-abc`} passHref><Button variant="outline">Start Consultation</Button></Link>
      </div>
    </div>
  );
}

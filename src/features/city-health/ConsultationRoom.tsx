
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, ClinicQueueItem } from '@/lib/bosDb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, User, Stethoscope, FileText, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/toast';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

const PatientHeader = ({ item }: { item: ClinicQueueItem }) => {
    const getAge = (birthdate?: string): number | string => {
        if (!birthdate) return 'N/A';
        return Math.floor((new Date().getTime() - new Date(birthdate).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
    }
    const patientName = item.patient.mode === 'resident' ? item.patient.residentNameSnapshot : item.patient.manualName;
    const age = getAge(); // Simplified
    const sex = 'N/A'; // Simplified

    return (
        <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-full">
                <User className="h-8 w-8 text-blue-400" />
            </div>
            <div>
                <h2 className="text-2xl font-bold">{patientName}</h2>
                <p className="text-muted-foreground">{age}yo • {sex} • Reason: {item.reason}</p>
            </div>
        </div>
    );
};

export function ConsultationRoom() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const id = params.id as string;

    const [subjective, setSubjective] = useState('');
    const [objective, setObjective] = useState('');
    const [assessment, setAssessment] = useState('');
    const [plan, setPlan] = useState('');
    
    const queueItem = useLiveQuery(() => db.clinic_queue.get(id), [id]);

    const handleEndConsultation = async () => {
        if (!queueItem) return;
        try {
            await db.clinic_queue.update(queueItem.id, { 
                status: 'DONE',
                updatedAtISO: new Date().toISOString(),
                // In a real app, we'd save the SOAP notes to a `consultations` table
            });
            toast({
                title: 'Consultation Finished',
                description: `${queueItem.patientName}'s consultation has been marked as done.`
            });
            router.push('/city-health/queue');
        } catch (error) {
            console.error('Failed to end consultation:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not update patient status.',
            });
        }
    };
    
    if (!queueItem) {
        return (
            <div className="p-8 text-center">
                <p>Loading consultation...</p>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <Link href="/city-health/queue" passHref>
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold">Consultation Room</h1>
                </div>
                <Button onClick={handleEndConsultation}>
                    <CheckCircle className="mr-2 h-4 w-4" /> End Consultation
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <PatientHeader item={queueItem} />
                </CardHeader>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Stethoscope className="h-5 w-5 text-green-400" />
                        SOAP Notes
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <Label htmlFor="subjective" className="text-lg font-semibold">Subjective</Label>
                        <Textarea id="subjective" placeholder="Chief complaint, history of present illness..." className="min-h-[120px] mt-2 text-base" value={subjective} onChange={e => setSubjective(e.target.value)} />
                    </div>
                     <div>
                        <Label htmlFor="objective" className="text-lg font-semibold">Objective</Label>
                        <Textarea id="objective" placeholder="Vital signs, physical exam findings..." className="min-h-[120px] mt-2 text-base" value={objective} onChange={e => setObjective(e.target.value)} />
                    </div>
                     <div>
                        <Label htmlFor="assessment" className="text-lg font-semibold">Assessment</Label>
                        <Textarea id="assessment" placeholder="Diagnosis or differential diagnoses..." className="min-h-[100px] mt-2 text-base" value={assessment} onChange={e => setAssessment(e.target.value)} />
                    </div>
                     <div>
                        <Label htmlFor="plan" className="text-lg font-semibold">Plan</Label>
                        <Textarea id="plan" placeholder="Medications, labs, referrals, follow-up..." className="min-h-[120px] mt-2 text-base" value={plan} onChange={e => setPlan(e.target.value)} />
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}

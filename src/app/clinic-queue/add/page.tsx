'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { ResidentPicker, ResidentPickerValue } from '@/components/shared/ResidentPicker';
import { useToast } from '@/components/ui/toast';
import { db } from '@/lib/bosDb';
import { toTokens } from '@/lib/bos/searchTokens';
import { uuid } from '@/lib/uuid';

export default function AddToQueuePage() {
    const [patient, setPatient] = useState<ResidentPickerValue | undefined>(undefined);
    const [reason, setReason] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const canSave = (patient?.mode === 'resident' || (patient?.mode === 'manual' && patient?.manualName)) && reason;

    const getPatientName = () => {
        if (!patient) return '';
        return patient.mode === 'resident' ? patient.residentNameSnapshot : patient.manualName;
    }

    const handleSave = async () => {
        if (!canSave) return;
        setSaving(true);
        try {
            const nowISO = new Date().toISOString();
            const newItem = {
                id: uuid(),
                createdAtISO: nowISO,
                updatedAtISO: nowISO,
                patient: patient!,
                patientName: getPatientName()!,
                reason: reason,
                status: 'WAITING',
                tags: tags,
                searchTokens: toTokens(`${getPatientName()} ${reason}`),
                synced: 0,
            };

            await db.clinic_queue.add(newItem as any);
            
            toast({
                title: 'Patient Added to Queue',
                description: `${getPatientName()} is now waiting for triage.`
            });
            router.push('/city-health/queue');

        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Failed to add patient',
                description: 'An error occurred while saving the data.'
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/city-health/queue" passHref>
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">Add Patient to Queue</h1>
                    <p className="text-muted-foreground">Register a patient for today's consultation.</p>
                </div>
            </div>

            <Card className="max-w-2xl mx-auto bg-slate-800/50 border-slate-700">
                <CardHeader>
                    <CardTitle>Patient Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <ResidentPicker
                        label="Patient"
                        value={patient}
                        onChange={setPatient}
                        placeholder="Search for resident or enter name manually"
                        allowManual={true}
                    />

                    <div>
                        <label className="text-lg font-medium mb-2 block">Reason for Visit / Chief Complaint</label>
                        <Textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="e.g., Fever and cough for 3 days..."
                            className="min-h-[100px] text-lg bg-slate-900 border-slate-700"
                        />
                    </div>
                     <div>
                        <label className="text-lg font-medium mb-2 block">Tags (Optional)</label>
                        <p className="text-sm text-muted-foreground mb-2">Select all that apply.</p>
                        <div className="flex flex-wrap gap-2">
                            {['Fever', 'Cough', 'Follow-up', 'Prenatal', 'Child', 'Senior'].map(tag => (
                                <Button
                                    key={tag}
                                    variant={tags.includes(tag) ? 'secondary' : 'outline'}
                                    onClick={() => setTags(prev => 
                                        prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                                    )}
                                >
                                    {tag}
                                </Button>
                            ))}
                        </div>
                    </div>


                    <Button onClick={handleSave} disabled={!canSave || saving} size="lg" className="w-full h-14 text-xl">
                        {saving ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : null}
                        {saving ? 'Adding to Queue...' : 'Add Patient to Queue'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

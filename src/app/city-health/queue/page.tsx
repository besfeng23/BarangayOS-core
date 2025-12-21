
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Filter, ArrowLeft, ArrowDownUp, Users, Stethoscope, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, ClinicQueueItem } from '@/lib/bosDb';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toast';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ResidentPicker, ResidentPickerValue } from '@/components/shared/ResidentPicker';
import { z } from 'zod';
import { useMemo, useState } from 'react';
import { toTokens } from '@/lib/bos/searchTokens';
import { uuid } from '@/lib/uuid';

const TAG_OPTIONS = ['Fever', 'Cough', 'Prenatal', 'Follow-up', 'Senior', 'Child'];

const queueFormSchema = z.object({
  patient: z.object({
    mode: z.enum(['resident', 'manual']),
    residentId: z.string().nullable().optional(),
    residentNameSnapshot: z.string().optional(),
    manualName: z.string().optional(),
  }),
  reason: z.string().min(5, 'Lagyan ng detalye ang pakay o sintomas (min 5 chars).'),
  tags: z.array(z.string()).optional(),
}).refine((val) => {
  if (!val.patient) return false;
  if (val.patient.mode === 'resident') {
    return Boolean(val.patient.residentId && val.patient.residentNameSnapshot);
  }
  return Boolean(val.patient.manualName && val.patient.manualName.trim().length > 1);
}, { path: ['patient'], message: 'Pumili ng pasyente o ilagay ang pangalan.' });

const QueueCard = ({ item }: { item: ClinicQueueItem }) => {
    const router = useRouter();
    const { toast } = useToast();

    const getAge = (birthdate?: string): number | string => {
        if (!birthdate) return 'N/A';
        return Math.floor((new Date().getTime() - new Date(birthdate).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
    }

    const patientName = item.patient?.mode === 'resident'
        ? (item.patient.residentNameSnapshot || item.patientName)
        : (item.patient?.manualName || item.patientName);
    const age = item.patient?.mode === 'resident' ? 'N/A' : getAge(); // Simplified for now
    const sex = item.patient?.mode === 'resident' ? 'N/A' : 'N/A'; // Simplified for now

    const handleStartConsult = async () => {
        try {
            await db.clinic_queue.update(item.id, { status: 'CONSULT' });
            toast({
                title: 'Consultation Started',
                description: `${patientName} has been moved to the "In Consult" queue.`,
            });
            router.push(`/city-health/consultations/${item.id}`);
        } catch (error) {
            console.error("Failed to start consultation:", error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not update the patient status.',
            });
        }
    };
    
    return (
        <Card className="bg-slate-800/50 border-slate-700 mb-4">
            <CardContent className="p-4 flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <h3 className="text-lg font-bold">{patientName}</h3>
                        <Badge variant={item.status === 'WAITING' ? 'default' : item.status === 'CONSULT' ? 'secondary' : 'outline'}>
                            {item.status}
                        </Badge>
                    </div>
                    <p className="text-sm text-slate-400">{age}yo • {sex}</p>
                    <div className="flex gap-2 mt-2">
                        {(item.tags || []).map(tag => <Badge key={tag} variant="destructive" className="text-xs min-h-[32px] px-2">{tag}</Badge>)}
                    </div>
                    {/* {vitals && <p className="text-xs text-green-400 mt-2 font-mono">{vitals}</p>} */}
                </div>
                <div className="flex gap-2 self-end md:self-center">
                    <Button variant="outline" size="sm" className="min-h-[44px]">Record Vitals</Button>
                    {item.status === 'WAITING' && <Button size="sm" className="min-h-[44px]" onClick={handleStartConsult}>Start Consult</Button>}
                </div>
            </CardContent>
        </Card>
    );
};

export default function QueuePage() {
    const queue = useLiveQuery(() => db.clinic_queue.orderBy('createdAtISO').toArray(), []);
    const { toast } = useToast();
    const [patient, setPatient] = useState<ResidentPickerValue | undefined>(undefined);
    const [reason, setReason] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [formErrors, setFormErrors] = useState<{ patient?: string; reason?: string }>({});
    const [saving, setSaving] = useState(false);

    const waiting = queue?.filter(p => p.status === 'WAITING') || [];
    const inConsult = queue?.filter(p => p.status === 'CONSULT') || [];
    const done = queue?.filter(p => p.status === 'DONE') || [];

    const tagOptions = useMemo(() => TAG_OPTIONS, []);
    const canAdd = useMemo(() => {
        if (!patient || !reason.trim()) return false;
        if (patient.mode === 'resident') {
            return Boolean(patient.residentId && patient.residentNameSnapshot) && reason.trim().length >= 5;
        }
        return Boolean(patient.manualName && patient.manualName.trim().length > 1) && reason.trim().length >= 5;
    }, [patient, reason]);

    const resetForm = () => {
        setPatient(undefined);
        setReason('');
        setTags([]);
        setFormErrors({});
    };

    const handleAddToQueue = async () => {
        const parsed = queueFormSchema.safeParse({ patient, reason, tags });
        if (!parsed.success) {
            const flat = parsed.error.flatten();
            setFormErrors({
                patient: flat.fieldErrors.patient?.[0],
                reason: flat.fieldErrors.reason?.[0],
            });
            return;
        }
        setSaving(true);
        try {
            const nowISO = new Date().toISOString();
            const patientName = parsed.data.patient.mode === 'resident'
                ? parsed.data.patient.residentNameSnapshot!
                : parsed.data.patient.manualName!.trim();

            const newItem: ClinicQueueItem = {
                id: uuid(),
                createdAtISO: nowISO,
                updatedAtISO: nowISO,
                patient: parsed.data.patient as ResidentPickerValue,
                patientName,
                reason: parsed.data.reason.trim(),
                status: 'WAITING',
                tags: parsed.data.tags || [],
                searchTokens: toTokens(`${patientName} ${parsed.data.reason}`),
                synced: 0,
            };

            await db.clinic_queue.add(newItem as any);
            toast({
                title: 'Naidagdag sa pila',
                description: `${patientName} is now in the waiting queue.`,
            });
            resetForm();
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Save failed',
                description: 'We could not add this patient. Please try again.',
            });
        } finally {
            setSaving(false);
        }
    };


  return (
    <div className="flex flex-col h-screen bg-slate-900 text-gray-200">
        <header className="flex items-center justify-between p-4 border-b border-slate-700 sticky top-0 bg-slate-900/80 backdrop-blur-lg z-10">
            <Link href="/city-health" passHref>
                <Button variant="ghost" size="icon"><ArrowLeft /></Button>
            </Link>
            <h1 className="text-2xl font-bold">Today's Clinic Queue</h1>
            <div className="flex items-center gap-2">
                <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> Filters</Button>
                <Button variant="outline"><ArrowDownUp className="mr-2 h-4 w-4" /> Sort</Button>
            </div>
        </header>

        <main className="flex-1 overflow-y-auto">
            <div className="p-4">
                <Card className="border-slate-700 bg-slate-900/40">
                    <CardContent className="space-y-4 pt-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-200">
                                <Stethoscope className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-300 font-semibold">Add a patient to Today&apos;s Queue</p>
                                <p className="text-xs text-slate-400">Offline-first entry. You can type a name or pick a resident.</p>
                            </div>
                        </div>
                        <ResidentPicker
                            label="Patient"
                            value={patient}
                            onChange={setPatient}
                            placeholder="Search resident or enter manually"
                            allowManual
                            errorMessage={formErrors.patient}
                        />
                        {formErrors.patient && <p className="text-sm text-red-400" data-field="patient-error">{formErrors.patient}</p>}
                        <div className="space-y-2" data-field="reason">
                            <label className="text-xs text-slate-300 uppercase font-semibold">Reason / Concern *</label>
                            <Textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="min-h-[96px] bg-slate-950 border-slate-700"
                                placeholder="Hal: Lagnat at ubo for 3 days..."
                            />
                            {formErrors.reason && <p className="text-sm text-red-400">{formErrors.reason}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-slate-300 uppercase font-semibold">Tags</label>
                            <div className="flex flex-wrap gap-2">
                                {tagOptions.map(tag => (
                                    <Button
                                        key={tag}
                                        variant={tags.includes(tag) ? 'secondary' : 'outline'}
                                        size="sm"
                                        className="min-h-[44px] px-4"
                                        onClick={() => setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
                                    >
                                        {tag}
                                    </Button>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <Button
                                className="min-h-[48px] sm:w-auto w-full"
                                onClick={handleAddToQueue}
                                disabled={!canAdd || saving}
                            >
                                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                                {saving ? 'Saving...' : 'Add to Queue'}
                            </Button>
                            <Button variant="ghost" className="min-h-[48px] sm:w-auto w-full" onClick={resetForm} disabled={saving}>
                                Clear Form
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <Tabs defaultValue="waiting" className="w-full">
                <TabsList className="grid w-full grid-cols-3 sticky top-[73px] z-10 rounded-none">
                    <TabsTrigger value="waiting">Waiting ({waiting.length})</TabsTrigger>
                    <TabsTrigger value="in-consult">In Consult ({inConsult.length})</TabsTrigger>
                    <TabsTrigger value="done">Done ({done.length})</TabsTrigger>
                </TabsList>
                <div className="p-4">
                    <TabsContent value="waiting">
                        {waiting.length === 0 && <p className="text-muted-foreground text-center py-8">No patients waiting.</p>}
                        {waiting.map(p => (
                            <QueueCard key={p.id} item={p} />
                        ))}
                    </TabsContent>
                    <TabsContent value="in-consult">
                        {inConsult.length === 0 && <p className="text-muted-foreground text-center py-8">No patients in consultation.</p>}
                        {inConsult.map(p => (
                             <QueueCard key={p.id} item={p} />
                        ))}
                    </TabsContent>
                    <TabsContent value="done">
                         {done.length === 0 && <p className="text-muted-foreground text-center py-8">No patients have finished consultation.</p>}
                         {done.map(p => (
                            <QueueCard key={p.id} item={p} />
                         ))}
                    </TabsContent>
                </div>
            </Tabs>
        </main>
        <footer className="flex md:hidden items-center justify-around p-2 border-t border-slate-700 sticky bottom-0 bg-slate-900/80 backdrop-blur-lg z-10">
            <Link href="/city-health" passHref>
                <Button variant="ghost" className="flex flex-col h-auto">
                    <Users className="h-6 w-6"/>
                    <span className="text-xs">Dashboard</span>
                </Button>
            </Link>
            <Link href="/city-health/queue" passHref>
                <Button variant="ghost" className="flex flex-col h-auto text-blue-400">
                    <Users className="h-6 w-6"/>
                    <span className="text-xs">Queue</span>
                </Button>
            </Link>
            <Link href="/city-health/patients" passHref>
                <Button variant="ghost" className="flex flex-col h-auto">
                    <Users className="h-6 w-6"/>
                    <span className="text-xs">Patients</span>
                </Button>
            </Link>
        </footer>

    </div>
  );
}

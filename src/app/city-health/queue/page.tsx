
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Filter, ArrowLeft, ArrowDownUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/bosDb';

const QueueCard = ({ name, age, sex, status, tags, vitals }: { name: string, age: number, sex: string, status: 'waiting' | 'in-consult' | 'done', tags: string[], vitals?: string }) => (
    <Card className="bg-slate-800/50 border-slate-700 mb-4">
        <CardContent className="p-4 flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold">{name}</h3>
                    <Badge variant={status === 'waiting' ? 'default' : status === 'in-consult' ? 'secondary' : 'outline'}>
                        {status.toUpperCase()}
                    </Badge>
                </div>
                <p className="text-sm text-slate-400">{age}yo • {sex}</p>
                <div className="flex gap-2 mt-2">
                    {tags.map(tag => <Badge key={tag} variant="destructive" className="text-xs">{tag}</Badge>)}
                </div>
                {vitals && <p className="text-xs text-green-400 mt-2 font-mono">{vitals}</p>}
            </div>
            <div className="flex gap-2 self-end md:self-center">
                <Button variant="outline" size="sm">Record Vitals</Button>
                <Button size="sm">Start Consult</Button>
            </div>
        </CardContent>
    </Card>
);

export default function QueuePage() {
    const queue = useLiveQuery(() => db.clinic_queue.orderBy('createdAtISO').toArray(), []);

    const waiting = queue?.filter(p => p.status === 'WAITING') || [];
    const inConsult = queue?.filter(p => p.status === 'CONSULT') || [];
    const done = queue?.filter(p => p.status === 'DONE') || [];


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
                            <QueueCard key={p.id} name={p.patientName} age={30} sex="M" status="waiting" tags={p.tags} />
                        ))}
                    </TabsContent>
                    <TabsContent value="in-consult">
                        {inConsult.length === 0 && <p className="text-muted-foreground text-center py-8">No patients in consultation.</p>}
                        {inConsult.map(p => (
                             <QueueCard key={p.id} name={p.patientName} age={45} sex="M" status="in-consult" tags={p.tags} vitals="Temp: 38.1°C" />
                        ))}
                    </TabsContent>
                    <TabsContent value="done">
                         {done.length === 0 && <p className="text-muted-foreground text-center py-8">No patients have finished consultation.</p>}
                         {done.map(p => (
                            <QueueCard key={p.id} name={p.patientName} age={25} sex="F" status="done" tags={p.tags} vitals="Weight: 12kg" />
                         ))}
                    </TabsContent>
                </div>
            </Tabs>
        </main>

        <Link href="/city-health/queue/add" passHref legacyBehavior>
            <a className="fixed bottom-6 right-6 z-20">
                <Button className="rounded-full w-16 h-16 shadow-lg">
                    <Plus className="h-8 w-8" />
                </Button>
            </a>
        </Link>
    </div>
  );
}

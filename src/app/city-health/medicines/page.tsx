import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const SAMPLE_STOCK = [
  { name: 'Paracetamol 500mg', stock: 120, status: 'OK', notes: 'For fever/pain' },
  { name: 'Amoxicillin 500mg', stock: 34, status: 'Low', notes: 'Antibiotic - check expiry' },
  { name: 'ORS Sachet', stock: 200, status: 'OK', notes: 'For diarrhea' },
  { name: 'Salbutamol Nebule', stock: 12, status: 'Critical', notes: 'Asthma rescue' },
];

export default function MedicinesPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Medicine Inventory</h1>
          <p className="text-muted-foreground">Offline-friendly stock board with quick status badges.</p>
        </div>
        <Link href="/city-health" passHref><Button variant="outline">Back</Button></Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {SAMPLE_STOCK.map((item) => (
          <Card key={item.name} className="bg-slate-900/40 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg">{item.name}</CardTitle>
              <Badge variant={item.status === 'OK' ? 'secondary' : item.status === 'Low' ? 'destructive' : 'outline'}>
                {item.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm text-slate-200">On-hand: <strong>{item.stock}</strong> pcs</CardDescription>
              <p className="text-xs text-slate-400 mt-2">{item.notes}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

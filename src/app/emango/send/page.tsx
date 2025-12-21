
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ResidentPicker, ResidentPickerValue } from '@/components/shared/ResidentPicker';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toast';
import { useRouter } from 'next/navigation';
import { writeActivity } from '@/lib/bos/activity/writeActivity';
import { Loader2 } from 'lucide-react';

const ActionButton = ({ href, icon: Icon, title, description, disabled = false }: { href?: string, icon: React.ElementType, title: string, description: string, disabled?: boolean, onClick?: () => void }) => {
    const content = (
        <div className={`p-4 rounded-lg transition-colors flex items-center gap-4 h-full ${disabled ? 'bg-zinc-800/20 opacity-50 cursor-not-allowed' : 'bg-zinc-800/50 hover:bg-zinc-800 cursor-pointer'}`}>
            <div className={`p-3 rounded-md ${disabled ? 'bg-zinc-700/20' : 'bg-zinc-700/50'}`}>
                <Icon className={`h-6 w-6 ${disabled ? 'text-zinc-500' : 'text-blue-400'}`} />
            </div>
            <div>
                <h3 className={`font-semibold text-lg ${disabled ? 'text-zinc-500' : ''}`}>{title}</h3>
                <p className={`text-sm ${disabled ? 'text-zinc-600' : 'text-zinc-400'}`}>{description}</p>
            </div>
        </div>
    );
    if(href) return disabled ? <div>{content}</div> : <Link href={href} passHref>{content}</Link>;
    return <button onClick={disabled ? undefined : () => {}} className="w-full text-left">{content}</button>
};

export default function SendPage() {
  const [resident, setResident] = useState<ResidentPickerValue | undefined>(undefined);
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const canDisburse = resident && amount && parseFloat(amount) > 0 && purpose;

  const handleDisburse = async () => {
    if (!canDisburse) return;
    setIsSubmitting(true);
    try {
        await writeActivity({
            type: 'PAYMENT_DISBURSED',
            entityType: 'emango',
            entityId: `disburse-${Date.now()}`,
            status: 'ok',
            title: 'Funds Disbursed',
            subtitle: `₱${parseFloat(amount).toFixed(2)} to ${resident.mode === 'resident' ? resident.residentNameSnapshot : resident.manualName} for ${purpose}`,
        } as any);

        toast({
            title: "Disbursement Recorded",
            description: `A disbursement of ₱${parseFloat(amount).toFixed(2)} has been logged.`
        });
        
        // Reset form
        setResident(undefined);
        setAmount('');
        setPurpose('');
    } catch(e) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to record disbursement.' });
    } finally {
        setIsSubmitting(false);
    }
  };
    
  return (
    <div className="p-4 sm:p-6 lg:p-8">
       <div className="flex items-center gap-4 mb-8">
          <Link href="/emango" passHref>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Disbursement Hub</h1>
            <p className="text-muted-foreground">Send funds to residents for aid, payroll, or other purposes.</p>
          </div>
        </div>
      
        <Card className="max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle>Send to Single Resident</CardTitle>
                <CardDescription>Manually disburse funds to an individual.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <ResidentPicker label="Recipient" value={resident} onChange={setResident} allowManual={true} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="amount" className="text-lg">Amount (₱)</Label>
                        <Input id="amount" type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="h-12 text-lg text-right" />
                    </div>
                    <div className="space-y-2">
                         <Label htmlFor="purpose" className="text-lg">Purpose / Notes</Label>
                        <Input id="purpose" placeholder="e.g., Financial Aid" value={purpose} onChange={(e) => setPurpose(e.target.value)} className="h-12 text-lg" />
                    </div>
                </div>

                 <Button onClick={handleDisburse} disabled={!canDisburse || isSubmitting} size="lg" className="w-full h-14 text-xl">
                    {isSubmitting ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <Send className="mr-2 h-6 w-6" />}
                    {isSubmitting ? 'Recording...' : 'Record Disbursement'}
                </Button>
            </CardContent>
        </Card>
    </div>
  );
}

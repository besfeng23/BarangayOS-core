
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ArrowLeft, QrCode } from 'lucide-react';
import Image from 'next/image';
import { ResidentPicker, ResidentPickerValue } from '@/components/shared/ResidentPicker';
import { writeActivity } from '@/lib/bos/activity/writeActivity';
import { useToast } from '@/components/ui/toast';
import { useRouter } from 'next/navigation';

const feeSchedule = {
    cedula: 50.00,
    clearance: 75.00,
    'permit-fee': 500.00,
    rental: 1000.00,
    other: 0.00,
} as const;

type ServiceType = keyof typeof feeSchedule;

export default function CollectPage() {
  const [amount, setAmount] = useState('');
  const [service, setService] = useState<ServiceType | ''>('');
  const [resident, setResident] = useState<ResidentPickerValue | undefined>(undefined);
  const [showQRModal, setShowQRModal] = useState(false);
  const { toast } = useToast();
  const router = useRouter();


  const payerName = resident?.mode === 'resident' ? resident.residentNameSnapshot : resident?.manualName;
  const canGenerate = useMemo(() => {
    const parsedAmount = parseFloat(amount);
    return payerName && service && !isNaN(parsedAmount) && parsedAmount > 0;
  }, [payerName, service, amount]);

  const handleServiceChange = (value: ServiceType) => {
    setService(value);
    const fee = feeSchedule[value];
    if (fee > 0) {
        setAmount(fee.toFixed(2));
    } else {
        setAmount('');
    }
  }

  const handleGenerateQR = () => {
    if (canGenerate) {
      setShowQRModal(true);
    }
  };

  const handleTransactionComplete = async () => {
    if (!canGenerate) return;

    await writeActivity({
        type: 'PAYMENT_COLLECTED',
        entityType: 'emango',
        entityId: `collect-${Date.now()}`,
        status: 'ok',
        title: 'Payment Collected',
        subtitle: `₱${parseFloat(amount).toFixed(2)} for ${service} from ${payerName}`,
    } as any);
    
    toast({
        title: "Payment Logged",
        description: `Collection of ₱${parseFloat(amount).toFixed(2)} for ${service} has been recorded.`
    });
    
    resetForm();
  };

  const resetForm = () => {
    setAmount('');
    setService('');
    setResident(undefined);
    setShowQRModal(false);
  }

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/emango" passHref>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Collect Payment</h1>
            <p className="text-muted-foreground">Generate a QR code for a resident to pay.</p>
          </div>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Transaction Details</CardTitle>
            <CardDescription>Enter the details for this collection.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ResidentPicker 
              label="Payer"
              value={resident}
              onChange={setResident}
              placeholder="Search for resident or enter name"
              allowManual={true}
            />
            {!payerName && <p className="text-sm text-yellow-400 mt-1">Please select or enter a payer to continue.</p>}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="service" className="text-lg">Service / Fee</Label>
                 <Select onValueChange={(v) => handleServiceChange(v as ServiceType)} value={service}>
                    <SelectTrigger className="h-12 text-lg">
                        <SelectValue placeholder="Select service..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="cedula">Cedula</SelectItem>
                        <SelectItem value="clearance">Barangay Clearance</SelectItem>
                        <SelectItem value="permit-fee">Business Permit Fee</SelectItem>
                        <SelectItem value="rental">Facility Rental</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                </Select>
                 {!service && <p className="text-sm text-yellow-400 mt-1">Please select a service.</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-lg">Amount (₱)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-12 text-lg text-right"
                  min="0.01"
                  step="0.01"
                />
                 {service && parseFloat(amount) <= 0 && <p className="text-sm text-yellow-400 mt-1">Enter a valid amount.</p>}
              </div>
            </div>

            <Button onClick={handleGenerateQR} disabled={!canGenerate} size="lg" className="w-full h-14 text-xl">
              <QrCode className="mr-2 h-6 w-6" />
              Generate QR
            </Button>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">Scan to Pay</DialogTitle>
            <DialogDescription className="text-center">
              Have {payerName || 'the resident'} scan this QR code. Once paid, tap "Done" to log the transaction.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6 space-y-4">
            <div className="bg-white p-4 rounded-lg">
                 <Image
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=payment-for-${service}-amount-${amount}`}
                    alt="Payment QR Code"
                    width={250}
                    height={250}
                 />
            </div>
            <div className="text-center">
                <p className="text-lg">Service: <span className="font-bold capitalize">{service?.replace('-', ' ')}</span></p>
                <p className="text-3xl font-bold">₱{parseFloat(amount || '0').toFixed(2)}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQRModal(false)}>Cancel</Button>
            <Button onClick={handleTransactionComplete}>Done (Log Transaction)</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

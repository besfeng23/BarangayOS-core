'use client';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Phone, Shield } from 'lucide-react';

export default function ActivationPage() {
  const steps = [
    "Confirm barangay details and sign-off contact.",
    "Send device serial + barangay ID to support.",
    "Wait for activation code then restart the terminal.",
  ];

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-full bg-amber-500/20 text-amber-200">
          <Shield className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Activate Your Terminal</h1>
          <p className="text-sm text-muted-foreground">Follow these steps to lift trial limits and sync securely.</p>
        </div>
      </div>

      <Card className="bg-zinc-900/40 border-zinc-800">
        <CardHeader>
          <CardTitle>3-Step Activation Guide</CardTitle>
          <CardDescription>Offline friendly. You can start these steps even without internet.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="list-decimal list-inside space-y-2 text-sm text-zinc-200">
            {steps.map((step, idx) => (
              <li key={idx} className="pl-1">{step}</li>
            ))}
          </ol>
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-100 text-sm flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Keep the app open so queued data can sync after activation.
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button asChild variant="secondary" className="min-h-[48px]">
              <Link href="/settings">Update Barangay Profile</Link>
            </Button>
            <Button asChild className="min-h-[48px]">
              <a href="mailto:activate@barangayos.app">Email Activation Desk</a>
            </Button>
            <Button variant="outline" className="min-h-[48px]" asChild>
              <a href="tel:+63450000000"><Phone className="h-4 w-4 mr-2" />Call Support</a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="text-sm text-zinc-400">
        Need help? Message support with your terminal code and latest sync status.
      </div>
    </div>
  );
}

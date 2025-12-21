"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';

export default function CityHealthSettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [autoQueue, setAutoQueue] = useState(false);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Quick toggles for the City Health module.</p>
        </div>
        <Link href="/city-health" passHref><Button variant="outline">Back</Button></Link>
      </div>

      <Card className="bg-slate-900/40 border-slate-800">
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Offline-safe toggles (saved locally).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-100">Send push reminders</p>
              <p className="text-sm text-slate-400">Notify health staff about follow-ups.</p>
            </div>
            <Switch checked={notifications} onCheckedChange={setNotifications} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-100">Auto-move to queue</p>
              <p className="text-sm text-slate-400">New walk-ins go to WAITING by default.</p>
            </div>
            <Switch checked={autoQueue} onCheckedChange={setAutoQueue} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

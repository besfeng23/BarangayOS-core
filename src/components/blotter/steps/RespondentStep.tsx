"use client";

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

export default function RespondentStep() {
    const [isUnknown, setIsUnknown] = useState(false);

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Respondent Information</CardTitle>
          <CardDescription>
            Enter the details of the person being reported.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="flex items-center space-x-2">
                <Checkbox id="unknown-suspect" checked={isUnknown} onCheckedChange={(checked) => setIsUnknown(checked as boolean)} />
                <Label htmlFor="unknown-suspect">Suspect is Unknown / John Doe</Label>
            </div>

            {!isUnknown ? (
                 <div className="space-y-4">
                    <div className="grid sm:grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="resp-last-name">Last Name</Label>
                            <Input id="resp-last-name" placeholder="Penduko" className="mt-1" />
                        </div>
                         <div>
                            <Label htmlFor="resp-first-name">First Name</Label>
                            <Input id="resp-first-name" placeholder="Pedro" className="mt-1" />
                        </div>
                         <div>
                            <Label htmlFor="resp-middle-name">Middle Name</Label>
                            <Input id="resp-middle-name" placeholder="Reyes" className="mt-1" />
                        </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                         <div>
                            <Label htmlFor="resp-contact">Contact Number</Label>
                            <Input id="resp-contact" placeholder="0918..." className="mt-1" />
                        </div>
                         <div>
                            <Label htmlFor="resp-address">Address</Label>
                            <Input id="resp-address" placeholder="Purok 3, Brgy. Central" className="mt-1" />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <CardTitle className="text-lg">Physical Description</CardTitle>
                    <div className="grid sm:grid-cols-3 gap-4">
                         <div>
                            <Label htmlFor="height">Height</Label>
                            <Input id="height" placeholder="e.g., 5'7&quot;" className="mt-1" />
                        </div>
                        <div>
                            <Label htmlFor="weight">Weight</Label>
                            <Input id="weight" placeholder="e.g., 70kg" className="mt-1" />
                        </div>
                        <div>
                            <Label htmlFor="tattoos">Identifying Marks</Label>
                            <Input id="tattoos" placeholder="e.g., Dragon tattoo on left arm" className="mt-1" />
                        </div>
                    </div>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}

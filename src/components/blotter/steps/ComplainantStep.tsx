import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function ComplainantStep() {
  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Complainant Information</CardTitle>
          <CardDescription>
            Enter the details of the person reporting the incident.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
                <div>
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input id="last-name" placeholder="Dela Cruz" className="mt-1" />
                </div>
                 <div>
                    <Label htmlFor="first-name">First Name</Label>
                    <Input id="first-name" placeholder="Juan" className="mt-1" />
                </div>
                 <div>
                    <Label htmlFor="middle-name">Middle Name</Label>
                    <Input id="middle-name" placeholder="Santos" className="mt-1" />
                </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
                 <div>
                    <Label htmlFor="contact">Contact Number</Label>
                    <Input id="contact" placeholder="0917..." className="mt-1" />
                </div>
                 <div>
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" placeholder="Purok 3, Brgy. Central" className="mt-1" />
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

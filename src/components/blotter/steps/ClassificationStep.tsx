import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Clock } from 'lucide-react';
import type { IncidentType, Jurisdiction } from '@/app/blotter/page';

interface ClassificationStepProps {
    incidentType: IncidentType | '';
    onIncidentTypeChange: (type: IncidentType) => void;
    jurisdiction: Jurisdiction;
}

export default function ClassificationStep({ incidentType, onIncidentTypeChange, jurisdiction }: ClassificationStepProps) {
    
    const MediationTimeline = () => (
        <div className="space-y-4">
             <Alert>
                <Clock className="h-4 w-4" />
                <AlertTitle>KP Law: 15-15-30 Day Timeline</AlertTitle>
                <AlertDescription>
                    The barangay has a non-extendable period to resolve disputes.
                </AlertDescription>
            </Alert>
            <div>
                <Label>Mediation Period (15 Days)</Label>
                <Progress value={20} className="mt-1" />
                <p className="text-xs text-muted-foreground mt-1">Day 3 of 15</p>
            </div>
             <div>
                <Label>Conciliation Period (15 Days)</Label>
                <Progress value={0} className="mt-1" />
                 <p className="text-xs text-muted-foreground mt-1">Day 0 of 15</p>
            </div>
        </div>
    );

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Case Classification</CardTitle>
          <CardDescription>
            Start by classifying the incident. This determines the case workflow and required information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="incident-type">Nature of Incident</Label>
              <Select value={incidentType} onValueChange={(value) => onIncidentTypeChange(value as IncidentType)}>
                <SelectTrigger id="incident-type" className="mt-1">
                  <SelectValue placeholder="Select incident type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Amicable">Amicable Settlement</SelectItem>
                  <SelectItem value="Theft">Theft / Robbery</SelectItem>
                  <SelectItem value="VAWC">VAWC (Violence Against Women & Children)</SelectItem>
                  <SelectItem value="Rape">Rape</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {jurisdiction === 'barangay' && (
            <MediationTimeline />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

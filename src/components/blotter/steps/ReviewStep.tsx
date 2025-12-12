import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ReviewStep() {
  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Review and Submit</CardTitle>
          <CardDescription>
            Please review all the information carefully before submitting the report.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            {/* Placeholder for showing all collected data */}
            <div className="p-8 border border-dashed rounded-lg text-center">
                <p className="text-muted-foreground">All case details will be summarized here for final review.</p>
            </div>
             <Button size="lg" className="w-full">
                File Incident Report
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}

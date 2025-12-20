
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ArrowLeft, UploadCloud } from 'lucide-react';

export default function DisburseAidPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
       <div className="flex items-center gap-4 mb-8">
          <Link href="/emango/send" passHref>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Disburse Aid Batch</h1>
            <p className="text-muted-foreground">Create and manage aid disbursement batches.</p>
          </div>
        </div>

        <Card className="max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle>Create New Batch</CardTitle>
                <CardDescription>Upload a CSV file with resident IDs and amounts to create a new disbursement batch.</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-16 border-2 border-dashed border-zinc-700 rounded-lg">
                <div className="mx-auto h-12 w-12 text-zinc-500">
                    <UploadCloud className="h-full w-full" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">CSV Upload (Coming Soon)</h3>
                <p className="mt-1 text-sm text-muted-foreground">The UI for uploading, validating, and approving batches will be here.</p>
                <Button variant="secondary" className="mt-6" disabled>Select File</Button>
            </CardContent>
        </Card>
    </div>
  );
}

'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useParams, useRouter } from 'next/navigation';
import { allJobs, Job } from '@/app/jobs/_data/jobs';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { writeActivity } from '@/lib/bos/activity/writeActivity';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function ApplyPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const jobId = params.jobId as string;
  const job = allJobs.find(j => j.id === jobId);

  if (!job) {
    notFound();
  }

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
        await writeActivity({
            type: 'JOB_APPLICATION_SUBMITTED',
            entityType: 'jobs',
            entityId: job.id,
            status: 'ok',
            title: 'Application Submitted',
            subtitle: `For job: ${job.title}`,
        } as any);

        toast({
            title: 'Application Submitted!',
            description: `Your application for ${job.title} has been received.`,
        });

        router.push('/applications');

    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Submission Failed',
            description: 'There was an error submitting your application. Please try again.',
        });
        setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl">Confirm Your Application</CardTitle>
                <CardDescription>
                    You are applying for the position of:
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="p-4 bg-slate-800 rounded-lg">
                    <p className="text-xl font-bold">{job.title}</p>
                    <p className="text-slate-400">{job.companyName}</p>
                </div>
                <p className="text-sm text-slate-400">
                    By clicking "Submit Application", your profile will be shared with the employer. This is a simplified process for V1. In a future version, you will be able to attach a resume and other documents.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <Link href={`/jobs/${jobId}`} passHref className="w-full sm:w-auto">
                        <Button variant="outline" className="w-full">Cancel</Button>
                    </Link>
                    <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full sm:w-auto">
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSubmitting ? 'Submitting...' : 'Submit Application'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}

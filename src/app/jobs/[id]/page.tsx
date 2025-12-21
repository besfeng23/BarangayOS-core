
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';
import { allJobs, Job } from '../_data/jobs';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { MapPin, Briefcase, Clock, Building, ArrowLeft, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function JobDetailsPage() {
  const params = useParams();
  const jobId = params.id as string;
  const job = allJobs.find(j => j.id === jobId);

  if (!job) {
    notFound();
  }

  return (
    <div>
        <Link href="/jobs" className="inline-flex items-center gap-2 text-slate-300 hover:text-white mb-8">
            <ArrowLeft className="h-4 w-4" />
            Back to All Jobs
        </Link>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
                <header>
                    <div className="flex items-center gap-4 mb-2">
                        {job.urgent && <Badge variant="destructive">Urgent</Badge>}
                        <p className="text-sm text-slate-400">Posted on {new Date(job.postedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    <h1 className="text-4xl font-extrabold">{job.title}</h1>
                    <div className="flex items-center gap-2 text-xl text-slate-300 mt-2">
                        <Building className="h-5 w-5" />
                        <span>{job.companyName}</span>
                    </div>
                </header>

                <section>
                    <p className="text-lg text-slate-300">{job.description}</p>
                </section>
                
                <section>
                    <h2 className="text-2xl font-bold mb-4">Responsibilities</h2>
                    <ul className="space-y-2 list-disc list-inside text-slate-300">
                        {job.responsibilities.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                </section>
                
                <section>
                    <h2 className="text-2xl font-bold mb-4">Requirements</h2>
                    <ul className="space-y-2 list-disc list-inside text-slate-300">
                        {job.requirements.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                </section>

            </div>

            <aside className="space-y-6">
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <CardTitle>Job Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-slate-300">
                        <div className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 mt-1 flex-shrink-0" />
                            <div>
                                <p className="font-semibold">Location</p>
                                <p>{job.location}</p>
                            </div>
                        </div>
                         <div className="flex items-start gap-3">
                            <Briefcase className="h-5 w-5 mt-1 flex-shrink-0" />
                            <div>
                                <p className="font-semibold">Job Type</p>
                                <p>{job.type}</p>
                            </div>
                        </div>
                         <div className="flex items-start gap-3">
                            <Clock className="h-5 w-5 mt-1 flex-shrink-0" />
                            <div>
                                <p className="font-semibold">Work Mode</p>
                                <p>{job.workMode}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                 <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <CardTitle>Salary</CardTitle>
                    </CardHeader>
                    <CardContent>
                       <p className="text-3xl font-bold text-green-400">
                            {job.salaryMin && job.salaryMax ? `₱${job.salaryMin.toLocaleString()} - ₱${job.salaryMax.toLocaleString()}` : 'Competitive Salary'}
                        </p>
                         <p className="text-sm text-slate-400">per month</p>
                    </CardContent>
                </Card>

                <div className="sticky top-28">
                    <Link href={`/applications/apply/${job.id}`} className="w-full">
                        <Button size="lg" className="w-full h-14 text-lg">Apply Now</Button>
                    </Link>
                </div>
            </aside>
        </div>
    </div>
  );
}

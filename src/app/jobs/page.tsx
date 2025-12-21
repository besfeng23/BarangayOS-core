import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, Briefcase } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import JobCard from './_components/JobCard';
import { featuredJobs, latestJobs } from './_data/jobs';
import Link from 'next/link';

const StatCard = ({ title, value, description }: { title: string, value: string, description: string }) => (
    <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="text-4xl font-bold text-blue-400">{value}</div>
            <p className="text-xs text-slate-500">{description}</p>
        </CardContent>
    </Card>
);

export default function JobsPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
        <section className="text-center">
        <h1 className="text-5xl font-extrabold tracking-tight mb-4">Find Your Next Opportunity</h1>
        <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Browse local job openings from verified employers in our community, exclusively on BarangayOS.
        </p>
        <div className="mt-8 max-w-2xl mx-auto flex gap-2">
            <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input placeholder="Search for jobs, keywords, or company..." className="h-14 text-lg pl-12 bg-slate-800 border-slate-600" />
            </div>
            <Button size="lg" className="h-14 text-lg">
            <Filter className="mr-2 h-5 w-5" />
            Filters
            </Button>
        </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="New Jobs This Week" value="12" description="+3 from last week" />
        <StatCard title="Active Employers" value="28" description="Verified local businesses" />
        <StatCard title="Applications Sent" value="156" description="Connecting residents to jobs" />
        </section>

        <section>
        <h2 className="text-3xl font-bold mb-6">Featured Jobs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredJobs.map(job => (
                <JobCard key={job.id} job={job} />
            ))}
        </div>
        </section>
        
        <section>
        <h2 className="text-3xl font-bold mb-6">Latest Job Openings</h2>
        <div className="space-y-4">
            {latestJobs.map(job => (
                <JobCard key={job.id} job={job} variant="list" />
            ))}
        </div>
        </section>
    </div>
  );
}

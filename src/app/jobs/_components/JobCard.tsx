
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Briefcase, Clock, Building, ArrowRight } from 'lucide-react';
import type { Job } from '../_data/jobs';
import { cn } from '@/lib/utils';

interface JobCardProps {
  job: Job;
  variant?: 'grid' | 'list';
}

export default function JobCard({ job, variant = 'grid' }: JobCardProps) {

  if (variant === 'list') {
    return (
        <Link href={`/jobs/${job.id}`} passHref>
          <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/80 transition-colors flex flex-col md:flex-row items-start md:items-center p-4 gap-4">
             <div className="p-3 bg-slate-700/50 rounded-lg">
                <Building className="h-8 w-8 text-blue-300" />
            </div>
            <div className="flex-grow">
              <h3 className="text-lg font-bold text-white">{job.title}</h3>
              <p className="text-slate-400">{job.companyName}</p>
            </div>
            <div className="flex flex-wrap gap-2 text-sm text-slate-400">
                <div className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {job.location}</div>
                <div className="flex items-center gap-1.5"><Briefcase className="h-4 w-4" /> {job.type}</div>
                <div className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {job.workMode}</div>
            </div>
             <div className="hidden md:block">
                <ArrowRight className="h-5 w-5 text-slate-500 group-hover:text-blue-400" />
            </div>
          </Card>
        </Link>
    );
  }

  return (
    <Link href={`/jobs/${job.id}`} passHref>
      <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/80 transition-colors flex flex-col h-full">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="p-3 bg-slate-700/50 rounded-lg">
                <Building className="h-8 w-8 text-blue-300" />
            </div>
            {job.urgent && <Badge variant="destructive">Urgent</Badge>}
          </div>
          <CardTitle className="pt-4 text-xl">{job.title}</CardTitle>
          <CardDescription>{job.companyName}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-3">
            <div className="flex items-center gap-2 text-sm text-slate-400"><MapPin className="h-4 w-4" /> {job.location}</div>
            <div className="flex items-center gap-2 text-sm text-slate-400"><Briefcase className="h-4 w-4" /> {job.type}</div>
            <div className="flex items-center gap-2 text-sm text-slate-400"><Clock className="h-4 w-4" /> {job.workMode}</div>
        </CardContent>
        <CardFooter>
            <p className="text-lg font-semibold text-green-400">
                {job.salaryMin && job.salaryMax ? `₱${job.salaryMin.toLocaleString()} - ₱${job.salaryMax.toLocaleString()}` : 'Competitive Salary'}
            </p>
        </CardFooter>
      </Card>
    </Link>
  );
}

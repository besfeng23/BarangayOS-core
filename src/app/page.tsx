
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/dashboard/StatCard';
import { Users, FileClock, Scale, Plus } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="space-y-12">
        <section>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard 
                    title="Total Population"
                    value="1,204"
                    label="Registered Residents"
                    icon={Users}
                />
                 <StatCard 
                    title="Pending Clearances"
                    value="3"
                    label="Action Required"
                    icon={FileClock}
                    variant="warning"
                />
                 <StatCard 
                    title="Active Cases"
                    value="2"
                    label="Blotter Log"
                    icon={Scale}
                />
            </div>
        </section>

        <section>
            <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl mb-6">
                Quick Actions
            </h2>
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <Link href="/residents?action=new" passHref>
                    <Button variant="outline" className="h-24 text-xl w-full">
                        <Plus className="mr-2 h-6 w-6"/>
                        New Resident
                    </Button>
                </Link>
                <Link href="/blotter?action=new" passHref>
                    <Button variant="outline" className="h-24 text-xl w-full">
                        <Plus className="mr-2 h-6 w-6"/>
                        File Blotter
                    </Button>
                </Link>
                <Link href="/certificates?action=focus" passHref>
                    <Button variant="outline" className="h-24 text-xl w-full">
                        <Plus className="mr-2 h-6 w-6"/>
                        Issue Clearance
                    </Button>
                </Link>
            </div>
        </section>
    </div>
  );
}

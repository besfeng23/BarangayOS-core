
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Banknote, Users, QrCode, Send, History, BarChart3, Settings, ShieldAlert, ArrowLeft, BookLock } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon }: { title: string, value: string, icon: React.ElementType }) => (
    <Card className="bg-zinc-800/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">{title}</CardTitle>
            <Icon className="h-4 w-4 text-zinc-500" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
        </CardContent>
    </Card>
);

const ActionButton = ({ href, icon: Icon, title, description }: { href: string, icon: React.ElementType, title: string, description: string }) => (
    <Link href={href} passHref>
        <div className="p-4 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer flex items-center gap-4 h-full">
            <div className="p-3 bg-zinc-700/50 rounded-md">
                <Icon className="h-6 w-6 text-blue-400" />
            </div>
            <div>
                <h3 className="font-semibold text-lg">{title}</h3>
                <p className="text-sm text-zinc-400">{description}</p>
            </div>
        </div>
    </Link>
);


export default function EmangoHomePage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Link href="/apps" passHref>
                    <Button variant="outline" size="icon" className="h-10 w-10">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold">eMango Wallet</h1>
                    <p className="text-muted-foreground">Digital collections and disbursement hub.</p>
                </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 text-green-300 text-sm font-medium">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                LIVE
            </div>
        </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Today's Collections" value="₱1,250.00" icon={Banknote} />
        <StatCard title="Transactions Today" value="15" icon={Users} />
        <StatCard title="Pending Disbursements" value="₱8,500.00" icon={Send} />
        <StatCard title="Issues / Reversals" value="1" icon={ShieldAlert} />
      </div>

       <div className="grid gap-6 lg:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Core Actions</CardTitle>
                    <CardDescription>Perform a new transaction.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                   <ActionButton 
                        href="/emango/collect" 
                        icon={QrCode} 
                        title="Collect Payment" 
                        description="Generate a QR code for a service fee."
                   />
                   <ActionButton 
                        href="/emango/send" 
                        icon={Send} 
                        title="Disburse Funds" 
                        description="Send aid or payroll to residents."
                   />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Ledgers & Admin</CardTitle>
                    <CardDescription>View history, reports, and settings.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                    <ActionButton 
                        href="/emango/history" 
                        icon={History} 
                        title="Transaction History" 
                        description="Search all wallet activities."
                   />
                   <ActionButton 
                        href="/emango/reports" 
                        icon={BarChart3} 
                        title="Reports" 
                        description="View summaries and export data."
                   />
                    <ActionButton 
                        href="/emango/audit" 
                        icon={BookLock} 
                        title="Audit Logs" 
                        description="Review detailed activity logs."
                   />
                   <ActionButton 
                        href="/emango/settings" 
                        icon={Settings} 
                        title="Settings" 
                        description="Configure fees, roles, and limits."
                   />
                </CardContent>
            </Card>
       </div>
    </div>
  );
}

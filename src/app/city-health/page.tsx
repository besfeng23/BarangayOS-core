import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Search, Settings, Home, Users, BarChart3, Bot, Mic } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useSyncStatus } from '@/hooks/useSyncStatus';

const StatCard = ({ title, value, subtext }: { title: string, value: string, subtext: string }) => (
    <Card className="bg-slate-800/50 border-slate-700 flex-1 cursor-pointer hover:bg-slate-800 transition-colors">
        <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="text-4xl font-bold">{value}</div>
            <p className="text-xs text-slate-500">{subtext}</p>
        </CardContent>
    </Card>
);


export default function CityHealthHomePage() {
  const { state: syncState, label: syncLabel, totalQueued } = useSyncStatus();
  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const badgeTone = {
    synced: 'bg-green-500/20 text-green-300 border-green-500/40',
    queued: 'bg-amber-500/20 text-amber-200 border-amber-500/40',
    offline: 'bg-amber-500/20 text-amber-200 border-amber-500/40',
    error: 'bg-red-500/20 text-red-200 border-red-500/40',
  }[syncState] || 'bg-zinc-700 text-zinc-100';

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-gray-200 font-sans">
      
      {/* Top App Bar */}
      <header className="flex items-center justify-between p-4 border-b border-slate-700 sticky top-0 bg-slate-900/80 backdrop-blur-lg z-10">
        <div>
            <h1 className="text-2xl sm:text-3xl font-bold">City Health</h1>
            <p className="text-slate-400 text-sm sm:text-base">
                {currentDate}
            </p>
        </div>
        <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full border ${badgeTone}`}>
                <span className="w-2 h-2 rounded-full bg-current"></span>
                {syncLabel}{totalQueued > 0 ? ` (${totalQueued})` : ''}
            </div>
            <Button variant="ghost" size="icon"><Search className="h-6 w-6" /></Button>
            <Button variant="ghost" size="icon"><Bell className="h-6 w-6" /></Button>
            <Link href="/" passHref><Button variant="outline">Back to Hub</Button></Link>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        {/* KPI Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard title="Queue Today" value="25" subtext="8 Waiting, 5 In Consult" />
            <StatCard title="Follow-ups Due" value="12" subtext="3 High Priority" />
            <StatCard title="Low Stock Meds" value="5" subtext="Paracetamol, Amoxicillin" />
            <StatCard title="Program Overdue" value="8" subtext="Missed Vaccinations" />
        </div>

        {/* AI Quick Assist */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
                <Bot className="text-blue-400 h-6 w-6" />
                <h3 className="text-lg font-semibold">AI Quick Assist</h3>
            </div>
            <div className="relative mt-2">
                 <input placeholder="Ask: Show children missing vaccines" className="bg-slate-900 border-slate-600 text-white pl-4 pr-28 h-12 w-full rounded-md" />
                 <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                    <Button variant="ghost" size="icon"><Mic/></Button>
                    <Button variant="ghost">Suggest</Button>
                 </div>
            </div>
            <div className="flex gap-2 mt-2">
                <Badge variant="secondary" className="cursor-pointer">TB patients with missed DOTS</Badge>
                <Badge variant="secondary" className="cursor-pointer">Pregnant mothers due for checkup</Badge>
                <Badge variant="secondary" className="cursor-pointer">Senior citizens needing BP monitoring</Badge>
            </div>
        </div>

        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <Link href="/city-health/queue" passHref><Button variant="outline">Today's Queue</Button></Link>
            <Link href="/city-health/patients" passHref><Button variant="outline">Patients</Button></Link>
            <Link href="/city-health/reports" passHref><Button variant="outline">Reports</Button></Link>
            <Link href="/city-health/medicines" passHref><Button variant="outline">Medicines</Button></Link>
            <Link href="/city-health/programs" passHref><Button variant="outline">Programs</Button></Link>
            <Link href="/city-health/alerts" passHref><Button variant="outline">Alerts & Follow-ups</Button></Link>
            <Link href="/city-health/settings" passHref><Button variant="outline">Settings</Button></Link>
        </div>
      </main>

      {/* Bottom Navigation */}
      <footer className="flex md:hidden items-center justify-around p-2 border-t border-slate-700 sticky bottom-0 bg-slate-900/80 backdrop-blur-lg z-10">
          <Button variant="ghost" className="flex flex-col h-auto text-blue-400">
              <Home className="h-6 w-6"/>
              <span className="text-xs">Dashboard</span>
          </Button>
          <Link href="/city-health/queue" passHref>
            <Button variant="ghost" className="flex flex-col h-auto">
                <Users className="h-6 w-6"/>
                <span className="text-xs">Queue</span>
            </Button>
          </Link>
          <Link href="/city-health/patients" passHref>
            <Button variant="ghost" className="flex flex-col h-auto">
                <Users className="h-6 w-6"/>
                <span className="text-xs">Patients</span>
            </Button>
          </Link>
          <Link href="/city-health/reports" passHref>
            <Button variant="ghost" className="flex flex-col h-auto">
                <BarChart3 className="h-6 w-6"/>
                <span className="text-xs">Reports</span>
            </Button>
          </Link>
          <Button variant="ghost" className="flex flex-col h-auto">
              <Settings className="h-6 w-6"/>
              <span className="text-xs">More</span>
          </Button>
      </footer>
    </div>
  );
}

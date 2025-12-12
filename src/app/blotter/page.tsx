import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, Plus, Mic, Send, MessageCircleMore, LoaderCircle } from 'lucide-react';
import CaseCard from '@/components/blotter/CaseCard';
import FilterTabs from '@/components/blotter/FilterTabs';

export default function BlotterPage() {
  const cases = [
    {
      id: 1,
      status: 'DRAFT',
      caseNumber: '2025-0191',
      title: 'Physical Injury / Brawling',
      parties: '- Juan D. vs Pedro S.',
      location: '- Purok 3',
      attachment: { type: 'audio', label: 'Audio' },
      color: 'yellow',
    },
    {
      id: 2,
      status: 'FILED',
      caseNumber: '2025-0190',
      title: 'Theft (Bicycle)',
      parties: '- Complainant: Maria Clara',
      location: '- Purok 1',
      attachment: { type: 'photos', label: 'Photos' },
      color: 'green',
    },
    {
      id: 3,
      status: 'URGENT',
      caseNumber: '2025-0189',
      title: 'Domestic Dispute',
      parties: '- Santos Family',
      location: '- ⚠️ VAWC Alert',
      extra: '- Purok 4',
      color: 'red',
    },
  ];

  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-body">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/" passHref>
            <Button variant="ghost" size="icon" aria-label="Back to Hub">
              <ArrowLeft />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Blotter Log</h1>
        </div>
        <div className="flex-1 max-w-xl mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search name, case #, keyword..."
              className="pl-10 bg-muted border-0"
            />
          </div>
        </div>
        <Button>
          <Plus className="mr-2" /> New Blotter
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 grid md:grid-cols-2 lg:grid-cols-[40%_60%] min-h-0">
        {/* Left Panel: Blotter List */}
        <div className="flex flex-col border-r border-border">
          <div className="p-4 border-b border-border shrink-0">
            <h2 className="text-lg font-semibold mb-4">Blotter List</h2>
            <FilterTabs />
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cases.map((caseItem) => (
              <CaseCard key={caseItem.id} caseItem={caseItem} />
            ))}
          </div>
        </div>

        {/* Right Panel: AI Intake Assistant */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
            <h2 className="text-lg font-semibold">AI Intake Assistant</h2>
            <Button variant="outline" size="sm">
              Switch to Form
            </Button>
          </div>
          <div className="flex-1 flex flex-col justify-between p-4 bg-muted/20">
            <div className="space-y-6">
              {/* AI Intro */}
              <div className="flex items-start gap-3 justify-start">
                 <div className="bg-muted rounded-full p-2">
                    <MessageCircleMore className="text-primary" />
                 </div>
                <div className="bg-muted rounded-lg p-3 max-w-lg">
                  <p className="text-sm">
                    Good morning! I'm here to help you file a blotter report. Please describe the incident in your own words. Include who was involved, what happened, and where it took place.
                  </p>
                </div>
              </div>

              {/* User Message */}
              <div className="flex items-start gap-3 justify-end">
                <div className="bg-primary text-primary-foreground rounded-lg p-3 max-w-lg">
                  <p className="text-sm">Nag-aaway sina Juan Dela Cruz at Pedro Penduko sa Purok 3 kaninang umaga...</p>
                </div>
              </div>

               {/* Live Extraction */}
              <div className="bg-card/50 border border-border rounded-lg p-4 my-4">
                <div className="flex items-center mb-3">
                   <LoaderCircle className="animate-spin text-primary mr-2" />
                  <h3 className="font-semibold text-foreground">Live Extraction...</h3>
                </div>
                <ul className="space-y-2 text-sm text-foreground">
                    <li className="flex items-center">Nature: Physical Injury (Alcohol Related) <span className="text-green-400 ml-1">✅</span></li>
                    <li className="flex items-center">Location: Purok 3 ● Resident Match <span className="text-green-400 ml-1">✅</span></li>
                    <li className="flex items-center">Complainant: Juan Dela Cruz <span className="text-green-400 ml-1">✅</span></li>
                    <li className="flex items-center">Respondent: Pedro Penduko <span className="text-green-400 ml-1">✅</span></li>
                </ul>
                <p className="text-red-400 text-xs mt-3">Missing Details: Exact Date & Time, Injuries</p>
              </div>

               {/* AI Follow-up */}
               <div className="flex items-start gap-3 justify-start">
                 <div className="bg-muted rounded-full p-2">
                    <MessageCircleMore className="text-primary" />
                 </div>
                <div className="bg-muted rounded-lg p-3 max-w-lg">
                  <p className="text-sm">
                    Thank you for the information. To complete the report, could you please provide the exact date and time of the incident? Also, were there any specific injuries?
                  </p>
                </div>
              </div>

            </div>
            
            {/* Input Bar */}
            <div className="mt-4 shrink-0">
               <div className="relative">
                <Button variant="ghost" size="icon" className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Mic />
                </Button>
                <Input placeholder="Type your reply..." className="pl-12 pr-12 h-12 bg-card border-border" />
                 <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 text-primary">
                    <Send />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

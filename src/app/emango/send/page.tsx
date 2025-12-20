
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

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

export default function SendPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
       <div className="flex items-center gap-4 mb-8">
          <Link href="/emango" passHref>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Disbursement Hub</h1>
            <p className="text-muted-foreground">Send funds to residents for aid, payroll, or other purposes.</p>
          </div>
        </div>
      
        <Card className="max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle>Select Disbursement Type</CardTitle>
                <CardDescription>Choose how you want to send funds.</CardDescription>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
                <ActionButton 
                    href="/emango/send/aid" 
                    icon={Send} 
                    title="Disburse 'Ayuda' Batch" 
                    description="Upload a list of residents and amounts for mass disbursement."
                />
                 <div className="p-4 bg-zinc-800/20 rounded-lg flex items-center gap-4 opacity-50 cursor-not-allowed">
                    <div className="p-3 bg-zinc-700/20 rounded-md">
                        <Send className="h-6 w-6 text-zinc-500" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg text-zinc-500">Send to Single Resident</h3>
                        <p className="text-sm text-zinc-600">Individual payment (coming soon).</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}

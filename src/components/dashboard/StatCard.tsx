
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  label: string;
  icon: LucideIcon;
  variant?: 'default' | 'warning';
}

export const StatCard = ({ title, value, label, icon: Icon, variant = 'default' }: StatCardProps) => {
    
    const valueColor = variant === 'warning' ? 'text-amber-400' : 'text-blue-400';
    const iconColor = variant === 'warning' ? 'text-amber-400' : 'text-slate-400';

    return (
        <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium text-slate-300">{title}</CardTitle>
            <Icon className={cn("h-6 w-6", iconColor)} />
            </CardHeader>
            <CardContent>
            <div className={cn("text-5xl font-bold", valueColor)}>{value}</div>
            <p className="text-sm text-slate-400 mt-1">{label}</p>
            </CardContent>
        </Card>
    );
};

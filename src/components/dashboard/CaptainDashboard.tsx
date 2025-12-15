"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Printer, FileText, CheckCircle2, User } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';


const StatCard = ({ title, value, label, valueColor }: { title: string, value: string, label: string, valueColor: string }) => (
  <Card className="bg-slate-900/50 border-slate-700">
    <CardHeader>
      <CardTitle className="text-lg font-medium text-slate-300">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className={`text-5xl font-bold ${valueColor}`}>{value}</div>
      <p className="text-sm text-slate-400 mt-1">{label}</p>
    </CardContent>
  </Card>
);

const ActivityItem = ({ icon, text, time }: { icon: React.ElementType, text: string, time: string }) => {
    const Icon = icon;
    return (
        <div className="flex items-center p-4 border-b border-slate-800 last:border-b-0">
            <Icon className="w-6 h-6 mr-4 text-slate-400" />
            <div className="flex-grow">
                <p className="text-slate-200">{text}</p>
            </div>
            <p className="text-sm text-slate-500">{time}</p>
        </div>
    );
};


const CaptainDashboard = () => {
    const [date, setDate] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        setDate(new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    }, []);

    const handlePrintReport = () => {
        toast({
            title: "Printing Report",
            description: "Your monthly report is being generated.",
        });
    };

    return (
    <div className="bg-slate-950 min-h-screen text-white p-4 sm:p-6 lg:p-8">
        <header className="mb-8">
            <div className="flex justify-between items-start flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-bold">Good Morning, Kap</h1>
                    <p className="text-slate-400 mt-1">Today is {date}</p>
                </div>
                <div className="flex items-center gap-4">
                    <Button onClick={handlePrintReport} className="bg-blue-600 hover:bg-blue-700 h-12 text-lg">
                        <Printer className="mr-2 h-5 w-5" />
                        PRINT MONTHLY REPORT
                    </Button>
                     <Link href="/" passHref>
                        <Button variant="outline" className="h-12 text-lg">Back to Hub</Button>
                    </Link>
                </div>
            </div>
        </header>

        {/* Big Numbers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatCard title="Active Disputes" value="12" label="Requires Attention" valueColor="text-red-500" />
            <StatCard title="Peace & Order Rating" value="98%" label="Based on settled cases" valueColor="text-green-500" />
            <StatCard title="Collections (This Month)" value="₱12,450.00" label="Permits & Clearances" valueColor="text-yellow-400" />
        </div>

        {/* Recent Activity */}
        <section>
            <h2 className="text-2xl font-bold mb-4">Latest Barangay Activity</h2>
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg overflow-hidden">
                <ActivityItem icon={FileText} text="New Blotter Entry: Noise Complaint" time="2 hrs ago" />
                <ActivityItem icon={CheckCircle2} text="Business Permit Issued: Sari-Sari Store" time="4 hrs ago" />
                <ActivityItem icon={User} text="Lola Maria requested Indigency Cert" time="5 hrs ago" />
            </div>
        </section>
    </div>
  );
};

export default CaptainDashboard;

    

'use client';

import React, { useState, useMemo } from 'react';
import {
  MoreVertical,
  Search,
  Plus,
  FileDown,
  Printer,
  ChevronDown,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { mockPermits, type BusinessPermit } from '@/data/permits-mock';
import type { PermitStatus, PaymentStatus } from '@/types/permits';

const statusStyles: Record<PermitStatus, string> = {
  DRAFT: 'bg-gray-500',
  PENDING_REVIEW: 'bg-yellow-500 text-yellow-900',
  FOR_PAYMENT: 'bg-blue-500',
  FOR_INSPECTION: 'bg-purple-500',
  FOR_APPROVAL: 'bg-cyan-500',
  FOR_RELEASE: 'bg-teal-500',
  RELEASED: 'bg-green-600',
  REJECTED: 'bg-red-600',
  CANCELLED: 'bg-red-800',
};

const paymentStatusStyles: Record<PaymentStatus, string> = {
  UNPAID: 'border-yellow-500 text-yellow-500',
  PAID: 'border-green-500 text-green-500',
  PARTIAL: 'border-blue-500 text-blue-500',
  WAIVED: 'border-gray-500 text-gray-500',
};

const StatCard = ({ title, value, subtext }: { title: string; value: string | number, subtext: string }) => (
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

export default function BusinessPermitsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPermits, setSelectedPermits] = useState<Set<string>>(new Set());

  const filteredPermits = useMemo(() => {
    return mockPermits.filter(permit =>
        permit.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permit.owner.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permit.permitNo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPermits(new Set(filteredPermits.map(p => p.id)));
    } else {
      setSelectedPermits(new Set());
    }
  };

  const handleSelectRow = (permitId: string) => {
    setSelectedPermits(prev => {
      const newSet = new Set(prev);
      if (newSet.has(permitId)) {
        newSet.delete(permitId);
      } else {
        newSet.add(permitId);
      }
      return newSet;
    });
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-gray-200 font-sans p-4 sm:p-6 lg:p-8">
      <header className="flex items-center justify-between pb-4 border-b border-slate-700 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Business Permits</h1>
          <p className="text-slate-400 text-sm sm:text-base">Manage all business applications and permits.</p>
        </div>
        <Link href="/" passHref>
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Hub
          </Button>
        </Link>
      </header>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <StatCard title="Pending Review" value="8" subtext="New & Renewals" />
          <StatCard title="For Payment" value="12" subtext="Approved applications" />
          <StatCard title="For Release" value="5" subtext="Paid & ready" />
          <StatCard title="Released Today" value="15" subtext="Total permits issued" />
          <StatCard title="Expired / For Renewal" value="42" subtext="Next 30 days" />
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="relative flex-grow min-w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search Business, Owner, or Permit #"
                className="bg-slate-800 border-slate-600 text-white pl-10 h-12"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
          </div>
          <div className="flex gap-2">
              <Button variant="outline" className="h-12">
                  Status <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" className="h-12">
                  Type <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
               <Button variant="outline" className="h-12">
                  Payment <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
          </div>
          <div className="flex gap-2 ml-auto">
              <Button variant="outline" className="h-12" disabled={selectedPermits.size === 0}>
                  <FileDown className="mr-2 h-4 w-4" /> Export
              </Button>
              <Button variant="outline" className="h-12" disabled={selectedPermits.size === 0}>
                  <Printer className="mr-2 h-4 w-4" /> Print Batch
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 h-12 text-lg px-6">
                  <Plus className="mr-2 h-6 w-6" /> New Application
              </Button>
          </div>
      </div>

      <div className="border border-slate-700 rounded-lg flex-1 overflow-y-auto">
          <Table>
              <TableHeader>
                  <TableRow className="border-slate-700 hover:bg-slate-800/50">
                      <TableHead className="w-12">
                          <Checkbox 
                            checked={selectedPermits.size === filteredPermits.length && filteredPermits.length > 0}
                            onCheckedChange={(checked) => handleSelectAll(Boolean(checked))}
                          />
                      </TableHead>
                      <TableHead>Permit #</TableHead>
                      <TableHead>Business Name</TableHead>
                      <TableHead>Owner</TableHead>
                       <TableHead>Purok</TableHead>
                      <TableHead>Filed</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead className="w-16 text-right"></TableHead>
                  </TableRow>
              </TableHeader>
              <TableBody>
                  {filteredPermits.map((permit) => (
                      <TableRow key={permit.id} className="border-slate-800 hover:bg-slate-800/50">
                           <TableCell>
                              <Checkbox 
                                checked={selectedPermits.has(permit.id)}
                                onCheckedChange={() => handleSelectRow(permit.id)}
                              />
                           </TableCell>
                           <TableCell className="font-mono">{permit.permitNo}</TableCell>
                           <TableCell className="font-medium">{permit.businessName}</TableCell>
                           <TableCell>{permit.owner.fullName}</TableCell>
                           <TableCell>{permit.businessAddress.purok}</TableCell>
                           <TableCell>{new Date(permit.filedAt.seconds * 1000).toLocaleDateString()}</TableCell>
                           <TableCell>
                              <Badge className={`${statusStyles[permit.status]} text-white`}>
                                  {permit.status.replace(/_/g, ' ')}
                              </Badge>
                           </TableCell>
                           <TableCell>
                              <Badge variant="outline" className={paymentStatusStyles[permit.payment.status]}>
                                  {permit.payment.status}
                              </Badge>
                           </TableCell>
                           <TableCell className="text-right">
                              <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                          <MoreVertical className="h-5 w-5" />
                                      </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="bg-slate-800 text-white border-slate-700">
                                      <DropdownMenuItem>Open</DropdownMenuItem>
                                      <DropdownMenuItem>Print Permit</DropdownMenuItem>
                                      <DropdownMenuItem>View Audit Log</DropdownMenuItem>
                                  </DropdownMenuContent>
                              </DropdownMenu>
                           </TableCell>
                      </TableRow>
                  ))}
              </TableBody>
          </Table>
      </div>

    </div>
  );
}

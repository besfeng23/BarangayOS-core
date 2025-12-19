
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, MoreVertical } from 'lucide-react';
import AddDeviceModal from './_components/AddDeviceModal';
import { SecurityDevice } from '@/types/security';

const mockDevices: SecurityDevice[] = [
  {
    id: 'cam-001',
    type: 'CCTV',
    name: 'Hall Entrance Cam 1',
    location: { area: 'Main Hall Entrance' },
    status: 'ACTIVE',
    barangayId: 'brgy-01',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'cam-002',
    type: 'CCTV',
    name: 'Purok 3 Corner',
    location: { area: 'Purok 3' },
    status: 'ACTIVE',
    barangayId: 'brgy-01',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
    {
    id: 'bodycam-01',
    type: 'BODY_CAM',
    name: 'Tanod 1 Body Cam',
    location: { area: 'Field Operative' },
    status: 'ACTIVE',
    deviceMeta: { assignedToResidentId: 'res-001' },
    barangayId: 'brgy-01',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'siren-01',
    type: 'SIREN',
    name: 'Main Hall Siren',
    location: { area: 'Rooftop' },
    status: 'MAINTENANCE',
    barangayId: 'brgy-01',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];


export default function SecurityPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Security & Emergency</h1>
          <p className="text-muted-foreground">Dashboard for monitoring devices, incidents, and alerts.</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Device
        </Button>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Placeholder Stat Cards */}
        <Card>
          <CardHeader><CardTitle>Active CCTVs</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">2</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Body Cams</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">1</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Open Incidents</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">0</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>System Status</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-green-400">All Normal</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registered Devices</CardTitle>
          <CardDescription>List of all security and emergency devices in the barangay.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockDevices.map((device) => (
                <TableRow key={device.id}>
                  <TableCell className="font-medium">{device.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{device.type.replace(/_/g, ' ')}</Badge>
                  </TableCell>
                  <TableCell>{device.location.area}</TableCell>
                  <TableCell>
                    <Badge variant={device.status === 'ACTIVE' ? 'default' : 'destructive'}>
                      {device.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <AddDeviceModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
}

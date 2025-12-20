
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, MoreVertical, Loader2 } from 'lucide-react';
import AddDeviceModal from './_components/AddDeviceModal';
import { useSecurity } from '@/hooks/useSecurity';
import { useSyncQueue } from '@/hooks/bos/useSyncQueue';

export default function SecurityPage() {
  const { devices, loading, openModal, closeModal, isModalOpen, editingDevice, saveDevice } = useSecurity();
  const { enqueue } = useSyncQueue();

  const handleSave = async (draft: any) => {
    await saveDevice(draft, enqueue);
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Security & Emergency</h1>
          <p className="text-muted-foreground">Dashboard for monitoring devices, incidents, and alerts.</p>
        </div>
        <Button onClick={() => openModal()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Device
        </Button>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Placeholder Stat Cards */}
        <Card>
          <CardHeader><CardTitle>Active CCTVs</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{devices.filter(d => d.type === 'CCTV' && d.status === 'ACTIVE').length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Body Cams</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{devices.filter(d => d.type === 'BODY_CAM').length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Devices Needing Maintenance</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{devices.filter(d => d.status === 'MAINTENANCE').length}</p></CardContent>
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
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
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
                {devices.map((device) => (
                  <TableRow key={device.id} className="cursor-pointer" onClick={() => openModal(device)}>
                    <TableCell className="font-medium">{device.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{device.type.replace(/_/g, ' ')}</Badge>
                    </TableCell>
                    <TableCell>{device.location}</TableCell>
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
          )}
        </CardContent>
      </Card>
      
      <AddDeviceModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        device={editingDevice}
        onSave={handleSave}
      />
    </div>
  );
}

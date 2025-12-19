
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SecurityDevice, DeviceType } from '@/types/security';

interface AddDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  device?: SecurityDevice; // for editing
}

const deviceTypes: DeviceType[] = [
  'CCTV',
  'NVR',
  'BODY_CAM',
  'DASH_CAM',
  'PANIC_BUTTON',
  'SIREN',
  'LED_DISPLAY',
  'PA_SYSTEM',
];

export default function AddDeviceModal({ isOpen, onClose, device }: AddDeviceModalProps) {
  const [name, setName] = useState(device?.name || '');
  const [type, setType] = useState<DeviceType | ''>(device?.type || '');
  const [location, setLocation] = useState(device?.location?.area || '');
  const [ipAddress, setIpAddress] = useState(device?.deviceMeta?.ipAddress || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // TODO: Implement save logic (to Dexie, then queue for Firestore)
    console.log({ name, type, location, ipAddress });
    setTimeout(() => {
      setIsSaving(false);
      onClose();
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{device ? 'Edit Device' : 'Add New Device'}</DialogTitle>
          <DialogDescription>
            Register a new security or emergency device for the barangay.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="e.g., Hall Entrance Cam 1"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Type
            </Label>
            <Select onValueChange={(value) => setType(value as DeviceType)} value={type}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select device type" />
              </SelectTrigger>
              <SelectContent>
                {deviceTypes.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="location" className="text-right">
              Location
            </Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="col-span-3"
              placeholder="e.g., Main Hall Entrance"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="ip-address" className="text-right">
              IP Address
            </Label>
            <Input
              id="ip-address"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              className="col-span-3"
              placeholder="e.g., 192.168.1.100 (optional)"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Device'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

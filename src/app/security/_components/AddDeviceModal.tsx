
'use client';

import { useState, useEffect } from 'react';
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
import type { SecurityDeviceLocal, DeviceType, DeviceStatus } from '@/lib/bosDb';
import type { SecurityDraft } from '@/hooks/useSecurity';
import { useToast } from '@/components/ui/toast';
import { useSettings } from '@/hooks/useSettings';

interface AddDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (draft: SecurityDraft) => Promise<void>;
  device?: SecurityDeviceLocal | null;
}

const deviceStatuses: DeviceStatus[] = ['ACTIVE', 'INACTIVE', 'MAINTENANCE'];

export default function AddDeviceModal({ isOpen, onClose, onSave, device }: AddDeviceModalProps) {
  const { toast } = useToast();
  const { settings } = useSettings();
  const deviceTypes = settings.securityDeviceTypes || [];

  const [draft, setDraft] = useState<SecurityDraft>({
    id: device?.id,
    name: device?.name || '',
    type: device?.type || '',
    location: device?.location || '',
    ipAddress: device?.ipAddress || '',
    status: device?.status || 'ACTIVE',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setDraft({
      id: device?.id,
      name: device?.name || '',
      type: device?.type || '',
      location: device?.location || '',
      ipAddress: device?.ipAddress || '',
      status: device?.status || 'ACTIVE',
    });
  }, [device, isOpen]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(draft);
      toast({ title: 'Success', description: 'Device saved successfully.'});
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof SecurityDraft, value: string) => {
    setDraft(prev => ({ ...prev, [field]: value }));
  }

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
              value={draft.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="col-span-3"
              placeholder="e.g., Hall Entrance Cam 1"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Type
            </Label>
            <Select onValueChange={(value) => handleChange('type', value as DeviceType)} value={draft.type}>
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
              value={draft.location}
              onChange={(e) => handleChange('location', e.target.value)}
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
              value={draft.ipAddress}
              onChange={(e) => handleChange('ipAddress', e.target.value)}
              className="col-span-3"
              placeholder="e.g., 192.168.1.100 (optional)"
            />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select onValueChange={(value) => handleChange('status', value as DeviceStatus)} value={draft.status}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {deviceStatuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

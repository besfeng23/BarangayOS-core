

'use client';

import { useState, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, SecurityDeviceLocal, DeviceType } from '@/lib/bosDb';
import { toTokens } from '@/lib/bos/searchTokens';
import { uuid } from '@/lib/uuid';
import { writeActivity } from '@/lib/bos/activity/writeActivity';

export type SecurityDraft = {
  id?: string;
  name: string;
  type: DeviceType | '';
  location: string;
  ipAddress?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
};

export function useSecurity() {
  const [query, setQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<SecurityDeviceLocal | null>(null);

  const { data: devices, loading } = useLiveQuery(async () => {
    const q = query.trim().toUpperCase();
    if (!q) {
      return await db.devices.orderBy('updatedAtISO').reverse().toArray();
    }
    const tokens = q.split(' ');
    const results = await db.devices.where('searchTokens').anyOf(tokens).toArray();
    return results.filter(device => {
        const hay = [device.name, device.type, device.location, device.ipAddress].join(' ').toUpperCase();
        return tokens.every(token => hay.includes(token));
    });
  }, [query], { data: [], loading: true });

  const openModal = useCallback((device: SecurityDeviceLocal | null = null) => {
    setEditingDevice(device);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setEditingDevice(null);
    setIsModalOpen(false);
  }, []);

  const saveDevice = useCallback(async (draft: SecurityDraft, enqueue: (job: any) => Promise<void>) => {
    if (!draft.name || !draft.type || !draft.location) {
      throw new Error("Name, type, and location are required.");
    }

    const nowISO = new Date().toISOString();
    const id = draft.id || uuid();
    const isNew = !draft.id;

    const record: SecurityDeviceLocal = {
      id,
      name: draft.name,
      type: draft.type as DeviceType,
      location: draft.location,
      ipAddress: draft.ipAddress,
      status: draft.status,
      createdAtISO: isNew ? nowISO : (await db.devices.get(id))?.createdAtISO || nowISO,
      updatedAtISO: nowISO,
      searchTokens: toTokens([draft.name, draft.type, draft.location, draft.ipAddress || '']),
      synced: 0,
    };

    await db.devices.put(record);

    await writeActivity({
        type: isNew ? 'DEVICE_CREATED' : 'DEVICE_UPDATED',
        entityType: 'system',
        entityId: record.id,
        status: 'ok',
        title: isNew ? 'Device Registered' : 'Device Updated',
        subtitle: `${record.name} (${record.type})`,
    } as any);

    await enqueue({
      type: 'DEVICE_UPSERT',
      payload: record
    });

    closeModal();
  }, [closeModal]);

  return {
    devices: devices || [],
    loading,
    query,
    setQuery,
    isModalOpen,
    editingDevice,
    openModal,
    closeModal,
    saveDevice,
  };
}


'use client';

import { useCallback } from 'react';
import { db, ResidentLocal } from '@/lib/bosDb';
import { toTokens } from '@/lib/bos/searchTokens';
import { norm } from '@/lib/uuid';

function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function calcAge(birthdate: string): number | null {
  if (!birthdate) return null;
  try {
    const age = Math.floor((new Date().getTime() - new Date(birthdate).getTime()) / 31557600000);
    return isNaN(age) ? null : age;
  } catch {
    return null;
  }
}

export function useResidentsData() {
  
  const checkDuplicateLocal = useCallback(async (lastName: string, firstName: string, birthdate: string) => {
    if (!lastName || !firstName || !birthdate) return null;
    const ln = norm(lastName);
    const fn = norm(firstName);
    const match = await db.residents
      .where({
        lastNameNorm: ln,
        firstNameNorm: fn,
        birthdate: birthdate,
      })
      .first();
    return match || null;
  }, []);

  const createResident = useCallback(async (form: Omit<ResidentLocal, 'id' | 'createdAtISO' | 'updatedAtISO' | 'searchTokens' | 'fullName' | 'fullNameUpper' | 'lastNameNorm' | 'firstNameNorm' | 'synced'> & { id?: string }) => {
    const id = form.id || uuid();
    const nowISO = new Date().toISOString();
    
    const fullName = [form.firstName, form.middleName, form.lastName, form.suffix].filter(Boolean).join(" ");

    const record: ResidentLocal = {
      ...form,
      id,
      fullName: fullName,
      fullNameUpper: fullName.toUpperCase(),
      lastNameNorm: norm(form.lastName),
      firstNameNorm: norm(form.firstName),
      createdAtISO: form.id ? (await db.residents.get(form.id))?.createdAtISO || nowISO : nowISO,
      updatedAtISO: nowISO,
      searchTokens: toTokens([fullName, form.purok, form.addressLine1, id].join(" ")),
      synced: 0,
    };
    
    await db.residents.put(record);
    return record;
  }, []);
  
  const logActivity = useCallback(async (log: any) => {
      // Placeholder for activity logging if needed in this context
  }, []);

  return { createResident, checkDuplicateLocal, logActivity };
}

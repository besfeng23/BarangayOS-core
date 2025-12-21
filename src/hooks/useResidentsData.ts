

"use client";

import { useCallback } from "react";
import { db, ResidentLocal } from "@/lib/bosDb";
import { toTokens } from "@/lib/bos/searchTokens";
import { uuid, norm } from "@/lib/uuid";
import { writeActivity } from "@/lib/bos/activity/writeActivity";


export function calcAge(birthdate: string) {
  if (!birthdate) return null;
  const birthday = new Date(birthdate);
  const ageDifMs = Date.now() - birthday.getTime();
  const ageDate = new Date(ageDifMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

export function useResidentsData() {

  const checkDuplicateLocal = useCallback(async (lastName: string, firstName: string, birthdate: string) => {
    const lastNameNorm = norm(lastName);
    const firstNameNorm = norm(firstName);
    const existing = await db.residents.where({ lastNameNorm, firstNameNorm, birthdate }).first();
    return existing;
  }, []);

  const createResident = useCallback(async (form: any) => {
    const { lastName, firstName, middleName, suffix, ...rest } = form;
    const nowISO = new Date().toISOString();
    const id = form.id ?? uuid();
    const existing = form.id ? await db.residents.get(form.id) : null;

    const fullName = [firstName, middleName, lastName, suffix].filter(Boolean).join(" ");
    
    const rec: ResidentLocal = {
        ...rest,
        id,
        lastName: lastName.trim(),
        firstName: firstName.trim(),
        middleName: middleName?.trim() || "",
        suffix: suffix?.trim() || "",
        fullName,
        fullNameUpper: fullName.toUpperCase(),
        lastNameNorm: norm(lastName),
        firstNameNorm: norm(firstName),
        createdAtISO: existing?.createdAtISO ?? nowISO,
        updatedAtISO: nowISO,
        synced: 0,
        searchTokens: toTokens(
          [
            id,
            lastName,
            firstName,
            middleName,
            form.purok,
            form.addressLine1,
          ].join(" ")
        ),
    };

    await db.residents.put(rec);
    return rec;
  }, []);

  const logActivity = useCallback(async (args: any) => {
      await writeActivity(args);
  }, []);

  const isResidentQueued = useCallback(async (id: string): Promise<boolean> => {
      const count = await db.sync_queue.where({ entityId: id, status: 'pending' }).count();
      return count > 0;
  }, []);

  return { createResident, checkDuplicateLocal, logActivity, isResidentQueued };
}

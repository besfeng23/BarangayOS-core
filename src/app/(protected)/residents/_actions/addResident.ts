
'use server'

import { z } from 'zod';
import { getAdminDb } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';
import { verifySessionCookie } from '@/lib/firebase/auth';

const formSchema = z.object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    purok: z.string().min(1),
});

export async function addResident(values: z.infer<typeof formSchema>) {
    const decodedClaims = await verifySessionCookie();
    if (!decodedClaims) {
        return { success: false, error: 'Unauthorized' };
    }

    const validation = formSchema.safeParse(values);
    if (!validation.success) {
        return { success: false, error: 'Invalid data' };
    }
    
    const { firstName, lastName, purok } = validation.data;
    const barangayId = decodedClaims.barangayId || 'TEST-BARANGAY-1';
    const adminDb = getAdminDb();

    try {
        await adminDb.collection('residents').add({
            fullName: {
                first: firstName,
                last: lastName,
                middle: '',
            },
            displayName: `${lastName.toUpperCase()}, ${firstName}`,
            displayNameLower: `${lastName.toLowerCase()}, ${firstName.toLowerCase()}`,
            addressSnapshot: {
                purok: purok,
                addressLine: '',
            },
            barangayId: barangayId,
            rbiId: `RBI-${Date.now()}`,
            sex: 'Unknown',
            civilStatus: 'Unknown',
            status: 'active',
            createdBy: decodedClaims.uid,
            updatedBy: decodedClaims.uid,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        });
        return { success: true };
    } catch (error) {
        console.error("Error adding resident:", error);
        return { success: false, error: 'Failed to add resident.' };
    }
}

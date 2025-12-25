'use server'

import { z } from 'zod';
import { getAdminDb } from '@/lib/firebase/admin';
import { verifySessionCookie } from '@/lib/firebase/auth';
import { revalidatePath } from 'next/cache';

const formSchema = z.object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    purok: z.string().min(1),
});

async function resolveBarangayId(uid: string, claims: { barangayId?: string }): Promise<string | null> {
    // First check claims
    if (claims?.barangayId) {
        return claims.barangayId;
    }

    // Then check user profile documents
    try {
        const adminDb = getAdminDb();
        const userDocRef = adminDb.doc(`users/${uid}`);
        const userProfileRef = adminDb.doc(`userProfiles/${uid}`);

        const [userDoc, userProfileDoc] = await Promise.all([
            userDocRef.get(),
            userProfileRef.get()
        ]);

        const barangayId = 
            (userDoc.data() as { barangayId?: string } | undefined)?.barangayId ||
            (userProfileDoc.data() as { barangayId?: string } | undefined)?.barangayId;

        return barangayId || null;
    } catch (error) {
        console.error("[addResident] Error resolving barangayId:", error);
        return null;
    }
}

export async function addResident(values: z.infer<typeof formSchema>) {
    let decodedClaims;
    
    try {
        decodedClaims = await verifySessionCookie();
    } catch (error) {
        console.error("[addResident] Error verifying session:", error);
        return { success: false, error: 'Session verification failed. Please log in again.' };
    }
    
    if (!decodedClaims?.uid) {
        return { success: false, error: 'Unauthorized. Please log in.' };
    }

    // Resolve barangayId from claims or user profile
    const barangayId = await resolveBarangayId(
        decodedClaims.uid,
        decodedClaims as { barangayId?: string }
    );

    if (!barangayId) {
        return { success: false, error: 'No barangay assigned to this account. Please contact an admin.' };
    }

    const validation = formSchema.safeParse(values);
    if (!validation.success) {
        const errorMessages = validation.error.errors.map(e => e.message).join(', ');
        return { success: false, error: `Invalid data: ${errorMessages}` };
    }
    
    const { firstName, lastName, purok } = validation.data;

    try {
        const adminDb = getAdminDb();
        const residentsRef = adminDb.collection('residents');
        
        const newResident = {
            fullName: {
                first: firstName.trim(),
                last: lastName.trim(),
                middle: '',
            },
            displayName: `${lastName.trim().toUpperCase()}, ${firstName.trim()}`,
            displayNameLower: `${lastName.trim().toLowerCase()}, ${firstName.trim().toLowerCase()}`,
            addressSnapshot: {
                purok: purok.trim(),
                addressLine: '',
            },
            barangayId: barangayId,
            rbiId: `RBI-${Date.now()}`,
            sex: 'Unknown',
            civilStatus: 'Unknown',
            status: 'active',
            createdBy: decodedClaims.uid,
            updatedBy: decodedClaims.uid,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        
        const docRef = await residentsRef.add(newResident);
        console.log("[addResident] Successfully created resident:", docRef.id);
        
        // Revalidate the residents page to show the new data
        revalidatePath('/residents');
        
        return { success: true, id: docRef.id };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error("[addResident] Error adding resident:", errorMessage);
        return { success: false, error: 'Failed to add resident. Please try again.' };
    }
}

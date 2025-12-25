import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { verifySessionCookie } from '@/lib/firebase/auth';
import { getAdminDb } from '@/lib/firebase/admin';
import { redirect } from 'next/navigation';

type ResidentData = {
    id?: string;
    displayName?: string;
    addressSnapshot?: {
        purok?: string;
        addressLine?: string;
    };
    fullName?: {
        first?: string;
        last?: string;
        middle?: string;
    };
    status?: string;
    [key: string]: unknown;
};

async function getResidents(barangayId: string): Promise<ResidentData[]> {
    try {
        const adminDb = getAdminDb();
        const snapshot = await adminDb
            .collection('residents')
            .where('barangayId', '==', barangayId)
            .orderBy('displayName', 'asc')
            .limit(200)
            .get();

        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        } as ResidentData));
    } catch (error: unknown) {
        // Handle missing index or permission errors gracefully
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("[residents] Error fetching residents:", errorMessage);
        
        // If it's an index error, try without ordering
        if (errorMessage.includes('index')) {
            try {
                const adminDb = getAdminDb();
                const snapshot = await adminDb
                    .collection('residents')
                    .where('barangayId', '==', barangayId)
                    .limit(200)
                    .get();
                return snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data()
                } as ResidentData));
            } catch (retryError) {
                console.error("[residents] Retry without order also failed:", retryError);
            }
        }
        
        // Return empty array instead of throwing - let the UI handle empty state
        return [];
    }
}

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
        console.error("[residents] Error resolving barangayId:", error);
        return null;
    }
}

export default async function ResidentsPageContent() {
    let decodedClaims;
    
    try {
        decodedClaims = await verifySessionCookie();
    } catch (error) {
        console.error('[residents] Error verifying session cookie:', error);
        // Don't redirect immediately - let the client-side auth handle it
        decodedClaims = null;
    }

    if (!decodedClaims?.uid) {
        console.log('[residents] No valid session found, redirecting to login');
        return redirect('/login');
    }

    const resolvedBarangayId = await resolveBarangayId(
        decodedClaims.uid,
        decodedClaims as { barangayId?: string }
    );

    if (!resolvedBarangayId) {
        console.log('[residents] barangay not configured for uid', decodedClaims.uid);
        return (
            <div className="mx-auto w-full max-w-3xl p-4 md:p-6">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-center space-y-3">
                    <h1 className="text-xl font-semibold text-zinc-100">Barangay not configured</h1>
                    <p className="text-sm text-zinc-400">
                        This account does not have an assigned barangay. Please try again or contact an admin.
                    </p>
                    <div className="flex justify-center gap-3">
                        <Link href="/apps" passHref>
                            <Button variant="outline">Back</Button>
                        </Link>
                        <Link href="/residents" passHref>
                            <Button>Try again</Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    console.log('[residents] resolved barangayId', resolvedBarangayId);
    const residents = await getResidents(resolvedBarangayId);

    return (
        <div className="mx-auto w-full max-w-3xl p-4 md:p-6">
            <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-100">Resident Records</h1>
                    <p className="text-zinc-400 text-sm mt-1">Directory of all constituents.</p>
                </div>
                <Link href="/residents/new" passHref>
                    <Button className="bg-zinc-100 text-zinc-950 hover:bg-zinc-200">+ Add New Resident</Button>
                </Link>
            </div>
            
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
              <div className="text-xs text-zinc-400">
                {residents.length} resident(s) found
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {residents.length === 0 ? (
                 <div className="text-center p-12 border-2 border-dashed border-zinc-800 rounded-xl">
                    <p className="font-semibold text-lg text-zinc-100">No Residents Found</p>
                    <p className="mt-4 text-zinc-400">Click "+ Add New Resident" to get started.</p>
                </div>
              ) : (
                residents.map((r) => {
                  const displayName = r.displayName || 
                    (r.fullName ? `${r.fullName.last?.toUpperCase() || ''}, ${r.fullName.first || ''}` : 'Unknown');
                  const purok = r.addressSnapshot?.purok || 'N/A';
                  const residentId = r.id || 'unknown';
                  
                  return (
                    <Link 
                      href={`/residents/${residentId}`}
                      key={residentId}
                      className="block w-full rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-left hover:bg-zinc-800/50 transition-colors"
                    >
                      <div className="font-semibold text-zinc-100">{displayName}</div>
                      <div className="text-zinc-400 text-xs mt-1">
                        {purok} • ID: {residentId.length > 8 ? `${residentId.slice(0, 8)}...` : residentId}
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
      </div>
    );
}
